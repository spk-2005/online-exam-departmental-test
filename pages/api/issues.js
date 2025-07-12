import connectMongo from '@/pages/api/lib/mongodb'; 
import Issue from '@/pages/api/lib/models/Issue'; // Import the Issue model

export default async function handler(req, res) {
    // Ensure database connection
    await connectMongo();

    const { method } = req;

    switch (method) {
        case 'POST':
            try {
                // Creates a new issue instance from the request body
                const newIssue = await Issue.create(req.body); 

                res.status(201).json({ 
                    success: true, 
                    data: newIssue, 
                    message: 'Issue reported successfully.' 
                });
            } catch (error) {
                // Handle Mongoose validation errors (e.g., missing username or message)
                if (error.name === 'ValidationError') {
                    return res.status(400).json({ success: false, message: error.message });
                }
                // Handle other server errors
                res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
            }
            break;
            
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}