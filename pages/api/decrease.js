import connectMongo from "@/pages/api/lib/mongodb";
import User from "@/pages/api/lib/models/users";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { username, group, testName } = req.body;

  if (!username || !group || !testName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await connectMongo();

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the groupAttempt entry
    const groupAttempt = user.groupAttempts.find(g => g.group === group);
    if (!groupAttempt) {
      return res.status(404).json({ error: "Group not found for this user" });
    }

    // Find the testAttempt entry
    const testAttempt = groupAttempt.tests.find(t => t.testName === testName);
    if (!testAttempt) {
      return res.status(404).json({ error: "Test not found in the group" });
    }

    // Check remaining attempts
    if (testAttempt.remainingAttempts <= 0) {
      return res.status(400).json({ error: "No remaining attempts for this test" });
    }

    // Decrement remainingAttempts
    testAttempt.remainingAttempts -= 1;

    // Save updated user document
    await user.save();

    return res.status(200).json({
      message: "Attempt decreased successfully",
      remainingAttempts: testAttempt.remainingAttempts,
    });
  } catch (error) {
    console.error("Error decreasing attempt:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
