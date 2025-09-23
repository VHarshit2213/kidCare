import twilio from "twilio";
import dotenv from "dotenv";
import { Booking, User } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if all required environment variables are present
if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn(
    "Twilio credentials not fully configured. SMS and calling features will not work."
  );
}

// Initialize the Twilio client only if we have all credentials
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Send an SMS notification about a booking confirmation
 */
export async function sendBookingConfirmationSMS(
  booking: Booking,
  parent: User,
  babysitter: User
): Promise<boolean> {
  if (!client || !twilioPhoneNumber) {
    console.error("Twilio client not initialized. Cannot send SMS.");
    return false;
  }

  if (!parent.phoneNumber) {
    console.error("Parent has no phone number. Cannot send SMS.");
    return false;
  }

  try {
    // Format booking time nicely
    const hasDate = booking.date;

    const startTime = hasDate
      ? new Date(`${booking.date} ${booking.start_time}`)
      : new Date(booking.start_time);

    const endTime = hasDate
      ? new Date(`${booking.date} ${booking.end_time}`)
      : new Date(booking.end_time);

    const dateStr = startTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const startTimeStr = startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const endTimeStr = endTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    // Determine if there are multiple children by checking for commas
    const hasMultipleChildren = booking.children?.length > 1;
    const fullName =
      booking.children?.[0]?.firstName + " " + booking.children?.[0]?.lastName;

    // Parent message
    const parentMessage = `
The Enchanted Co.: Your booking has been confirmed! 
${babysitter.fullName} will be taking care of ${
      hasMultipleChildren ? "your children" : fullName
    } on ${dateStr} from ${startTimeStr} to ${endTimeStr}.
You can contact your sitter at: ${babysitter.phoneNumber || "Not available"}
`;

    // Babysitter message
    const babysitterMessage = `
The Enchanted Co.: You have a new booking! 
You are scheduled to take care of ${
      hasMultipleChildren ? parent.fullName + "'s children" : fullName
    } on ${dateStr} from ${startTimeStr} to ${endTimeStr}.
Care instructions: ${booking.careInstructions || "None provided"}
Parent contact: ${parent.phoneNumber}
`;

    // Send message to parent
    const parentSmsResult = await client.messages.create({
      body: parentMessage,
      from: twilioPhoneNumber,
      to: parent.phoneNumber,
    });
    // console.log(`SMS sent to parent: ${parentSmsResult.sid}`);

    // Only send to babysitter if they have a phone number
    if (babysitter.phoneNumber) {
      const sitterSmsResult = await client.messages.create({
        body: babysitterMessage,
        from: twilioPhoneNumber,
        to: babysitter.phoneNumber,
      });
      // console.log(`SMS sent to babysitter: ${sitterSmsResult.sid}`);
    } else {
      console.log(
        "Babysitter has no phone number. SMS not sent to babysitter."
      );
    }

    // Store booking messages in Supabase table
    await supabase.from("bookingNotification").insert([
      {
        // Babysitter gets notification
        sender_id: parent.user_id,
        receiver_id: babysitter.user_id,
        message: babysitterMessage,
      },
      {
        // Parent gets notification
        sender_id: babysitter.user_id,
        receiver_id: parent.user_id,
        message: parentMessage,
      },
    ]);

    return true;
  } catch (error) {
    console.error("Error sending SMS via Twilio:", error);
    return false;
  }
}

/**
 * Make a phone call to notify about a booking confirmation
 */
export async function makeBookingConfirmationCall(
  booking: Booking,
  recipient: User,
  isParent: boolean
): Promise<boolean> {
  if (!client || !twilioPhoneNumber) {
    console.error("Twilio client not initialized. Cannot make call.");
    return false;
  }

  if (!recipient.phoneNumber) {
    console.error("Recipient has no phone number. Cannot make call.");
    return false;
  }

  try {
    // Create the TwiML for the call
    const startTime = new Date(booking.startTime);
    const dateStr = startTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const timeStr = startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    // Build a simple TwiML response for the call
    const twimlMessage = isParent
      ? `<Response>
          <Say>Hello, this is The Enchanted Co. calling to confirm your babysitting booking for ${dateStr} at ${timeStr}. 
          Your booking has been confirmed. You will receive an SMS with more details. Thank you for using our service!</Say>
          <Pause length="1"/>
          <Say>Goodbye!</Say>
         </Response>`
      : `<Response>
          <Say>Hello, this is The Enchanted Co. calling to inform you about a new babysitting assignment on ${dateStr} at ${timeStr}.
          You have been assigned to this booking. You will receive an SMS with more details. Thank you!</Say>
          <Pause length="1"/>
          <Say>Goodbye!</Say>
         </Response>`;

    // Make the call
    const call = await client.calls.create({
      twiml: twimlMessage,
      from: twilioPhoneNumber,
      to: recipient.phoneNumber,
    });

    console.log(
      `Call initiated to ${isParent ? "parent" : "babysitter"}: ${call.sid}`
    );
    return true;
  } catch (error) {
    console.error("Error making call via Twilio:", error);
    return false;
  }
}
