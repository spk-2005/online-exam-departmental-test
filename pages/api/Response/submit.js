// pages/api/responses/submit.js
import connectMongo from '@/pages/api/lib/mongodb';
import Response from '@/pages/api/lib/models/ResponseSheet';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectMongo();
    
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid responses data' 
      });
    }

    // Validate required fields for each response
    for (const response of responses) {
      if (!response.username || !response.group || !response.test || !response.questionId || !response.questionText || !response.options || !response.correctAnswer) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields in response data' 
        });
      }
    }

    // Use bulkWrite for better performance with large datasets
    const bulkOperations = responses.map(response => ({
      updateOne: {
        filter: {
          username: response.username,
          group: response.group,
          test: response.test,
          questionId: response.questionId
        },
        update: {
          $set: {
            questionText: response.questionText,
            options: response.options,
            correctAnswer: response.correctAnswer,
            correctOption: response.correctOption,
            selectedOption: response.selectedOption,
            isCorrect: response.isCorrect,
            markedForReview: response.markedForReview,
            status: response.status,
            submittedAt: new Date(response.submittedAt),
            submittedDate: response.submittedDate,
            submittedTime: response.submittedTime,
            timeTaken: response.timeTaken,
            timeElapsed: response.timeElapsed
          }
        },
        upsert: true // Insert if doesn't exist, update if exists
      }
    }));

    const result = await Response.bulkWrite(bulkOperations);

    return res.status(200).json({
      success: true,
      message: 'Responses saved successfully',
      data: {
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
        matched: result.matchedCount
      }
    });

  } catch (error) {
    console.error('Error saving responses:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save responses',
      details: error.message
    });
  }
}