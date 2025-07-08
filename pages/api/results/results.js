// pages/api/results/results.js
import dbConnect from '@/pages/lib/mongodb'
import Result from '@/pages/lib/__models__/result'; // Adjust path as needed

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await dbConnect();

    // Get query parameters for filtering
    const { 
      test, 
      group, 
      sortBy = 'percentage', 
      sortOrder = 'desc',
      limit,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    if (test && test !== 'all') {
      filter.test = test;
    }
    if (group && group !== 'all') {
      filter.group = group;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageSize = limit ? parseInt(limit) : 0;
    const skip = pageSize > 0 ? (parseInt(page) - 1) * pageSize : 0;

    // Execute query
    let query = Result.find(filter).lean().sort(sort);
    
    if (pageSize > 0) {
      query = query.skip(skip).limit(pageSize);
    }

    const results = await query.exec();

    // Get total count for pagination
    const totalCount = await Result.countDocuments(filter);

    // Return results as array directly (not wrapped in object)
    res.status(200).json(results);

  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// Alternative version if you want to return wrapped data
export async function getResultsWithPagination(req, res) {
  try {
    await dbConnect();

    const { 
      test, 
      group, 
      sortBy = 'percentage', 
      sortOrder = 'desc',
      limit,
      page = 1
    } = req.query;

    const filter = {};
    if (test && test !== 'all') {
      filter.test = test;
    }
    if (group && group !== 'all') {
      filter.group = group;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pageSize = limit ? parseInt(limit) : 0;
    const skip = pageSize > 0 ? (parseInt(page) - 1) * pageSize : 0;

    let query = Result.find(filter).lean().sort(sort);
    
    if (pageSize > 0) {
      query = query.skip(skip).limit(pageSize);
    }

    const results = await query.exec();
    const totalCount = await Result.countDocuments(filter);

    res.status(200).json({
      results,
      totalCount,
      page: parseInt(page),
      totalPages: pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1,
      hasMore: pageSize > 0 ? skip + results.length < totalCount : false
    });

  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}