// pages/api/notify.js
import twilio from 'twilio';

// Initialize Twilio client using environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // We expect the payment details to be sent in the request body from payment.js
    const { name, phoneNumber, selectedGroups, screenshot } = req.body;

    // Basic validation for notification data
    if (!name || !phoneNumber || !selectedGroups) {
        return res.status(400).json({ success: false, error: 'Missing required payment details for notification' });
    }

    const adminNumber = process.env.ADMIN_PHONE_NUMBER;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    // Check Twilio configuration
    if (!adminNumber || !twilioNumber || !twilioClient) {
        console.error('Twilio environment variables or client are not configured correctly.');
        return res.status(500).json({ success: false, error: 'Twilio configuration missing on server.' });
    }

    // Format the message
    const groupsString = Array.isArray(selectedGroups) 
        ? selectedGroups.join(', ') 
        : selectedGroups;
    
    const messageBody = `
New Payment Submission!
Name: ${name}
Phone: ${phoneNumber}
Groups: ${groupsString}
Screenshot Path: ${screenshot || 'N/A'}

Please Create UserName!!....
`;

    try {
        console.log('Attempting to send SMS via Twilio...');
        const message = await twilioClient.messages.create({
            body: messageBody,
            from: twilioNumber,
            to: adminNumber
        });
        
        console.log('Admin notified successfully via Twilio SMS. SID:', message.sid);
        
        // Respond with success to the payment.js route
        return res.status(200).json({ success: true, message: 'Notification sent successfully', sid: message.sid });

    } catch (error) {
        console.error('Failed to send Twilio SMS notification:', error.message);
        if (error.code) {
            console.error('Twilio Error Code:', error.code);
        }
        
        // Return a server error, indicating notification failure
        return res.status(500).json({ success: false, error: 'Failed to send notification' });
    }
}