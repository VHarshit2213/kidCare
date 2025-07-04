import { 
  users, bookings, messages, children, reviews, parentReviews, passwordResetTokens,
  type User, type InsertUser, 
  type Booking, type InsertBooking,
  type Message, type InsertMessage,
  type Child, type InsertChild,
  type Review, type InsertReview,
  type ParentReview, type InsertParentReview,
  type PasswordResetToken, type InsertPasswordResetToken
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
  updateUserAvailability(userId: number, availabilityStatus: string): Promise<User | undefined>;
  
  // Membership methods
  updateUserMembership(userId: number, membershipData: {
    membershipStatus: string;
    membershipType: string;
    membershipPaymentDate?: Date;
    stripeCustomerId?: string;
    stripePaymentIntentId?: string;
  }): Promise<User | undefined>;
  
  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByParentId(parentId: number): Promise<Booking[]>;
  getBookingsByBabysitterId(babysitterId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  assignBabysitterToBooking(bookingId: number, babysitterId: number): Promise<Booking | undefined>;
  updateBookingPayment(id: number, paymentData: {
    totalAmount: number;
    platformFee: number;
    babysitterAmount: number;
    stripePaymentIntentId: string;
  }): Promise<Booking | undefined>;
  updateBookingPaidAt(id: number, paidAt: Date): Promise<Booking | undefined>;
  
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
  
  // Review methods (babysitter to parent)
  createReview(review: InsertReview): Promise<Review>;
  getReviewById(id: number): Promise<Review | undefined>;
  getReviewsByBookingId(bookingId: number): Promise<Review[]>;
  getReviewsByRevieweeId(revieweeId: number): Promise<Review[]>; // Reviews for a parent
  getReviewsByReviewerId(reviewerId: number): Promise<Review[]>; // Reviews by a babysitter
  getAllReviews(): Promise<Review[]>; // For admin view
  
  // Parent Review methods (parent to babysitter)
  createParentReview(review: InsertParentReview): Promise<ParentReview>;
  getParentReviewById(id: number): Promise<ParentReview | undefined>;
  getParentReviewsByBookingId(bookingId: number): Promise<ParentReview[]>;
  getParentReviewsByRevieweeId(revieweeId: number): Promise<ParentReview[]>; // Reviews for a babysitter
  getParentReviewsByReviewerId(reviewerId: number): Promise<ParentReview[]>; // Reviews by a parent
  getAllParentReviews(): Promise<ParentReview[]>; // For admin view
  
  // Password Reset Token methods
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(token: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private messages: Map<number, Message>;
  private children: Map<number, Child>;
  private reviews: Map<number, Review>;
  private parentReviews: Map<number, ParentReview>;
  private passwordResetTokens: Map<number, PasswordResetToken>;
  private userIdCounter: number;
  private bookingIdCounter: number;
  private messageIdCounter: number;
  private childIdCounter: number;
  private reviewIdCounter: number;
  private parentReviewIdCounter: number;
  private tokenIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.messages = new Map();
    this.children = new Map();
    this.reviews = new Map();
    this.parentReviews = new Map();
    this.passwordResetTokens = new Map();
    this.userIdCounter = 1;
    this.bookingIdCounter = 1;
    this.messageIdCounter = 1;
    this.childIdCounter = 1;
    this.reviewIdCounter = 1;
    this.parentReviewIdCounter = 1;
    this.tokenIdCounter = 1;
    
    // Initialize the session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create admin user with a complete profile
    const adminUser = {
      id: this.userIdCounter++,
      username: "ecadmin",
      password: "d61eb01afc0a371c39232a66fd4ec114322c22d4cf3009ecea75106e6f0a09fa887bef0589fced96ebdc8f21a7b8bfa38ca454e427614bc8be4f4198a1c3aaa7.ba1ac14e4d6740761620278958a51531", // Pre-hashed password for "ecc0524"
      email: "hello@lovetheenchantedco.com",
      fullName: "System Administrator",
      userType: "parent", // using parent type for simplicity
      profileCompleted: true,
      firstName: "System",
      lastName: "Administrator",
      // Initialize fields with default values
      profileImageUrl: null,
      bio: null,
      hourlyRate: null,
      skills: null,
      firstAidCertified: null,
      hasTransportation: null,
      yearsExperience: null,
      location: null,
      address: null,
      phoneNumber: null,
      membershipStatus: 'none',
      membershipType: null,
      membershipPaymentDate: null,
      stripeCustomerId: null,
      stripePaymentIntentId: null,
      parentingStyle: null,
      familyDescription: null,
      familyActivities: null,
      medicalDietaryRestrictions: null,
      emergencyContacts: null,
      reviewStatus: null
    };
    
    // Add admin user to the users map
    this.users.set(adminUser.id, adminUser);
    
    // Add guest parent account for anonymous bookings with pre-hashed password
    this.createUser({
      username: "guest_parent",
      password: "47cf919d3bec75c4a2e51c895c3b8f2d50bfc1f4bcf28e564e5a33ef3e3d38173b3d4a38e3cd65cad529cce3fc21fb48733a1839e4b9209c3c3f9c55fb8fd5d1.5ac3ad64c0e811a0",
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
    
    // Create a base user object with all fields properly initialized
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
      // Initialize shared profile fields
      firstName: null,
      lastName: null,
      address: null,
      phoneNumber: null,
      profileCompleted: false,
      // Initialize membership fields
      membershipStatus: 'none',
      membershipType: null,
      membershipPaymentDate: null,
      stripeCustomerId: null,
      stripePaymentIntentId: null,
      // Initialize parent profile fields
      parentingStyle: null,
      familyDescription: null,
      familyActivities: null,
      medicalDietaryRestrictions: null,
      emergencyContacts: null,
      // Initialize review status for babysitters
      reviewStatus: null,
      // Initialize availability status for babysitters
      availabilityStatus: 'offline',
      // Initialize Stripe Connect fields
      stripeAccountId: null,
      stripeAccountStatus: 'none'
    };
    
    // Handle any additional fields from insertUser
    if ('reviewStatus' in insertUser) {
      (user as any).reviewStatus = insertUser.reviewStatus || null;
    }
    
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

  async updateUserAvailability(userId: number, availabilityStatus: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, availabilityStatus };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserMembership(userId: number, membershipData: {
    membershipStatus: string;
    membershipType: string;
    membershipPaymentDate?: Date;
    stripeCustomerId?: string;
    stripePaymentIntentId?: string;
  }): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      membershipStatus: membershipData.membershipStatus,
      membershipType: membershipData.membershipType,
      membershipPaymentDate: membershipData.membershipPaymentDate || null,
      stripeCustomerId: membershipData.stripeCustomerId || null,
      stripePaymentIntentId: membershipData.stripePaymentIntentId || null
    };
    
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

  async updateBookingPayment(id: number, paymentData: {
    totalAmount: number;
    platformFee: number;
    babysitterAmount: number;
    stripePaymentIntentId: string;
  }): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { 
      ...booking, 
      totalAmount: paymentData.totalAmount,
      platformFee: paymentData.platformFee,
      babysitterAmount: paymentData.babysitterAmount,
      stripePaymentIntentId: paymentData.stripePaymentIntentId
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async updateBookingPaidAt(id: number, paidAt: Date): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, paidAt };
    this.bookings.set(id, updatedBooking);
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
      // Create a name field from firstName and lastName if not provided
      name: insertChild.name || `${insertChild.firstName} ${insertChild.lastName}`,
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
    // Demo babysitter 1 - using pre-hashed password for "password123"
    this.createUser({
      username: "emily_wilson",
      password: "c82a7ac3fe35eb06fbf7ac2174cefa5e0fffc29d76ad9a3a6b5ac0be93203c8f0e01ae466400b2ea144d374a4215a232a84649cdb3072366a7b6a5c8d4bbc319.04e5ff2d3a97a75c",
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
      location: "New York, NY",
      reviewStatus: "pending"
    });

    // Demo babysitter 2 - using pre-hashed password for "password123"
    this.createUser({
      username: "marcus_johnson",
      password: "c82a7ac3fe35eb06fbf7ac2174cefa5e0fffc29d76ad9a3a6b5ac0be93203c8f0e01ae466400b2ea144d374a4215a232a84649cdb3072366a7b6a5c8d4bbc319.04e5ff2d3a97a75c",
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
      location: "Chicago, IL",
      reviewStatus: "pending"
    });

    // Demo babysitter 3 - using pre-hashed password for "password123"
    this.createUser({
      username: "sophia_martinez",
      password: "c82a7ac3fe35eb06fbf7ac2174cefa5e0fffc29d76ad9a3a6b5ac0be93203c8f0e01ae466400b2ea144d374a4215a232a84649cdb3072366a7b6a5c8d4bbc319.04e5ff2d3a97a75c",
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
      location: "Los Angeles, CA",
      reviewStatus: "pending"
    });
  }

  // Review methods implementation
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    
    // Calculate overall rating as average of all ratings
    const ratings = [
      insertReview.clarityOfExpectations,
      insertReview.communication,
      insertReview.childBehavior,
      insertReview.environment,
      insertReview.timeliness,
      insertReview.respect,
      insertReview.emergencyPreparation,
      insertReview.wouldSitAgain
    ];
    const overallRating = Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
    
    const review: Review = {
      id,
      ...insertReview,
      overallRating,
      createdAt: new Date(),
    };
    
    this.reviews.set(id, review);
    return review;
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByBookingId(bookingId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.bookingId === bookingId);
  }

  async getReviewsByRevieweeId(revieweeId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.revieweeId === revieweeId);
  }

  async getReviewsByReviewerId(reviewerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.reviewerId === reviewerId);
  }

  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  // Parent Review methods implementation
  async createParentReview(insertParentReview: InsertParentReview): Promise<ParentReview> {
    const id = this.parentReviewIdCounter++;
    
    // Calculate overall rating
    const ratings = [
      insertParentReview.punctuality,
      insertParentReview.communication,
      insertParentReview.childEngagement,
      insertParentReview.safety,
      insertParentReview.cleanlinessResponsibility,
      insertParentReview.followsInstructions,
      insertParentReview.childReaction,
      insertParentReview.wouldBookAgain,
    ];
    
    const overallRating = Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
    
    const parentReview: ParentReview = {
      id,
      ...insertParentReview,
      overallRating,
      notes: insertParentReview.notes || null,
      createdAt: new Date(),
    };
    
    this.parentReviews.set(id, parentReview);
    return parentReview;
  }

  async getParentReviewById(id: number): Promise<ParentReview | undefined> {
    return this.parentReviews.get(id);
  }

  async getParentReviewsByBookingId(bookingId: number): Promise<ParentReview[]> {
    return Array.from(this.parentReviews.values()).filter(review => review.bookingId === bookingId);
  }

  async getParentReviewsByRevieweeId(revieweeId: number): Promise<ParentReview[]> {
    return Array.from(this.parentReviews.values()).filter(review => review.revieweeId === revieweeId);
  }

  async getParentReviewsByReviewerId(reviewerId: number): Promise<ParentReview[]> {
    return Array.from(this.parentReviews.values()).filter(review => review.reviewerId === reviewerId);
  }

  async getAllParentReviews(): Promise<ParentReview[]> {
    return Array.from(this.parentReviews.values());
  }

  // Password Reset Token methods
  async createPasswordResetToken(insertToken: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const token: PasswordResetToken = {
      id: this.tokenIdCounter++,
      ...insertToken,
      createdAt: new Date(),
    };
    this.passwordResetTokens.set(token.id, token);
    return token;
  }

  async getPasswordResetToken(tokenString: string): Promise<PasswordResetToken | undefined> {
    for (const token of this.passwordResetTokens.values()) {
      if (token.token === tokenString && !token.used && token.expiresAt > new Date()) {
        return token;
      }
    }
    return undefined;
  }

  async markTokenAsUsed(tokenString: string): Promise<void> {
    for (const token of this.passwordResetTokens.values()) {
      if (token.token === tokenString) {
        token.used = true;
        break;
      }
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    for (const [id, token] of this.passwordResetTokens.entries()) {
      if (token.expiresAt < now || token.used) {
        this.passwordResetTokens.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
