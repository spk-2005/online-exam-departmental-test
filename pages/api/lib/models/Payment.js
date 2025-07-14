// pages/api/lib/models/Payment.js
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name must be less than 50 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        // You might have a unique index on this in MongoDB, but Mongoose unique:true is also good.
        unique: true, // Crucial for preventing duplicates
        validate: {
            validator: function(v) {
                return /^\d{10,15}$/.test(v);
            },
            message: 'Phone number must be between 10-15 digits'
        }
    },
    selectedGroups: {
        type: [String], // Array of strings
        required: [true, 'Please select at least one test group'],
        validate: {
            validator: function(arr) {
                return arr && arr.length > 0;
            },
            message: 'Please select at least one test group'
        }
    },
    screenshot: {
        type: String, // Ensure it's String
        required: [true, 'Payment screenshot (Base64) is required'],
        // REMOVE any custom 'validate' function here that checks for image validity.
        // That validation is already robustly handled in your API route (payment.js)
        // right before attempting to save to the database.
        // Mongoose validation will then only check if it's a string and required.
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// You might also want to explicitly create a unique index for phoneNumber
// on the schema level, if you haven't done it with unique: true directly.
// PaymentSchema.index({ phoneNumber: 1 }, { unique: true });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);