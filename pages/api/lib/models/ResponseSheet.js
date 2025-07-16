// lib/models/ResponseSheet.js
import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true
  },
  group: {
    type: String,
    required: true
  },
  test: {
    type: String,
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  correctOption: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  selectedOption: {
    type: String,
    required: false,
    default: null
  },
  isCorrect: {
    type: Boolean,
    required: false,
    default: null
  },
  markedForReview: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['answered', 'not-answered', 'review', 'answered-marked', 'not-visited'],
    required: true
  },
  submittedAt: {
    type: Date,
    required: true
  },
  submittedDate: {
    type: String,
    required: true
  },
  submittedTime: {
    type: String,
    required: true
  },
  timeTaken: {
    type: String,
    required: true
  },
  timeElapsed: {
    type: Number,
    required: true
  }
}, { 
  timestamps: true,
  collection: 'responses'
});

// Compound index for efficient querying
ResponseSchema.index({ username: 1, group: 1, test: 1, questionId: 1 }, { unique: true });

// Additional indexes for analytics
ResponseSchema.index({ group: 1, test: 1, submittedAt: -1 });
ResponseSchema.index({ username: 1, submittedAt: -1 });
ResponseSchema.index({ status: 1, isCorrect: 1 });

export default mongoose.models?.Response || mongoose.model("Response", ResponseSchema);