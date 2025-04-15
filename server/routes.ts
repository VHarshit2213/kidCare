import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertBookingSchema, 
  insertMessageSchema, 
  insertChildSchema,
  users
} from "@shared/schema";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import express from "express";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
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

  // Authentication middleware - this is a simplified version for demo
  const authenticate = async (req: Request, res: Response, next: Function) => {
    // In a real app, this would validate JWT tokens or session cookies
    const userId = req.headers["user-id"];
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(Number(userId));
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Add user to request
    (req as any).user = user;
    next();
  };

  // User Routes
  app.post("/api/users/register", async (req, res) => {
    const { data, error } = validateRequest(insertUserSchema, req.body);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    try {
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(data);
      // Don't send the password back
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create user" });
    }
  });

  app.post("/api/users/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send the password back
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({ 
        ...userWithoutPassword,
        // In a real app, you would generate a JWT token here
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

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
      
      // Remove passwords from the response
      const babysittersWithoutPasswords = babysitters.map(babysitter => {
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
      res.status(200).json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to assign babysitter to booking" });
    }
  });

  // Message Routes
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

  const httpServer = createServer(app);

  return httpServer;
}
