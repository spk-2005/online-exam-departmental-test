import mongoose from 'mongoose';

const SampleTestSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },  // Example: ["A", "B", "C", "D"]
  correct: { type: String, required: true },    // One of the options
  test: { type: String, required: true }        // Example: "Test-1"
}, { timestamps: true });

export default mongoose.models.SampleTest || mongoose.model("SampleTest",SampleTestSchema);
