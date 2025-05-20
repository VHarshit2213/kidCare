import twilio from 'twilio';
import { User, Booking } from '@shared/schema';

// Import just the needed types
type ProxyServiceInstance = any;
type ProxySessionInstance = any;
type ProxyParticipantInstance = any;

// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if all required environment variables are present
if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('Twilio credentials not fully configured. Proxy services will not work.');
}

// Initialize the Twilio client only if we have all credentials
const client = accountSid && authToken 
  ? twilio(accountSid, authToken) 
  : null;

// Cache to store session and participant mappings
const proxyCache: {
  [bookingId: number]: {
    sessionSid: string;
    participants: {
      [userId: number]: string; // Mapping of userId to participantSid
    };
  };
} = {};

/**
 * Create a proxy session for a booking
 * This establishes a connection between parent and babysitter while masking their real numbers
 */
export async function createProxySession(
  booking: Booking,
  parent: User,
  babysitter: User
): Promise<{ success: boolean; sessionSid?: string; error?: string }> {
  if (!client) {
    return { success: false, error: 'Twilio client not initialized' };
  }

  if (!parent.phoneNumber || !babysitter.phoneNumber) {
    return { success: false, error: 'Both parent and babysitter must have phone numbers' };
  }

  try {
    // First, create or get a proxy service
    // For simplicity we'll use one service per application instance
    const serviceName = 'EnchantedCoProxyService';
    let service;

    // Try to find existing service
    const services = await client.proxy.v1.services.list();
    
    // Find the service with matching name
    const existingService = services.find(s => s.friendlyName === serviceName);
    
    if (existingService) {
      service = existingService;
    } else {
      // Create a new proxy service
      service = await client.proxy.v1.services.create({
        friendlyName: serviceName
      });
    }

    // Check if we already have a session for this booking
    if (proxyCache[booking.id]?.sessionSid) {
      // Session already exists, just return it
      return { 
        success: true, 
        sessionSid: proxyCache[booking.id].sessionSid 
      };
    }

    // Create a new session for this booking
    const session = await client.proxy.v1.services(service.sid)
      .sessions.create({
        uniqueName: `booking-${booking.id}`,
        mode: 'voice-and-message',
        ttl: 24 * 60 * 60 // 24 hours in seconds
      });

    // Add parent as a participant
    const parentParticipant = await client.proxy.v1.services(service.sid)
      .sessions(session.sid)
      .participants.create({
        friendlyName: `parent-${parent.id}`,
        identifier: parent.phoneNumber,
      });

    // Add babysitter as a participant
    const babysitterParticipant = await client.proxy.v1.services(service.sid)
      .sessions(session.sid)
      .participants.create({
        friendlyName: `babysitter-${babysitter.id}`,
        identifier: babysitter.phoneNumber,
      });

    // Store session information in our cache
    proxyCache[booking.id] = {
      sessionSid: session.sid,
      participants: {
        [parent.id]: parentParticipant.sid,
        [babysitter.id]: babysitterParticipant.sid
      }
    };

    console.log(`Proxy session created for booking #${booking.id}`);
    return { success: true, sessionSid: session.sid };
  } catch (error: any) {
    console.error('Error creating proxy session:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create proxy session' 
    };
  }
}

/**
 * Get the proxy phone number for a user in a booking
 */
export async function getProxyPhoneNumber(
  bookingId: number,
  userId: number
): Promise<{ success: boolean; phoneNumber?: string; error?: string }> {
  if (!client) {
    return { success: false, error: 'Twilio client not initialized' };
  }

  try {
    // Check if we have a session for this booking
    const cachedSession = proxyCache[bookingId];
    if (!cachedSession) {
      return { success: false, error: 'No proxy session found for this booking' };
    }

    // Get the participant info
    const participantSid = cachedSession.participants[userId];
    if (!participantSid) {
      return { success: false, error: 'User is not a participant in this proxy session' };
    }

    // Get the proxy service SID (first part of the session SID)
    const serviceSid = cachedSession.sessionSid.split('KS')[0];
    
    // Get the participant details to find their proxy number
    const participant = await client.proxy.v1.services(serviceSid)
      .sessions(cachedSession.sessionSid)
      .participants(participantSid)
      .fetch();

    return { 
      success: true, 
      phoneNumber: participant.proxyIdentifier || undefined 
    };
  } catch (error: any) {
    console.error('Error getting proxy phone number:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get proxy phone number' 
    };
  }
}

/**
 * Close a proxy session when it's no longer needed
 */
export async function closeProxySession(
  bookingId: number
): Promise<{ success: boolean; error?: string }> {
  if (!client) {
    return { success: false, error: 'Twilio client not initialized' };
  }

  try {
    // Check if we have a session for this booking
    const cachedSession = proxyCache[bookingId];
    if (!cachedSession) {
      return { success: false, error: 'No proxy session found for this booking' };
    }

    // Get the proxy service SID (first part of the session SID)
    const serviceSid = cachedSession.sessionSid.split('KS')[0];
    
    // Close the session
    await client.proxy.v1.services(serviceSid)
      .sessions(cachedSession.sessionSid)
      .update({ status: 'closed' });

    // Remove from our cache
    delete proxyCache[bookingId];

    return { success: true };
  } catch (error: any) {
    console.error('Error closing proxy session:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to close proxy session' 
    };
  }
}