import connectMongo from "@/pages/api/lib/mongodb";
import Result from "@/pages/api/lib/models/result";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectMongo();
    
    // Save the result
    const result = await Result.create(req.body);
    
    console.log(`Result saved successfully for user: ${req.body.name}`);
    
    res.status(201).json({
      message: "Result saved successfully",
      result,
      success: true
    });
    
  } catch (err) {
    console.error("Error in submit handler:", err);
    res.status(500).json({ 
      message: "Error saving result", 
      error: err.message,
      success: false 
    });
  }
}