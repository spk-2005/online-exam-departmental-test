import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    maxLength: [50, 'Username cannot exceed 50 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10,15}$/.test(v);
      },
      message: 'Phone number must be between 10-15 digits'
    }
  },
  screenshot: {
    type: String, // This will store the file path or URL
    required: [true, 'Payment screenshot is required']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    trim: true,
    unique: true,
    maxLength: [50, 'Transaction ID cannot exceed 50 characters']
  },
  selectedGroup: {
    type: Number,
    required: [true, 'Selected group is required'],
    min: [1, 'Group must be between 1 and 4'],
    max: [4, 'Group must be between 1 and 4']
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

// Create index for faster queries
PaymentSchema.index({ phoneNumber: 1 });
PaymentSchema.index({ username: 1 });
PaymentSchema.index({ selectedGroup: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);