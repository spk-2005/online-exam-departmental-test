import connectMongo from '@/pages/api/lib/mongodb';
import Response from '@/pages/api/lib/models/ResponseSheet';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      message: 'Method Not Allowed',
      allowedMethods: ['GET']
    });
  }

  try {
    await connectMongo();

    const { username, group, test } = req.query;

    // Input validation
    if (!username || !group || !test) {
      return res.status(400).json({ 
        message: 'Missing required query parameters: username, group, or test.',
        requiredParams: ['username', 'group', 'test']
      });
    }

    // Sanitize input parameters
    const sanitizedUsername = username.toString().trim();
    const sanitizedGroup = group.toString().trim();
    const sanitizedTest = test.toString().trim();

    if (!sanitizedUsername || !sanitizedGroup || !sanitizedTest) {
      return res.status(400).json({ 
        message: 'Query parameters cannot be empty or contain only whitespace.'
      });
    }

    // Find all responses for the given user, group, and test
    const responses = await Response.find({ 
      username: sanitizedUsername, 
      group: sanitizedGroup, 
      test: sanitizedTest 
    }).sort({ createdAt: 1 }); // Sort by creation time for consistent order

    if (!responses || responses.length === 0) {
      return res.status(200).json({ 
        success: true, 
        responses: [],
        message: 'No responses found for this user and test.'
      });
    }

    res.status(200).json({ 
      success: true, 
      responses,
      count: responses.length
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(500).json({ 
      message: 'Internal Server Error',
      ...(isDevelopment && { error: error.message })
    });
  }
}