// pages/api/sampletest/questions.js
import connectMongo from '@/pages/api/lib/mongodb';
import SampleTest from '@/pages/api/lib/models/Sampletests';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectMongo();

    const { test } = req.query;
    if (!test) return res.status(400).json({ error: 'Test name is required' });

    const questions = await SampleTest.find({ test }).select('-__v -updatedAt');

    if (!questions.length) return res.status(404).json({ error: 'No questions found' });

    const formatted = questions.map(q => ({
      id: q._id,
      question: q.question,
      options: q.options,
      correct: q.correct,
      test: q.test
    }));

    return res.status(200).json({ success: true, data: formatted, total: formatted.length });
  } catch (error) {
    console.error('Error fetching sample test questions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
