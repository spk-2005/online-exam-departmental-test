import mongoose from "mongoose";

const TestAttemptSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  remainingAttempts: { type: Number, required: true }
}, { _id: false });

const GroupAttemptSchema = new mongoose.Schema({
  group: { type: String, required: true },
  tests: [TestAttemptSchema]
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  groupAttempts: [GroupAttemptSchema],
}, { timestamps: true });


export default mongoose.models.User || mongoose.model("User", UserSchema);
