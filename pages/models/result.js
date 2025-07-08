import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  name: String,
  group: String,
  test: String,
  score: Number,
  attempted: Number,
  unattempted: Number,
  total: Number,
  percentage: Number,
  finalresult: String,
  timeTaken: String,
}, { timestamps: true });

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);
