  // pages/api/lib/models/Payment.js
  import mongoose from 'mongoose';

  const { Schema } = mongoose;

  const PaymentSchema = new Schema({
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name must be less than 50 characters'],
      validate: {
        validator: function(name) {
          return /^[a-zA-Z\s]+$/.test(name);
        },
        message: 'Name can only contain letters and spaces'
      }
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique:true,
      trim: true,
      validate: {
        validator: function(phone) {
          return /^\d{10,15}$/.test(phone);
        },
        message: 'Phone number must be between 10-15 digits'
      }
    },
    selectedGroups: {
      type: [String],
      required: [true, 'Groups are required'],
      validate: {
        validator: function(groups) {
          const validGroups = [
            'EOT GROUP', 
            'GOT GROUP', 
            'EOT & GOT GROUP', 
            'CODE 8 & 10 GROUP', 
            'CODE 146 & 148 GROUP'
          ];
          return groups.length > 0 && groups.every(group => validGroups.includes(group));
        },
        message: 'Please select valid test groups'
      }
    },
    screenshot: {
      type: String,
      required: [true, 'Screenshot is required'],
      validate: {
        validator: function(screenshot) {
          return screenshot.startsWith('/uploads/') && /\.(jpg|jpeg|png|gif)$/i.test(screenshot);
        },
        message: 'Screenshot must be a valid image file'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected'],
        message: 'Status must be pending, verified, or rejected'
      },
      default: 'pending',
    },
    adminNotes: {
      type: String,
      maxlength: [500, 'Admin notes must be less than 500 characters'],
      default: ''
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  }, {
    timestamps: true // This will automatically handle createdAt and updatedAt
  });

  // Index for better query performance
  PaymentSchema.index({ phoneNumber: 1 });
  PaymentSchema.index({ status: 1 });
  PaymentSchema.index({ createdAt: -1 });

  // Pre-save middleware to update the updatedAt field
  PaymentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });

  // Pre-update middleware to update the updatedAt field
  PaymentSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
    this.set({ updatedAt: new Date() });
    next();
  });

  // Instance method to mark as verified
  PaymentSchema.methods.markAsVerified = function(adminNotes = '') {
    this.status = 'verified';
    this.verifiedAt = new Date();
    this.adminNotes = adminNotes;
    return this.save();
  };

  // Instance method to mark as rejected
  PaymentSchema.methods.markAsRejected = function(adminNotes = '') {
    this.status = 'rejected';
    this.adminNotes = adminNotes;
    return this.save();
  };

  // Static method to find by phone number
  PaymentSchema.statics.findByPhoneNumber = function(phoneNumber) {
    return this.findOne({ phoneNumber: phoneNumber.trim() });
  };

  // Static method to get pending payments
  PaymentSchema.statics.getPendingPayments = function() {
    return this.find({ status: 'pending' }).sort({ createdAt: -1 });
  };

  // Static method to get statistics
  PaymentSchema.statics.getStats = function() {
    return this.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  };

  // Virtual for formatted created date
  PaymentSchema.virtual('formattedCreatedAt').get(function() {
    return this.createdAt.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  // Virtual for formatted updated date
  PaymentSchema.virtual('formattedUpdatedAt').get(function() {
    return this.updatedAt.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  // Ensure virtual fields are serialized
  PaymentSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  });

  const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

  export default Payment;