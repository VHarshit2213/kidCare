import twilio from 'twilio';
import { Booking, User } from '@shared/schema';

// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if all required environment variables are present
if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('Twilio credentials not fully configured. Masked communication features will not work.');
}

// Initialize the Twilio client only if we have all credentials
const client = accountSid && authToken 
  ? twilio(accountSid, authToken) 
  : null;

/**
 * This function relays an SMS message between users without revealing their actual phone numbers.
 * The message appears to come from The Enchanted Co. but includes who it's from.
 */
export async function sendMaskedSMS(
  fromUser: User,
  toUser: User,
  bookingId: number,
  messageContent: string
): Promise<{ success: boolean; error?: string }> {
  if (!client || !twilioPhoneNumber) {
    return { success: false, error: 'Twilio client not initialized' };
  }

  if (!toUser.phoneNumber) {
    return { success: false, error: 'Recipient has no phone number' };
  }

  try {
    // Format the message to indicate who it's from but mask the actual number
    const formattedMessage = `Message from ${fromUser.fullName} (via The Enchanted Co. - Booking #${bookingId}):\n\n${messageContent}\n\nReply to this message to respond.`;
    
    // Send the SMS via Twilio
    const message = await client.messages.create({
      body: formattedMessage,
      from: twilioPhoneNumber,
      to: toUser.phoneNumber
    });

    console.log(`Masked SMS sent: ${message.sid}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending masked SMS:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send masked SMS' 
    };
  }
}

/**
 * Handle incoming SMS responses and relay them to the appropriate recipient
 */
export async function handleIncomingSMS(
  from: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  if (!client || !twilioPhoneNumber) {
    return { success: false, error: 'Twilio client not initialized' };
  }

  try {
    // First, we need to determine which booking this relates to and who sent it
    // In a real implementation, you'd store a mapping of phone numbers to users
    // and track active conversations with metadata
    
    // This is a simplified example. In a real app, you would:
    // 1. Parse the incoming number to find the sender in your database
    // 2. Check active bookings to determine the recipient
    // 3. Relay the message to the correct person

    // For now, we'll just log this - implementation would depend on your exact data model
    console.log(`Received SMS from ${from}: ${body}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error handling incoming SMS:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to handle incoming SMS' 
    };
  }
}

/**
 * Make a masked phone call between two users
 * This connects the call while keeping both phone numbers private
 */
export async function makeMaskedCall(
  fromUser: User,
  toUser: User,
  bookingId: number
): Promise<{ success: boolean; callSid?: string; error?: string }> {
  if (!client || !twilioPhoneNumber) {
    return { success: false, error: 'Twilio client not initialized' };
  }

  if (!fromUser.phoneNumber || !toUser.phoneNumber) {
    return { success: false, error: 'Both users must have phone numbers' };
  }

  try {
    // First, create a TwiML to handle the call flow
    const twiml = `
      <Response>
        <Say>This is a call from ${fromUser.fullName} regarding your booking with The Enchanted Co. Connecting you now.</Say>
        <Dial callerId="${twilioPhoneNumber}">${toUser.phoneNumber}</Dial>
      </Response>
    `;

    // Make the call
    const call = await client.calls.create({
      twiml: twiml,
      from: twilioPhoneNumber,
      to: fromUser.phoneNumber
    });

    console.log(`Masked call initiated: ${call.sid}`);
    return { success: true, callSid: call.sid };
  } catch (error: any) {
    console.error('Error making masked call:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to make masked call' 
    };
  }
}

/**
 * Get a webhook handler for incoming SMS messages
 * This should be configured as the webhook URL in your Twilio console
 */
export function getSMSWebhookHandler() {
  return async (req: any, res: any) => {
    const { From, Body } = req.body;
    
    try {
      // Process the incoming SMS
      const result = await handleIncomingSMS(From, Body);
      
      if (result.success) {
        // Return a 200 OK to Twilio
        res.status(200).send();
      } else {
        // Log the error but still return 200 to Twilio to acknowledge receipt
        console.error('Error in SMS webhook:', result.error);
        res.status(200).send();
      }
    } catch (error: any) {
      console.error('Unhandled error in SMS webhook:', error);
      res.status(200).send();
    }
  };
}