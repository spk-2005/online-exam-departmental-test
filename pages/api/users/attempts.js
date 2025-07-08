import connectMongo from "@/pages/lib/mongodb";
import User from "@/pages/models/users";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  await connectMongo();

  const { username } = req.query;

  if (!username)
    return res.status(400).json({ message: "Username is required" });

  const user = await User.findOne({ username }).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ groupAttempts: user.groupAttempts });
}
