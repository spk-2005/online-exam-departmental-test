// pages/api/payment.js
import connectMongo from '@/pages/api/lib/mongodb';
import Payment from '@/pages/api/lib/models/Payment';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// --- Multer Configuration (No Change) ---

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');

// Helper function to ensure directory exists
async function ensureUploadDir() {
    try {
        await fs.access(uploadDir);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(uploadDir, { recursive: true });
            console.log('Created uploads directory.');
        } else {
            throw error;
        }
    }
}

// Multer disk storage configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureUploadDir();
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
    },
});

const upload = multer({ storage });

// --- Middleware Helper (No Change) ---

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

// --- Next.js Config (No Change) ---

export const config = {
    api: {
        bodyParser: false, // Disable Next.js body parser to allow Multer to handle it
    },
};

// --- API Handler (Modified to use findOneAndUpdate with upsert) ---

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Variable to store the path of the uploaded file if needed for cleanup
    let uploadedFilePath = null;

    try {
        // 1. Connect to MongoDB
        await connectMongo();
        console.log('MongoDB connected successfully.');

        // 2. Process file upload using Multer middleware
        await runMiddleware(req, res, upload.single('screenshot'));

        // Store the uploaded file path for potential cleanup later if an error occurs
        if (req.file) {
            uploadedFilePath = req.file.path;
        }

        // 3. Extract data from the body and validate
        const { name, phoneNumber, selectedGroups } = req.body;
        
        let parsedSelectedGroups;
        try {
            parsedSelectedGroups = JSON.parse(selectedGroups);
            
            // VALIDATION: Check if it is an array, has content, AND every item is a valid string.
            if (!Array.isArray(parsedSelectedGroups) || parsedSelectedGroups.length === 0 || 
                !parsedSelectedGroups.every(group => typeof group === 'string' && group.trim() !== '')) {
                throw new Error('Invalid format or missing groups for selectedGroups');
            }
        } catch (e) {
            console.error("Invalid group data format:", e.message);
            // Delete the uploaded file if validation fails after upload
            if (uploadedFilePath) {
                await fs.unlink(uploadedFilePath).catch(err => console.error("Failed to delete temp file:", err));
            }
            return res.status(400).json({ 
                success: false,
                error: 'Invalid or missing group selection format',
                details: ['Please select a valid test group.']
            });
        }
        
        if (!name || !phoneNumber || !uploadedFilePath) {
            if (uploadedFilePath) {
                await fs.unlink(uploadedFilePath).catch(err => console.error("Failed to delete temp file:", err));
            }
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields or screenshot.',
            });
        }

        // Basic phone number validation
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            if (uploadedFilePath) {
                await fs.unlink(uploadedFilePath).catch(err => console.error("Failed to delete temp file:", err));
            }
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid phone number format.',
                details: ['Phone number must be 10-15 digits.']
            });
        }

        // 4. Implement Upsert Logic: Find by phoneNumber and update or create
        const paymentData = {
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            // Store the public path to the saved file
            screenshot: `/uploads/${path.basename(uploadedFilePath)}`, 
            selectedGroups: parsedSelectedGroups,
            // We ensure we update the updatedAt field on every submission
            updatedAt: new Date()
        };
        
        // Find a payment record by phoneNumber. If found, update it. If not, create it.
        const savedPayment = await Payment.findOneAndUpdate(
            { phoneNumber: paymentData.phoneNumber }, // Filter: Find by phone number
            paymentData, // Data to update/insert
            { 
                new: true, // Return the updated document
                upsert: true, // Create if it doesn't exist (UPSERT)
                setDefaultsOnInsert: true // Applies schema defaults if inserting
            }
        );

        console.log('Payment record processed (Upserted). ID:', savedPayment._id);

        // 5. Trigger the notification API route asynchronously.
        // (No change to notification logic)
        fetch('http://localhost:3000/api/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: savedPayment.name,
                phoneNumber: savedPayment.phoneNumber,
                selectedGroups: savedPayment.selectedGroups,
                screenshot: savedPayment.screenshot
            }),
        })
        .catch(notificationError => {
            console.error('Error during asynchronous notification API call:', notificationError.message);
        });

        // 6. Send success response to the client immediately
        res.status(201).json({
            success: true,
            message: 'Payment details saved/updated successfully. Notification triggered asynchronously.',
            data: {
                id: savedPayment._id,
                name: savedPayment.name,
                phoneNumber: savedPayment.phoneNumber,
                selectedGroups: savedPayment.selectedGroups,
                screenshot: savedPayment.screenshot,
                createdAt: savedPayment.createdAt,
                updatedAt: savedPayment.updatedAt
            }
        });

    } catch (error) {
        // General error handling
        console.error('Server Error during payment processing:', error);
        
        // If an error occurred and a file was uploaded, try to delete the file
        if (uploadedFilePath) {
            await fs.unlink(uploadedFilePath).catch(err => console.error("Failed to delete uploaded file during error handling:", err));
        }

        // Send a specific error code if we detect a database duplicate key error (code 11000)
        // Although upsert should prevent most duplicate key errors based on phoneNumber, 
        // this is good practice for general database errors.
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: 'A record with this phone number already exists.' });
        }

        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Internal Server Error.' });
        }
    }
}