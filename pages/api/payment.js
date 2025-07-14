// pages/api/payment.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import Payment from '@/pages/api/lib/models/Payment.js'
import connectMongo from '@/pages/api/lib/mongodb';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Only POST requests are allowed' 
        });
    }

    let form;
    let fields = {};
    let files = {};

    try {
        // Connect to MongoDB first
        await connectMongo();
        console.log('Connected to MongoDB successfully');

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('Created upload directory:', uploadDir);
        }

        // Configure formidable
        form = formidable({
            uploadDir: uploadDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            filename: (name, ext, part) => {
                return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
            },
            filter: ({ mimetype }) => {
                return mimetype && mimetype.startsWith('image/');
            }
        });

        // Parse form data
        [fields, files] = await form.parse(req);
        console.log('Form parsed successfully');
        console.log('Fields:', fields);
        console.log('Files:', Object.keys(files));

        // Extract and validate data
        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
        const phoneNumber = Array.isArray(fields.phoneNumber) ? fields.phoneNumber[0] : fields.phoneNumber;
        const selectedGroups = Array.isArray(fields.selectedGroups) ? fields.selectedGroups[0] : fields.selectedGroups;
        const screenshot = Array.isArray(files.screenshot) ? files.screenshot[0] : files.screenshot;

        console.log('Extracted data:', {
            name,
            phoneNumber,
            selectedGroups,
            screenshot: screenshot ? screenshot.originalFilename : 'No file'
        });

        // Validation
        const errors = [];

        if (!name || !name.trim()) {
            errors.push('Name is required');
        } else if (name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        } else if (name.trim().length > 50) {
            errors.push('Name must be less than 50 characters');
        }

        if (!phoneNumber || !phoneNumber.trim()) {
            errors.push('Phone number is required');
        } else if (!/^\d{10,15}$/.test(phoneNumber.trim())) {
            errors.push('Phone number must be between 10-15 digits');
        }

        if (!selectedGroups) {
            errors.push('Selected groups are required');
        } else {
            try {
                const parsedGroups = JSON.parse(selectedGroups);
                if (!Array.isArray(parsedGroups) || parsedGroups.length === 0) {
                    errors.push('Please select at least one test group');
                }
            } catch (e) {
                errors.push('Invalid group selection format');
            }
        }

        if (!screenshot) {
            errors.push('Payment screenshot is required');
        } else {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(screenshot.mimetype)) {
                errors.push('Please select a valid image file (PNG, JPG, JPEG, GIF)');
            }

            if (screenshot.size > 5 * 1024 * 1024) {
                errors.push('File size must be less than 5MB');
            }
        }

        if (errors.length > 0) {
            // Clean up uploaded file if validation fails
            if (screenshot && screenshot.filepath) {
                try {
                    fs.unlinkSync(screenshot.filepath);
                    console.log('Cleaned up file due to validation errors');
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }

            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        const parsedGroups = JSON.parse(selectedGroups);
        const fileName = path.basename(screenshot.filepath);
        const publicPath = `/uploads/${fileName}`;

        console.log('Creating payment record...');

        // Create new payment record
        const newPayment = new Payment({
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            selectedGroups: parsedGroups,
            screenshot: publicPath,
            status: 'pending'
        });

        const savedPayment = await newPayment.save();
        console.log('Payment saved to database:', savedPayment._id);

        // Send notification after successful database save
        try {
            console.log('Sending notification...');
            
            const notificationPayload = {
                name: savedPayment.name,
                phoneNumber: savedPayment.phoneNumber,
                selectedGroups: savedPayment.selectedGroups,
                screenshot: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://departmental-tests.netlify.app/'}${publicPath}`,
                isUpdate: false
            };

            console.log('Notification payload:', notificationPayload);

            // Call Netlify function or your notification service
            const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://departmental-tests.netlify.app/'}/.netlify/functions/notify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationPayload)
            });

            const notificationResult = await notificationResponse.json();
            console.log('Notification response:', notificationResult);

            if (!notificationResponse.ok) {
                console.error('Notification failed:', notificationResult);
                // Don't fail the main request if notification fails
            }

        } catch (notificationError) {
            console.error('Notification error:', notificationError);
            // Don't fail the main request if notification fails
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Payment details submitted successfully',
            data: {
                id: savedPayment._id,
                name: savedPayment.name,
                phoneNumber: savedPayment.phoneNumber,
                selectedGroups: savedPayment.selectedGroups,
                status: savedPayment.status,
                submittedAt: savedPayment.createdAt
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        
        // Handle MongoDB duplicate key error (11000)
        if (error.code === 11000) {
            // Clean up uploaded file on duplicate error
            if (files.screenshot) {
                const screenshot = Array.isArray(files.screenshot) ? files.screenshot[0] : files.screenshot;
                if (screenshot && screenshot.filepath) {
                    try {
                        fs.unlinkSync(screenshot.filepath);
                        console.log('Cleaned up file due to duplicate error');
                    } catch (cleanupError) {
                        console.error('Error cleaning up file:', cleanupError);
                    }
                }
            }
            
            return res.status(400).json({
                error: 'Duplicate entry',
                message: 'This phone number is already registered. Please use a different phone number or contact support.'
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // Handle file upload errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: 'File size must be less than 5MB'
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Invalid file',
                message: 'Only image files are allowed'
            });
        }

        if (error.code === 'ENOENT') {
            return res.status(500).json({
                error: 'File system error',
                message: 'Could not create upload directory'
            });
        }

        // Handle formidable parsing errors
        if (error.message && error.message.includes('maxFileSize')) {
            return res.status(400).json({
                error: 'File too large',
                message: 'File size must be less than 5MB'
            });
        }

        if (error.message && error.message.includes('filter')) {
            return res.status(400).json({
                error: 'Invalid file type',
                message: 'Only image files are allowed'
            });
        }

        // Generic error response
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Something went wrong processing your request',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
}