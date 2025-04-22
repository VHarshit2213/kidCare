import { 
  users, bookings, messages, children,
  type User, type InsertUser, 
  type Booking, type InsertBooking,
  type Message, type InsertMessage,
  type Child, type InsertChild
} from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllBabysitters(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  updateUserProfile(userId: number, profileData: Partial<User>): Promise<User | undefined>;
  
  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByParentId(parentId: number): Promise<Booking[]>;
  getBookingsByBabysitterId(babysitterId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  assignBabysitterToBooking(bookingId: number, babysitterId: number): Promise<Booking | undefined>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Child methods
  createChild(child: InsertChild): Promise<Child>;
  getChildById(id: number): Promise<Child | undefined>;
  getChildrenByParentId(parentId: number): Promise<Child[]>;
  updateChild(id: number, updateData: Partial<Child>): Promise<Child | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private messages: Map<number, Message>;
  private children: Map<number, Child>;
  private userIdCounter: number;
  private bookingIdCounter: number;
  private messageIdCounter: number;
  private childIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.messages = new Map();
    this.children = new Map();
    this.userIdCounter = 1;
    this.bookingIdCounter = 1;
    this.messageIdCounter = 1;
    this.childIdCounter = 1;
    
    // Initialize the session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@enchantedco.com",
      fullName: "System Administrator",
      userType: "parent", // using parent type for simplicity
    });
    
    // Add guest parent account for anonymous bookings
    this.createUser({
      username: "guest_parent",
      password: "guest123",
      email: "guest@example.com",
      fullName: "Guest Parent",
      userType: "parent",
    });
    
    // Add demo babysitters only in development mode
    if (process.env.NODE_ENV === 'development') {
      this.addDemoBabysitters();
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      profileImageUrl: insertUser.profileImageUrl || null,
      bio: insertUser.bio || null,
      hourlyRate: insertUser.hourlyRate || null,
      skills: insertUser.skills || null,
      firstAidCertified: insertUser.firstAidCertified || null,
      hasTransportation: insertUser.hasTransportation || null,
      yearsExperience: insertUser.yearsExperience || null,
      location: insertUser.location || null,
      // Initialize parent profile fields
      firstName: null,
      lastName: null,
      address: null,
      phoneNumber: null,
      parentingStyle: null,
      familyDescription: null,
      familyActivities: null,
      medicalDietaryRestrictions: null,
      emergencyContacts: null,
      profileCompleted: false
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserProfile(userId: number, profileData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...profileData };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllBabysitters(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.userType === "babysitter",
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const now = new Date();
    const booking: Booking = {
      ...insertBooking,
      id,
      babysitterId: null,
      status: "pending",
      createdAt: now,
      careInstructions: insertBooking.careInstructions || null,
      requiresFirstAid: insertBooking.requiresFirstAid || null,
      requiresTransportation: insertBooking.requiresTransportation || null,
      requiresExperience: insertBooking.requiresExperience || null
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByParentId(parentId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.parentId === parentId,
    );
  }

  async getBookingsByBabysitterId(babysitterId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.babysitterId === babysitterId,
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async assignBabysitterToBooking(bookingId: number, babysitterId: number): Promise<Booking | undefined> {
    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, babysitterId, status: "accepted" };
    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      bookingId: insertMessage.bookingId || null,
      timestamp: now,
      isRead: false,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId,
    );
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id),
    ).sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return -1;
      if (!b.timestamp) return 1;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }

  async markMessageAsRead(id: number): Promise<void> {
    const message = this.messages.get(id);
    if (!message) return;
    
    this.messages.set(id, { ...message, isRead: true });
  }

  // Child methods
  async createChild(insertChild: InsertChild): Promise<Child> {
    const id = this.childIdCounter++;
    const now = new Date();
    const child: Child = {
      ...insertChild,
      id,
      dateOfBirth: insertChild.dateOfBirth || null,
      personality: insertChild.personality || null,
      specialCare: insertChild.specialCare || null,
      createdAt: now
    };
    this.children.set(id, child);
    return child;
  }

  async getChildById(id: number): Promise<Child | undefined> {
    return this.children.get(id);
  }

  async getChildrenByParentId(parentId: number): Promise<Child[]> {
    return Array.from(this.children.values()).filter(
      (child) => child.parentId === parentId
    );
  }

  async updateChild(id: number, updateData: Partial<Child>): Promise<Child | undefined> {
    const child = this.children.get(id);
    if (!child) return undefined;
    
    const updatedChild = { ...child, ...updateData };
    this.children.set(id, updatedChild);
    return updatedChild;
  }

  // Helper to add demo babysitters
  private addDemoBabysitters() {
    // Demo babysitter 1
    this.createUser({
      username: "emily_wilson",
      password: "password123", // In a real app, this would be hashed
      email: "emily@example.com",
      fullName: "Emily Wilson",
      userType: "babysitter",
      profileImageUrl: "https://images.unsplash.com/photo-1499887142886-791eca5918cd?ixlib=rb-4.0.3",
      bio: "5 years experience, CPR certified. I love working with children of all ages and have a background in early childhood education.",
      hourlyRate: 35,
      skills: ["First Aid", "Teacher", "Art & Craft"],
      firstAidCertified: true,
      hasTransportation: true,
      yearsExperience: 5,
      location: "New York, NY"
    });

    // Demo babysitter 2
    this.createUser({
      username: "marcus_johnson",
      password: "password123",
      email: "marcus@example.com",
      fullName: "Marcus Johnson",
      userType: "babysitter",
      profileImageUrl: "https://images.unsplash.com/photo-1580894742597-87bc8789db3d?ixlib=rb-4.0.3",
      bio: "3 years experience, background checked. I'm an energetic babysitter who loves sports and outdoor activities.",
      hourlyRate: 35,
      skills: ["First Aid", "Sports", "Cooking"],
      firstAidCertified: true,
      hasTransportation: true,
      yearsExperience: 3,
      location: "Chicago, IL"
    });

    // Demo babysitter 3
    this.createUser({
      username: "sophia_martinez",
      password: "password123",
      email: "sophia@example.com",
      fullName: "Sophia Martinez",
      userType: "babysitter",
      profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3",
      bio: "8 years experience, child development degree. I speak English, Spanish, and French.",
      hourlyRate: 35,
      skills: ["First Aid", "Music", "Multilingual"],
      firstAidCertified: true,
      hasTransportation: false,
      yearsExperience: 8,
      location: "Los Angeles, CA"
    });
  }
}

export const storage = new MemStorage();
