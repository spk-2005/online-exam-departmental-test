import connectMongo from '@/pages/api/lib/mongodb'; // Adjust path as needed
import SampleTest from '@/pages/api/lib/models/Sampletests'; // Adjust path as needed

// For Next.js 13+ App Router (app/api/sampletest/questions/route.js)
export async function GET(request) {
  try {
    await connectMongo();
    
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    const test = searchParams.get('test');
    
    if (!group || !test) {
      return Response.json({ error: 'Group and test parameters are required' }, { status: 400 });
    }
    
    // Fetch questions for the specific group and test
    const questions = await SampleTest.find({ 
      group: group, 
      test: test 
    }).select('-__v -updatedAt');
    
    if (questions.length === 0) {
      return Response.json({ error: 'No questions found for this test' }, { status: 404 });
    }
    
    // Transform the data to match the expected format
    const formattedQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      correct: q.correct,
      group: q.group,
      test: q.test,
      createdAt: q.createdAt
    }));
    
    return Response.json({
      success: true,
      data: formattedQuestions,
      total: formattedQuestions.length
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
