import connectMongo from "@/pages/api/lib/mongodb";
import Test from "@/pages/api/lib/models/test";

export default async function handler(req, res) {
  const { group, test } = req.query;

  try {
    console.log('API called with:', { group, test });
    
    if (!group || !test) {
      return res.status(400).json({ message: "Missing group or test parameter" });
    }

    await connectMongo();
    console.log('MongoDB connected successfully');
    
    const questions = await Test.find({ group, test }).lean();
    console.log('Questions found:', questions.length);
    
    res.status(200).json(questions);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}