// pages/api/payment.js
import connectMongo from '@/pages/api/lib/mongodb';
import Payment from '@/pages/api/lib/models/Payment';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// --- Multer Configuration ---

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');

// Helper function to ensure directory exists (optional, but good practice)
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
        // Create a unique filename with the original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
    },
});

const upload = multer({ storage });

// --- Middleware Helper ---

// Next.js API routes require a custom way to run Multer as middleware
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

// --- Next.js Config (Required for Multer) ---

export const config = {
    api: {
        bodyParser: false, // Disable Next.js body parser to allow Multer to handle it
    },
};

// --- API Handler ---

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // 1. Connect to MongoDB
        await connectMongo();
        console.log('MongoDB connected successfully.');

        // 2. Process file upload using Multer middleware
        await runMiddleware(req, res, upload.single('screenshot'));

        // 3. Extract data from the body and validate
        const { name, phoneNumber, selectedGroups } = req.body;
        
        let parsedSelectedGroups;
        try {
            parsedSelectedGroups = JSON.parse(selectedGroups);
            
            // VALIDATION MODIFICATION: 
            // Check if it is an array, has content, AND every item is a valid string.
            if (!Array.isArray(parsedSelectedGroups) || parsedSelectedGroups.length === 0 || 
                !parsedSelectedGroups.every(group => typeof group === 'string' && group.trim() !== '')) {
                throw new Error('Invalid format or missing groups for selectedGroups');
            }
        } catch (e) {
            console.error("Invalid group data format:", e.message);
            // Delete the uploaded file if validation fails after upload
            if (req.file) {
                await fs.unlink(req.file.path).catch(err => console.error("Failed to delete temp file:", err));
            }
            return res.status(400).json({ 
                success: false,
                error: 'Invalid or missing group selection format',
                details: ['Please select a valid test group.']
            });
        }
        
        if (!name || !phoneNumber || !req.file) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(err => console.error("Failed to delete temp file:", err));
            }
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields or screenshot.',
            });
        }

        // Basic phone number validation
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(err => console.error("Failed to delete temp file:", err));
            }
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid phone number format.',
                details: ['Phone number must be 10-15 digits.']
            });
        }

        // 4. Create new payment record and save to MongoDB
        const payment = new Payment({
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            // Store the path to the saved file in the database
            screenshot: `/uploads/${req.file.filename}`, 
            // This will now successfully store the array of strings
            selectedGroups: parsedSelectedGroups 
        });

        const savedPayment = await payment.save();
        console.log('Payment record saved to MongoDB:', savedPayment._id);

        // 5. Trigger the notification API route asynchronously.
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
            message: 'Payment details saved successfully. Notification triggered asynchronously.',
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
        
        // If an error occurred after the file was uploaded but before the database save, try to delete the file
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => console.error("Failed to delete temp file during error handling:", err));
        }

        // Ensure a response is sent if the headers haven't been sent already
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Internal Server Error.' });
        }
    }
}