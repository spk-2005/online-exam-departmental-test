// pages/api/lib/models/Payment.js
import mongoose from 'mongoose';

// Define the Payment schema
const PaymentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    // The screenshot field stores the file path
    screenshot: {
        type: String,
        required: true,
    },
    // Define selectedGroups as an array of strings to accept group names
    selectedGroups: {
        type: [String], 
        required: true,
    },
}, { 
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true 
});

// Check if the model already exists before creating it (Next.js hot reload safety)
export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);