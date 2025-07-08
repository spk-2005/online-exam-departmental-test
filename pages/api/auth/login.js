// pages/api/auth/login.js
import connectMongo from "@/pages/lib/mongodb";
import User from "@/pages/models/users";
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectMongo();
    console.log("✅ Connected to Mongo");

    const { username, password } = req.body;
    console.log("Received request ➝", username, password);

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Simple string comparison instead of bcrypt
    if (user.password !== password) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key', // Use environment variable
      { expiresIn: '24h' }
    );

    console.log("✅ Login success");
    res.status(200).json({ 
      message: "Login successful", 
      user: { username: user.username },
      token
    });
  } catch (error) {
    console.error("🔥 Server error ➝", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}