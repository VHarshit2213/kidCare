import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (for both parents and babysitters)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  userType: text("user_type").notNull(), // "parent" or "babysitter"
  profileImageUrl: text("profile_image_url"),
  bio: text("bio"),
  hourlyRate: integer("hourly_rate"), // only for babysitters
  skills: text("skills").array(), // array of skills, only for babysitters
  firstAidCertified: boolean("first_aid_certified").default(false), // for babysitters
  hasTransportation: boolean("has_transportation").default(false), // for babysitters
  yearsExperience: integer("years_experience"), // for babysitters
  location: text("location"), // General location information
  
  // Shared profile fields
  firstName: text("first_name"),
  lastName: text("last_name"),
  address: text("address"),
  phoneNumber: text("phone_number"),
  profileCompleted: boolean("profile_completed").default(false),
  reviewStatus: text("review_status").default("none"), // "none", "pending", "approved", "rejected"
  
  // Payment and membership fields
  membershipStatus: text("membership_status").default("none"), // "none", "pending", "active"
  membershipType: text("membership_type"), // "one-time" or "installment"
  membershipPaymentDate: timestamp("membership_payment_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  
  // Parent profile fields
  parentingStyle: text("parenting_style"),
  familyDescription: text("family_description"),
  familyActivities: text("family_activities"),
  medicalDietaryRestrictions: text("medical_dietary_restrictions"),
  emergencyContacts: jsonb("emergency_contacts"),
});

// Booking requests schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  babysitterId: integer("babysitter_id"), // nullable until a babysitter accepts
  childName: text("child_name").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  careInstructions: text("care_instructions"),
  status: text("status").notNull().default("pending"), // pending, accepted, completed, cancelled
  requiresFirstAid: boolean("requires_first_aid").default(false),
  requiresTransportation: boolean("requires_transportation").default(false),
  requiresExperience: boolean("requires_experience").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  bookingId: integer("booking_id"), // optional reference to a booking
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
});

// Children schema
export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  name: text("name").notNull(), // Added for convenience, combines firstName and lastName
  dateOfBirth: timestamp("date_of_birth"),
  personality: text("personality"), // interests, special qualities
  specialCare: text("special_care"), // any special care requirements
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for inserting a user
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Schema for inserting a booking
export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  babysitterId: true,
  status: true,
  createdAt: true,
});

// Schema for inserting a message
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
  isRead: true,
});

// Schema for inserting a child
export const insertChildSchema = createInsertSchema(children).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;
