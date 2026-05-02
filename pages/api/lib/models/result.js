import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  name: { type: String, index: true },
  group: { type: String, index: true },
  test: { type: String, index: true },
  score: Number,
  attempted: Number,
  unattempted: Number,
  total: Number,
  percentage: { type: Number, index: true },
  finalresult: String,
  timeTaken: String,
}, { timestamps: true });

// Compound index for frequent filtering + sorting
ResultSchema.index({ group: 1, test: 1, percentage: -1 });
ResultSchema.index({ createdAt: -1 });

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);
