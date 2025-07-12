import mongoose from 'mongoose';

const { Schema } = mongoose;

const IssueSchema = new Schema({
    // Store the username (Required)
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
    },
    
    // The detailed description of the issue (Required)
    message: {
        type: String,
        required: [true, 'Message is required'],
        minlength: [10, 'Message must be at least 10 characters']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Use existing model if it exists, otherwise create a new one
export default mongoose.models.Issue || mongoose.model('Issue', IssueSchema);