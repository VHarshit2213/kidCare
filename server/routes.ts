import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertBookingSchema, 
  insertMessageSchema, 
  insertChildSchema,
  users,
  User
} from "@shared/schema";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import express from "express";
import { setupAuth } from "./auth";
import Stripe from "stripe";
import { sendBookingConfirmationSMS, makeBookingConfirmationCall } from "./twilio";
import { sendMaskedSMS, makeMaskedCall, getSMSWebhookHandler } from "./masked-communication";

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key. Stripe payment features will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Password reset request endpoint
  app.post("/api/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Check if user exists with that email
    // In a real application, we would:
    // 1. Find the user by email
    // 2. Generate a secure token
    // 3. Store the token with an expiration time
    // 4. Send an email with a reset link
    
    // For now, just return a success message regardless of whether the email exists
    // This is a security best practice to prevent email enumeration
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return res.status(200).json({ 
      message: "If an account exists with that email, password reset instructions will be sent." 
    });
  });
  // Utility function to handle validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return { data: schema.parse(data), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return { data: null, error: { message: validationError.message } };
      }
      if (error instanceof Error) {
        return { data: null, error: { message: error.message } };
      }
      return { data: null, error: { message: 'Unknown validation error' } };
    }
  };

  // Authentication middleware using Passport.js session
  const authenticate = async (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // User Routes
  // These routes are now handled by the auth middleware in auth.ts
  // We're keeping these route definitions empty as references

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password back
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });

  app.get("/api/babysitters", async (_req, res) => {
    try {
      const babysitters = await storage.getAllBabysitters();
      
      // Filter out only available babysitters (not busy or offline)
      const availableBabysitters = babysitters.filter(babysitter => 
        babysitter.availabilityStatus === "available"
      );
      
      // Remove passwords from the response
      const babysittersWithoutPasswords = availableBabysitters.map(babysitter => {
        const { password, ...babysitterWithoutPassword } = babysitter;
        return babysitterWithoutPassword;
      });
      
      res.status(200).json(babysittersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get babysitters" });
    }
  });
  
  // Endpoint to get nearby babysitters for instant booking
  app.get("/api/nearby-babysitters", async (req, res) => {
    try {
      // Get filter parameters from query string
      const { 
        latitude, 
        longitude, 
        radius = "8", // default radius of 8 miles
        requiresFirstAid,
        requiresTransportation,
        minExperience
      } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const userLat = parseFloat(latitude as string);
      const userLng = parseFloat(longitude as string);
      const radiusMiles = parseFloat(radius as string);
      
      // Get all babysitters
      const allBabysitters = await storage.getAllBabysitters();
      
      // Filter out babysitters based on criteria and calculate distance
      const nearbyBabysitters = allBabysitters
        .filter(sitter => {
          // Only show available babysitters (not busy or offline)
          if (sitter.availabilityStatus !== "available") return false;
          // Apply additional filters if specified
          if (requiresFirstAid === 'true' && !sitter.firstAidCertified) return false;
          if (requiresTransportation === 'true' && !sitter.hasTransportation) return false;
          
          // Experience check with null safety
          const experience = sitter.yearsExperience as number | null;
          if (minExperience && (!experience || experience < parseInt(minExperience as string))) return false;
          
          // Always return true for demo purposes
          // In a real app, we would use the location to calculate distance
          return true;
        })
        .map(sitter => {
          // In a real app, we would parse the location and calculate actual distance
          // For demo purposes, we assign a random distance within the radius
          const distance = Math.random() * radiusMiles;
          
          // Estimated arrival time: roughly 2 minutes per mile
          const estimatedArrivalMinutes = Math.round(distance * 2);
          
          const { password, ...sitterWithoutPassword } = sitter;
          return {
            ...sitterWithoutPassword,
            distance,
            estimatedArrivalMinutes
          };
        })
        // Sort by distance (closest first)
        .sort((a, b) => a.distance - b.distance)
        // Limit to max 3 results
        .slice(0, 3);
      
      res.status(200).json(nearbyBabysitters);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get nearby babysitters" });
    }
  });

  // Booking Routes
  // Authenticated booking creation for registered parents
  app.post("/api/bookings", authenticate, async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertBookingSchema, req.body);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    try {
      const user = (req as any).user;
      
      // Only parents can create bookings
      if (user.userType !== "parent") {
        return res.status(403).json({ message: "Only parents can create bookings" });
      }
      
      const booking = await storage.createBooking({
        ...data,
        parentId: user.id,
      });
      
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create booking" });
    }
  });
  
  // Anonymous booking creation (instant care) for non-authenticated users
  app.post("/api/instant-bookings", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertBookingSchema.omit({ parentId: true }), req.body);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    try {
      // For anonymous bookings, we'll use a placeholder parent ID (1) for now
      // In a real app, this would be associated with a guest account or a newly created account
      const booking = await storage.createBooking({
        ...data,
        parentId: 1, // Using a placeholder parent ID
      });
      
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create instant booking" });
    }
  });

  app.get("/api/bookings/parent", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Only parents can view their bookings
      if (user.userType !== "parent") {
        return res.status(403).json({ message: "Only parents can view their bookings" });
      }
      
      const bookings = await storage.getBookingsByParentId(user.id);
      res.status(200).json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get bookings" });
    }
  });

  app.get("/api/bookings/babysitter", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Only babysitters can view their bookings
      if (user.userType !== "babysitter") {
        return res.status(403).json({ message: "Only babysitters can view their bookings" });
      }
      
      const bookings = await storage.getBookingsByBabysitterId(user.id);
      res.status(200).json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get bookings" });
    }
  });

  app.patch("/api/bookings/:id/status", authenticate, async (req: Request, res: Response) => {
    const { status } = req.body;
    
    if (!status || !["pending", "accepted", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = (req as any).user;
      
      // Validate user permissions for status update
      if (user.userType === "parent" && user.id !== booking.parentId) {
        return res.status(403).json({ message: "You can only update your own bookings" });
      }
      
      if (user.userType === "babysitter" && booking.babysitterId !== user.id) {
        return res.status(403).json({ message: "You can only update bookings assigned to you" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      
      // Send notifications when booking is confirmed/accepted
      if (status === "accepted" && updatedBooking && updatedBooking.babysitterId) {
        try {
          // Get both the parent and babysitter details for the notification
          const parent = await storage.getUser(updatedBooking.parentId);
          const babysitter = await storage.getUser(updatedBooking.babysitterId);
          
          if (parent && babysitter) {
            console.log(`Sending booking confirmation notifications for booking #${bookingId}`);
            
            // Send SMS notifications
            await sendBookingConfirmationSMS(updatedBooking, parent, babysitter);
            
            // Make confirmation calls if phone numbers are available
            if (parent.phoneNumber) {
              await makeBookingConfirmationCall(updatedBooking, parent, true);
            }
            
            if (babysitter.phoneNumber) {
              await makeBookingConfirmationCall(updatedBooking, babysitter, false);
            }
          }
        } catch (notificationError: any) {
          console.error("Error sending booking notifications:", notificationError.message || notificationError);
          // We continue even if notifications fail - don't block the booking update
        }
      }
      
      res.status(200).json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update booking status" });
    }
  });

  app.patch("/api/bookings/:id/assign", authenticate, async (req: Request, res: Response) => {
    const { babysitterId } = req.body;
    
    if (!babysitterId) {
      return res.status(400).json({ message: "Babysitter ID is required" });
    }
    
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = (req as any).user;
      
      // Only babysitters can assign themselves
      if (user.userType !== "babysitter" || user.id !== Number(babysitterId)) {
        return res.status(403).json({ message: "Only babysitters can assign themselves to bookings" });
      }
      
      // Check if booking is already assigned
      if (booking.babysitterId) {
        return res.status(409).json({ message: "Booking is already assigned to a babysitter" });
      }
      
      const updatedBooking = await storage.assignBabysitterToBooking(bookingId, Number(babysitterId));
      
      // Send notifications when a babysitter is assigned to a booking
      if (updatedBooking) {
        try {
          // Get both the parent and babysitter details for the notification
          const parent = await storage.getUser(updatedBooking.parentId);
          const babysitter = updatedBooking.babysitterId ? await storage.getUser(updatedBooking.babysitterId) : null;
          
          if (parent && babysitter) {
            console.log(`Sending babysitter assignment notifications for booking #${bookingId}`);
            
            // Send SMS notifications
            await sendBookingConfirmationSMS(updatedBooking, parent, babysitter);
            
            // Make confirmation calls if phone numbers are available
            if (parent.phoneNumber) {
              await makeBookingConfirmationCall(updatedBooking, parent, true);
            }
            
            if (babysitter.phoneNumber) {
              await makeBookingConfirmationCall(updatedBooking, babysitter, false);
            }
          }
        } catch (notificationError) {
          console.error("Error sending babysitter assignment notifications:", notificationError);
          // We continue even if notifications fail - don't block the booking update
        }
      }
      
      res.status(200).json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to assign babysitter to booking" });
    }
  });

  // Dedicated endpoint for sending Twilio notifications for a booking
  app.post("/api/bookings/:id/notify", authenticate, async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.id);
      const { notificationType } = req.body;
      
      if (!notificationType || !["sms", "call", "both"].includes(notificationType)) {
        return res.status(400).json({ message: "Invalid notification type. Must be 'sms', 'call', or 'both'." });
      }
      
      // Get the booking details
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify user has permission to send notifications for this booking
      const user = (req as any).user;
      if (user.userType === "parent" && user.id !== booking.parentId) {
        return res.status(403).json({ message: "You can only send notifications for your own bookings" });
      }
      
      if (user.userType === "babysitter" && booking.babysitterId !== user.id) {
        return res.status(403).json({ message: "You can only send notifications for bookings assigned to you" });
      }
      
      // Make sure we have both a parent and babysitter
      if (!booking.babysitterId) {
        return res.status(400).json({ message: "Cannot send notifications for bookings without an assigned babysitter" });
      }
      
      // Get parent and babysitter details for notifications
      const parent = await storage.getUser(booking.parentId);
      const babysitter = await storage.getUser(booking.babysitterId);
      
      if (!parent || !babysitter) {
        return res.status(500).json({ message: "Could not retrieve user details for notifications" });
      }
      
      // Track notification status for response
      const notifications = {
        sms: { sent: false, error: null },
        call: { sent: false, error: null }
      };
      
      // Send SMS if requested
      if (notificationType === "sms" || notificationType === "both") {
        try {
          const smsSent = await sendBookingConfirmationSMS(booking, parent, babysitter);
          notifications.sms.sent = smsSent;
        } catch (error: any) {
          notifications.sms.error = error.message || "Failed to send SMS";
        }
      }
      
      // Make calls if requested
      if (notificationType === "call" || notificationType === "both") {
        try {
          if (parent.phoneNumber) {
            const parentCallSent = await makeBookingConfirmationCall(booking, parent, true);
            notifications.call.sent = parentCallSent;
          }
          
          if (babysitter.phoneNumber) {
            const sitterCallSent = await makeBookingConfirmationCall(booking, babysitter, false);
            notifications.call.sent = sitterCallSent && notifications.call.sent;
          }
        } catch (error: any) {
          notifications.call.error = error.message || "Failed to make call";
        }
      }
      
      // Return results
      res.status(200).json({
        message: "Notifications processed",
        booking: booking.id,
        notifications
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to send notifications" });
    }
  });

  // Message Routes
  // Twilio SMS webhook for handling replies
  app.post("/api/twilio/sms-webhook", express.urlencoded({ extended: false }), getSMSWebhookHandler());

  // API endpoint to send a masked message between users
  app.post("/api/bookings/:id/masked-message", authenticate, async (req: Request, res: Response) => {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get the authenticated user
      const currentUser = (req as any).user;
      
      // Determine if current user is the parent or babysitter
      let fromUser: User | undefined;
      let toUser: User | undefined;
      
      if (currentUser.id === booking.parentId) {
        // Parent sending message to babysitter
        fromUser = currentUser;
        if (booking.babysitterId) {
          toUser = await storage.getUser(booking.babysitterId);
        }
      } else if (currentUser.id === booking.babysitterId) {
        // Babysitter sending message to parent
        fromUser = currentUser;
        toUser = await storage.getUser(booking.parentId);
      } else {
        return res.status(403).json({ message: "You are not associated with this booking" });
      }
      
      if (!toUser) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Make sure both users are defined
      if (!fromUser || !toUser) {
        return res.status(404).json({ message: "Sender or recipient not found" });
      }
      
      // Send the masked message
      const result = await sendMaskedSMS(fromUser, toUser, bookingId, message);
      
      if (result.success) {
        // Create a regular message in our system too (for chat history)
        await storage.createMessage({
          senderId: fromUser.id,
          receiverId: toUser.id,
          bookingId,
          content: message,
          isRead: false
        });
        
        res.status(200).json({ message: "Message sent successfully" });
      } else {
        res.status(500).json({ message: result.error || "Failed to send message" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to send masked message" });
    }
  });
  
  // API endpoint to initiate a masked call between users
  app.post("/api/bookings/:id/masked-call", authenticate, async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get the authenticated user
      const currentUser = (req as any).user;
      
      // Determine if current user is the parent or babysitter
      let fromUser: User | undefined;
      let toUser: User | undefined;
      
      if (currentUser.id === booking.parentId) {
        // Parent calling babysitter
        fromUser = currentUser;
        if (booking.babysitterId) {
          toUser = await storage.getUser(booking.babysitterId);
        }
      } else if (currentUser.id === booking.babysitterId) {
        // Babysitter calling parent
        fromUser = currentUser;
        toUser = await storage.getUser(booking.parentId);
      } else {
        return res.status(403).json({ message: "You are not associated with this booking" });
      }
      
      if (!toUser) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Make the masked call
      const result = await makeMaskedCall(fromUser, toUser, bookingId);
      
      if (result.success) {
        res.status(200).json({ 
          message: "Call initiated successfully",
          callSid: result.callSid
        });
      } else {
        res.status(500).json({ message: result.error || "Failed to initiate call" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to make masked call" });
    }
  });

  // Regular messages endpoint (for in-app messaging)
  app.post("/api/messages", authenticate, async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertMessageSchema, req.body);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    try {
      const user = (req as any).user;
      
      // Ensure sender ID matches authenticated user
      if (data.senderId !== user.id) {
        return res.status(403).json({ message: "Sender ID must match authenticated user" });
      }
      
      // Check if receiver exists
      const receiver = await storage.getUser(data.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      const message = await storage.createMessage(data);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to send message" });
    }
  });

  app.get("/api/messages/:userId", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const requestedUserId = Number(req.params.userId);
      
      // Users can only view their own conversations
      if (user.id !== requestedUserId) {
        return res.status(403).json({ message: "You can only view your own messages" });
      }
      
      const messages = await storage.getMessagesByUserId(requestedUserId);
      res.status(200).json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get messages" });
    }
  });

  app.get("/api/messages/:user1Id/:user2Id", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const user1Id = Number(req.params.user1Id);
      const user2Id = Number(req.params.user2Id);
      
      // Users can only view their own conversations
      if (user.id !== user1Id && user.id !== user2Id) {
        return res.status(403).json({ message: "You can only view your own conversations" });
      }
      
      const messages = await storage.getMessagesBetweenUsers(user1Id, user2Id);
      res.status(200).json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get conversation" });
    }
  });

  app.patch("/api/messages/:id/read", authenticate, async (req: Request, res: Response) => {
    try {
      const messageId = Number(req.params.id);
      await storage.markMessageAsRead(messageId);
      res.status(200).json({ message: "Message marked as read" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to mark message as read" });
    }
  });

  // Profile Management Routes
  const parentProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    parentingStyle: z.string().optional(),
    familyDescription: z.string().optional(),
    familyActivities: z.string().optional(),
    medicalDietaryRestrictions: z.string().optional(),
    emergencyContacts: z.array(
      z.object({
        name: z.string(),
        relationship: z.string(),
        phoneNumber: z.string(),
      })
    ).optional(),
    profileCompleted: z.boolean().optional()
  });

  // Update user profile
  app.patch("/api/users/profile", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Only parents can update their profile with this endpoint
      if (user.userType !== "parent") {
        return res.status(403).json({ message: "Only parents can update their profile with this endpoint" });
      }

      const { data, error } = validateRequest(parentProfileSchema, req.body);
      
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      
      const updatedUser = await storage.updateUserProfile(user.id, {
        ...data,
        profileCompleted: true // Mark profile as completed
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send the password back
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update profile" });
    }
  });

  // Update babysitter availability status
  app.patch("/api/users/availability", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { availabilityStatus } = req.body;
      
      // Only babysitters can update their availability
      if (user.userType !== "babysitter") {
        return res.status(403).json({ message: "Only babysitters can update their availability" });
      }
      
      if (!availabilityStatus || !['available', 'offline', 'busy'].includes(availabilityStatus)) {
        return res.status(400).json({ message: "Invalid availability status. Must be 'available', 'offline', or 'busy'" });
      }
      
      const updatedUser = await storage.updateUserAvailability(user.id, availabilityStatus);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password back
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update availability" });
    }
  });

  // Admin Routes
  // Get all users (for admin purposes)
  app.get("/api/admin/users", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Check if the user is an admin (for simplicity, we'll check by username)
      if (user.username !== "admin") {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      // Get all users
      const allUsers = await storage.getAllUsers();
      
      // Remove passwords from the response
      const safeUsers = allUsers.map((user: User) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });
  
  // Update babysitter review status (for admin approval workflow)
  app.patch("/api/admin/users/:id/review", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Check if the user is an admin
      if (user.username !== "admin") {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      const userId = Number(req.params.id);
      const { reviewStatus } = req.body;
      
      if (!reviewStatus || !['approved', 'rejected', 'pending'].includes(reviewStatus)) {
        return res.status(400).json({ message: "Valid review status required (approved, rejected, or pending)" });
      }
      
      // Get the user to check if it's a babysitter
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (targetUser.userType !== "babysitter") {
        return res.status(400).json({ message: "Review status can only be set for babysitters" });
      }
      
      // Update the user's review status
      const updatedUser = await storage.updateUserProfile(userId, { reviewStatus });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Failed to update user" });
      }
      
      // Don't send the password back
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update review status" });
    }
  });

  // Child Management Routes
  // Add a child to a parent's profile
  app.post("/api/children", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Only parents can add children
      if (user.userType !== "parent") {
        return res.status(403).json({ message: "Only parents can add children" });
      }

      const { data, error } = validateRequest(insertChildSchema, req.body);
      
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      
      // Ensure parentId matches authenticated user
      if (data.parentId !== user.id) {
        return res.status(403).json({ message: "Parent ID must match authenticated user" });
      }

      const child = await storage.createChild(data);
      res.status(201).json(child);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to add child" });
    }
  });

  // Get all children for a parent
  app.get("/api/children", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      // Only parents can view their children
      if (user.userType !== "parent") {
        return res.status(403).json({ message: "Only parents can view their children" });
      }

      const children = await storage.getChildrenByParentId(user.id);
      res.status(200).json(children);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get children" });
    }
  });

  // Update a child's information
  app.patch("/api/children/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const childId = Number(req.params.id);
      
      // Verify the child exists
      const child = await storage.getChildById(childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      // Verify the child belongs to the authenticated parent
      if (child.parentId !== user.id) {
        return res.status(403).json({ message: "You can only update your own children's information" });
      }

      const { data, error } = validateRequest(
        insertChildSchema.partial().omit({ parentId: true }), 
        req.body
      );
      
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      
      const updatedChild = await storage.updateChild(childId, data);
      res.status(200).json(updatedChild);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update child" });
    }
  });

  // Get a specific child by ID
  app.get("/api/children/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const childId = Number(req.params.id);
      
      // Verify the child exists
      const child = await storage.getChildById(childId);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      // Verify the child belongs to the authenticated parent
      if (child.parentId !== user.id) {
        return res.status(403).json({ message: "You can only view your own children's information" });
      }

      res.status(200).json(child);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get child" });
    }
  });

  // Booking Payment Routes - 15% platform commission
  if (process.env.STRIPE_SECRET_KEY) {
    // Create payment intent for completed booking
    app.post("/api/bookings/:id/create-payment", authenticate, async (req: Request, res: Response) => {
      try {
        const bookingId = parseInt(req.params.id);
        const { totalAmount } = req.body; // in dollars
        
        const booking = await storage.getBooking(bookingId);
        if (!booking) {
          return res.status(404).json({ message: "Booking not found" });
        }
        
        if (booking.status !== "completed") {
          return res.status(400).json({ message: "Booking must be completed before payment" });
        }
        
        // Calculate amounts: 15% platform fee, 85% to babysitter
        const totalAmountCents = Math.round(totalAmount * 100);
        const platformFeeCents = Math.round(totalAmountCents * 0.15);
        const babysitterAmountCents = totalAmountCents - platformFeeCents;
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmountCents,
          currency: "usd",
          payment_method_types: ['card'],
          metadata: {
            bookingId: bookingId.toString(),
            platformFee: platformFeeCents.toString(),
            babysitterAmount: babysitterAmountCents.toString(),
          },
        });
        
        // Update booking with payment details
        await storage.updateBookingPayment(bookingId, {
          totalAmount: totalAmountCents,
          platformFee: platformFeeCents,
          babysitterAmount: babysitterAmountCents,
          stripePaymentIntentId: paymentIntent.id,
        });
        
        res.status(200).json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          platformFee: platformFeeCents / 100,
          babysitterAmount: babysitterAmountCents / 100,
        });
      } catch (error: any) {
        console.error("Error creating booking payment:", error);
        res.status(500).json({ message: error.message || "Failed to create payment" });
      }
    });
    
    // Confirm payment and transfer to babysitter
    app.post("/api/bookings/:id/confirm-payment", authenticate, async (req: Request, res: Response) => {
      try {
        const bookingId = parseInt(req.params.id);
        const { paymentIntentId } = req.body;
        
        const booking = await storage.getBooking(bookingId);
        if (!booking) {
          return res.status(404).json({ message: "Booking not found" });
        }
        
        // Verify payment succeeded
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== "succeeded") {
          return res.status(400).json({ message: "Payment has not succeeded" });
        }
        
        // Get babysitter details
        const babysitter = await storage.getUser(booking.babysitterId!);
        if (!babysitter) {
          return res.status(404).json({ message: "Babysitter not found" });
        }
        
        // Transfer money to babysitter (if they have Stripe Connect setup)
        if (babysitter.stripeAccountId) {
          await stripe.transfers.create({
            amount: booking.babysitterAmount!,
            currency: "usd",
            destination: babysitter.stripeAccountId,
            metadata: {
              bookingId: bookingId.toString(),
            },
          });
        }
        
        // Update booking status to paid
        await storage.updateBookingStatus(bookingId, "paid");
        await storage.updateBookingPaidAt(bookingId, new Date());
        
        res.status(200).json({
          success: true,
          message: "Payment processed and transferred to babysitter",
        });
      } catch (error: any) {
        console.error("Error confirming payment:", error);
        res.status(500).json({ message: error.message || "Failed to confirm payment" });
      }
    });
  }

  // Membership Payment Routes
  if (process.env.STRIPE_SECRET_KEY) {
    // Create payment intent for membership payment
    app.post("/api/create-membership-intent", authenticate, async (req: Request, res: Response) => {
      try {
        const { paymentType, userId, promoCode, discount } = req.body;
        
        if (!paymentType || !userId) {
          return res.status(400).json({ message: "Payment type and user ID are required" });
        }
        
        // Verify the user exists
        const user = await storage.getUser(Number(userId));
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Base amount based on payment type
        let baseAmount = paymentType === "full" ? 50000 : 25000; // $500 or $250 in cents
        
        // Apply discount if promo code is provided
        let amount = baseAmount;
        if (promoCode && discount) {
          // Apply the discount percentage
          amount = Math.round(baseAmount * (100 - discount) / 100);
          console.log(`Applied promo code ${promoCode} with ${discount}% discount. Amount reduced from ${baseAmount} to ${amount}`);
        }
        
        if (!stripe) {
          return res.status(500).json({ message: "Stripe is not configured" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: "usd",
          payment_method_types: ['card'],
          metadata: {
            userId: userId.toString(),
            paymentType,
            membershipType: paymentType === "full" ? "full_payment" : "installment_1",
            promoCode: promoCode || "",
            discount: discount ? discount.toString() : "0"
          },
        });
        
        res.status(200).json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      } catch (error: any) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ message: error.message || "Failed to create payment intent" });
      }
    });
    
    // Verify a completed payment
    app.post("/api/verify-membership-payment", authenticate, async (req: Request, res: Response) => {
      try {
        const { paymentIntentId, userId } = req.body;
        
        if (!paymentIntentId || !userId) {
          return res.status(400).json({ message: "Payment intent ID and user ID are required" });
        }
        
        // Verify the user exists
        const user = await storage.getUser(Number(userId));
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        if (!stripe) {
          return res.status(500).json({ message: "Stripe is not configured" });
        }
        
        // Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== "succeeded") {
          return res.status(400).json({ message: "Payment has not succeeded" });
        }
        
        // Extract payment type from metadata
        const paymentType = paymentIntent.metadata.paymentType;
        const membershipStatus = paymentType === "full" ? "active" : "installment_1";
        
        // Update user's membership status with the new dedicated method
        try {
          await storage.updateUserMembership(Number(userId), {
            membershipStatus,
            membershipType: paymentType === "full" ? "one-time" : "installment",
            membershipPaymentDate: new Date(),
            stripePaymentIntentId: paymentIntentId
          });
        } catch (err) {
          console.warn("Could not update user membership status:", err);
        }
        
        res.status(200).json({
          success: true,
          paymentType,
          membershipStatus,
        });
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: error.message || "Failed to verify payment" });
      }
    });
    
    // Update membership status endpoint
    app.patch("/api/users/membership", authenticate, async (req: Request, res: Response) => {
      try {
        const { userId, membershipStatus, promoCode, discount } = req.body;
        
        if (!userId || !membershipStatus) {
          return res.status(400).json({ message: "User ID and membership status are required" });
        }
        
        // Only allow specific membership status values
        if (!["active", "installment_1", "installment_2", "expired"].includes(membershipStatus)) {
          return res.status(400).json({ message: "Invalid membership status" });
        }
        
        // Log promo code information if available
        if (promoCode && discount) {
          console.log(`Applying promo code ${promoCode} with ${discount}% discount for user ${userId}`);
        }
        
        // Create a metadata object for tracking promotion information
        const metadata: any = {
          membershipStatus,
          membershipType: membershipStatus === "active" ? "one-time" : "installment",
          membershipPaymentDate: new Date()
        };
        
        // Add promo code information if available
        if (promoCode) {
          metadata.promoCode = promoCode;
          metadata.discountApplied = discount;
        }
        
        // Update the user's membership status
        const updatedUser = await storage.updateUserMembership(Number(userId), metadata);
        
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Don't send password back
        const { password, ...userWithoutPassword } = updatedUser;
        
        res.status(200).json(userWithoutPassword);
      } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to update membership status" });
      }
    });
  }

  const httpServer = createServer(app);

  return httpServer;
}
