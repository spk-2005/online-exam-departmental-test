// pages/api/payment.js
import Payment from '@/pages/api/lib/models/Payment.js';
import connectMongo from '@/pages/api/lib/mongodb';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '5mb', // Set body-parser limit to handle large Base64 strings
        },
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

    try {
        // Connect to MongoDB
        await connectMongo();
        console.log('Connected to MongoDB successfully');

        // Extract data directly from JSON body
        const { name, phoneNumber, selectedGroups, screenshot } = req.body;

        console.log('Received data (from frontend):', {
            name,
            phoneNumber,
            selectedGroups,
            screenshot: screenshot ? `Base64 string (length: ${screenshot.length} characters)` : 'No screenshot provided'
        });

        // --- Validation ---
        const errors = [];

        if (!name || typeof name !== 'string' || !name.trim()) {
            errors.push('Name is required');
        } else if (name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        } else if (name.trim().length > 50) {
            errors.push('Name must be less than 50 characters');
        }

        if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
            errors.push('Phone number is required');
        } else if (!/^\d{10,15}$/.test(phoneNumber.trim())) {
            errors.push('Phone number must be between 10-15 digits');
        }

        if (!selectedGroups || !Array.isArray(selectedGroups) || selectedGroups.length === 0) {
            errors.push('Please select at least one test group');
        } else {
            // Optional: Validate if selectedGroups contain valid group names if needed
            // For example: const validGroupNames = ['EOT GROUP', 'GOT GROUP', ...];
            // if (selectedGroups.some(group => !validGroupNames.includes(group))) {
            //    errors.push('One or more selected groups are invalid.');
            // }
        }

        // --- Screenshot Validation for Base64 ---
        if (!screenshot || typeof screenshot !== 'string') {
            errors.push('Payment screenshot (Base64) is required');
        } else {
            const base64Prefix = 'data:image/';
            console.log('Screenshot starts with data:image/ prefix:', screenshot.startsWith(base64Prefix));

            if (!screenshot.startsWith(base64Prefix)) {
                errors.push('Screenshot must be a valid Base64 image (e.g., starts with "data:image/")');
            } else {
                // Extract the actual image type from the Base64 string
                const commaIndex = screenshot.indexOf(';base64,');
                let mimeTypePart = '';
                if (commaIndex !== -1) {
                    mimeTypePart = screenshot.substring(base64Prefix.length, commaIndex);
                } else {
                    // This case means it starts with data:image/ but has no ;base64, which is malformed
                    errors.push('Invalid Base64 image format: missing ";base64," separator.');
                }

                console.log('Extracted mimeTypePart:', mimeTypePart);
                const allowedImageTypes = ['jpeg', 'jpg', 'png', 'gif']; // Just the subtype
                console.log('Allowed image types:', allowedImageTypes);
                console.log('Is extracted mimeTypePart included in allowed types:', allowedImageTypes.includes(mimeTypePart));

                if (!allowedImageTypes.includes(mimeTypePart)) {
                    errors.push('Please select a valid image file (PNG, JPG, JPEG, GIF)');
                }

                // Estimate size (Base64 is about 33% larger than binary data)
                const base64Content = screenshot.split(',')[1];
                if (base64Content) {
                    const estimatedSizeInBytes = (base64Content.length * 0.75); // Approximate
                    const MAX_SIZE_MB = 5;
                    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
                    console.log(`Estimated screenshot size: ${(estimatedSizeInBytes / (1024 * 1024)).toFixed(2)} MB (Max: ${MAX_SIZE_MB}MB)`);

                    if (estimatedSizeInBytes > MAX_SIZE_BYTES) {
                        errors.push(`File size must be less than ${MAX_SIZE_MB}MB`);
                    }
                } else {
                    errors.push('Invalid Base64 image content (missing data after comma)');
                }
            }
        }

        if (errors.length > 0) {
            console.log('Validation errors:', errors);
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        // Check for existing phone number to prevent duplicates
        const existingPayment = await Payment.findOne({ phoneNumber: phoneNumber.trim() });
        if (existingPayment) {
            console.log('Duplicate phone number detected:', phoneNumber.trim());
            return res.status(400).json({
                error: 'Duplicate entry',
                message: 'This phone number is already registered. Please use a different phone number.'
            });
        }

        console.log('Creating payment record...');

        // Create new payment record
        const newPayment = new Payment({
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            selectedGroups: selectedGroups,
            screenshot: screenshot, // Store Base64 directly
            status: 'pending'
        });

        const savedPayment = await newPayment.save();
        console.log('Payment saved to database with ID:', savedPayment._id);

        // Send notification after successful database save
        try {
            console.log('Sending notification...');

            const notificationPayload = {
                name: savedPayment.name,
                phoneNumber: savedPayment.phoneNumber,
                selectedGroups: savedPayment.selectedGroups,
                screenshot: savedPayment.screenshot, // Send the Base64 directly
                isUpdate: false
            };

            // Truncate screenshot for console log to avoid flooding it with long strings
            console.log('Notification payload (screenshot truncated for log):', {
                ...notificationPayload,
                screenshot: notificationPayload.screenshot ? notificationPayload.screenshot.substring(0, 100) + '...' : 'N/A'
            });

            // Call Netlify function or your notification service
            const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://departmental-tests.netlify.app'}/.netlify/functions/notify`, {
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
                // Important: Do NOT throw an error here, the main request should succeed
                // even if the notification fails. Just log the error.
            }

        } catch (notificationError) {
            console.error('Notification error caught:', notificationError);
            // Important: Do NOT throw an error here, the main request should succeed
            // even if the notification fails. Just log the error.
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
        console.error('API Error (caught in payment.js):', error);

        // Handle MongoDB duplicate key error (11000)
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Duplicate entry',
                message: 'This phone number is already registered. Please use a different phone number or contact support.'
            });
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            console.error('Mongoose Validation Errors:', validationErrors);
            return res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
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