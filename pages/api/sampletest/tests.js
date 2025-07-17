// pages/api/sampletest/tests.js
import connectMongo from '@/pages/api/lib/mongodb';
import SampleTest from '@/pages/api/lib/models/Sampletests';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectMongo();
    const tests = await SampleTest.distinct('test');
    res.status(200).json({ success: true, tests });
  } catch (error) {
    console.error('Error fetching test names:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
