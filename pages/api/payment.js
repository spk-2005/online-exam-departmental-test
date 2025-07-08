// pages/api/payments.js
import connectMongo from '@/pages/api/lib/mongodb';
import Payment from '@/pages/api/lib/models/Payment';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'public/uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to run multer middleware
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

// Disable the default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Handle CORS for frontend requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      await connectMongo();
      const payments = await Payment.find({}).sort({ createdAt: -1 }).lean();
      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payments' });
    }
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await connectMongo();

    // Run multer middleware
    await runMiddleware(req, res, upload.single('screenshot'));

    // Extract form data
    const { username, name, phoneNumber, transactionId, selectedGroup } = req.body;

    // Validate required fields
    if (!username || !name || !phoneNumber || !transactionId || !selectedGroup || !req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required: username, name, phoneNumber, transactionId, selectedGroup, and screenshot' 
      });
    }

    // Validate phone number format
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ 
        success: false,
        error: 'Phone number must be between 10-15 digits' 
      });
    }

    // Check if transaction ID already exists
    const existingPayment = await Payment.findOne({ transactionId: transactionId.trim() }).lean();
    if (existingPayment) {
      return res.status(400).json({ 
        success: false,
        error: 'Transaction ID already exists' 
      });
    }

    // Validate selectedGroup
    const groupNumber = parseInt(selectedGroup);
    if (isNaN(groupNumber) || groupNumber < 1 || groupNumber > 4) {
      return res.status(400).json({ 
        success: false,
        error: 'Selected group must be between 1 and 4' 
      });
    }

    // Create new payment record
    const payment = new Payment({
      username: username.trim(),
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      screenshot: `/uploads/${req.file.filename}`, // Store relative path
      transactionId: transactionId.trim(),
      selectedGroup: groupNumber
    });

    const savedPayment = await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment details saved successfully',
      data: {
        id: savedPayment._id,
        username: savedPayment.username,
        name: savedPayment.name,
        phoneNumber: savedPayment.phoneNumber,
        transactionId: savedPayment.transactionId,
        selectedGroup: savedPayment.selectedGroup,
        screenshot: savedPayment.screenshot,
        createdAt: savedPayment.createdAt,
        updatedAt: savedPayment.updatedAt
      }
    });

  } catch (error) {
    console.error('Error saving payment:', error);
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File size too large. Maximum size is 5MB' 
      });
    }
    
    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({ 
        success: false,
        error: 'Only image files are allowed' 
      });
    }
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed', 
        details: errors 
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Transaction ID already exists' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}