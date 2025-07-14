// .netlify/functions/notify.js
import twilio from 'twilio';

export const handler = async (event, context) => {
  console.log('Notification function called');
  console.log('Event method:', event.httpMethod);
  console.log('Event body:', event.body);

  // Enable CORS for web requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON payload' 
        }),
      };
    }

    const { name, phoneNumber, selectedGroups, screenshot, isUpdate } = requestBody;

    console.log('Parsed request data:', {
      name,
      phoneNumber,
      selectedGroups,
      screenshot: screenshot ? 'Present' : 'Missing',
      isUpdate
    });

    // Validate required fields
    if (!name || !phoneNumber || !selectedGroups) {
      console.error('Missing required fields:', { name: !!name, phoneNumber: !!phoneNumber, selectedGroups: !!selectedGroups });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required payment details in payload',
          details: {
            name: !name ? 'Name is required' : null,
            phoneNumber: !phoneNumber ? 'Phone number is required' : null,
            selectedGroups: !selectedGroups ? 'Selected groups are required' : null
          }
        }),
      };
    }

    // Validate environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const adminNumber = process.env.ADMIN_PHONE_NUMBER;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    console.log('Environment variables check:', {
      accountSid: !!accountSid,
      authToken: !!authToken,
      adminNumber: !!adminNumber,
      twilioNumber: !!twilioNumber
    });

    if (!accountSid || !authToken || !adminNumber || !twilioNumber) {
      console.error('Missing Twilio environment variables');
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Twilio configuration missing. Please check environment variables.',
          details: {
            accountSid: !accountSid ? 'TWILIO_ACCOUNT_SID is missing' : null,
            authToken: !authToken ? 'TWILIO_AUTH_TOKEN is missing' : null,
            adminNumber: !adminNumber ? 'ADMIN_PHONE_NUMBER is missing' : null,
            twilioNumber: !twilioNumber ? 'TWILIO_PHONE_NUMBER is missing' : null
          }
        }),
      };
    }

    // Initialize Twilio client
    let client;
    try {
      client = twilio(accountSid, authToken);
      console.log('Twilio client initialized successfully');
    } catch (twilioError) {
      console.error('Twilio client initialization error:', twilioError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to initialize Twilio client',
          details: twilioError.message
        }),
      };
    }

    // Format groups for message
    const groupsString = Array.isArray(selectedGroups)
      ? selectedGroups.join(', ')
      : selectedGroups;

    // Create formatted message
    const messageBody = `
🔔 ${isUpdate ? 'UPDATED' : 'NEW'} Payment Submission!

👤 Name: ${name}
📱 Phone: ${phoneNumber}
📋 Groups: ${groupsString}
🖼️ Screenshot: ${screenshot || 'Not provided'}
⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

${isUpdate ? '⚠️ This is an update to existing payment' : '✅ Please create username and activate account!'}
`.trim();

    console.log('Message to send:', messageBody);
    console.log('Sending SMS from:', twilioNumber, 'to:', adminNumber);

    // Send SMS notification
    const message = await client.messages.create({
      body: messageBody,
      from: twilioNumber,
      to: adminNumber,
    });

    console.log('SMS sent successfully:', {
      sid: message.sid,
      to: adminNumber,
      from: twilioNumber,
      isUpdate: isUpdate || false
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        sid: message.sid,
        message: 'Notification sent successfully'
      }),
    };

  } catch (error) {
    console.error('Notification function error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });

    // Handle specific Twilio errors
    if (error.code === 21211) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid phone number format',
          details: 'Please check the admin phone number configuration'
        }),
      };
    }

    if (error.code === 21614) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid sender phone number',
          details: 'Please check the Twilio phone number configuration'
        }),
      };
    }

    if (error.code === 20003) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Twilio authentication failed',
          details: 'Please check your Twilio credentials'
        }),
      };
    }

    if (error.code === 20404) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Twilio resource not found',
          details: 'Please check your Twilio configuration'
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: `Failed to send SMS: ${error.message}`,
        details: error.code ? `Error code: ${error.code}` : 'Unknown error'
      }),
    };
  }
};