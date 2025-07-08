const mongoose = require("mongoose");

const GroupTestSchema = new mongoose.Schema({
  group: { type: String, required: true, unique: true },
  tests: [{ type: String, required: true }],
});

module.exports = mongoose.models.GroupTest || mongoose.model("GroupTest", GroupTestSchema);
