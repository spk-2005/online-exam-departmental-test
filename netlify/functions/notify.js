import twilio from 'twilio';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  const { name, phoneNumber, selectedGroups, screenshot } = JSON.parse(event.body);

  if (!name || !phoneNumber || !selectedGroups) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'Missing required payment details' }),
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  const adminNumber = process.env.ADMIN_PHONE_NUMBER;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!adminNumber || !twilioNumber) {
    console.error('Twilio env variables missing.');
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Twilio configuration missing.' }),
    };
  }

  const groupsString = Array.isArray(selectedGroups)
    ? selectedGroups.join(', ')
    : selectedGroups;

  const messageBody = `
New Payment Submission!
Name: ${name}
Phone: ${phoneNumber}
Groups: ${groupsString}
Screenshot: ${screenshot || 'N/A'}

Please Create UserName!
  `;

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: twilioNumber,
      to: adminNumber,
    });

    console.log('SMS sent, SID:', message.sid);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sid: message.sid }),
    };
  } catch (error) {
    console.error('Twilio SMS error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
