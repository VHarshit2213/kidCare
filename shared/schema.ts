import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
