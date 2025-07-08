import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },  // Example: ["A", "B", "C", "D"]
  correct: { type: String, required: true },    // One of the options
  group: { type: String, required: true },      // Example: "Group-1"
  test: { type: String, required: true }        // Example: "Test-1"
}, { timestamps: true });

export default mongoose.models.Test || mongoose.model("Test", TestSchema);
