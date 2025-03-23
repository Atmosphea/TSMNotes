import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  // User can be "buyer", "seller", or both
  role: text("role").default('user'),
  // Contact info for sellers
  phone: text("phone"),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Updated to match our new requirements
export const noteListings = pgTable("note_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  
  // Required fields from user request
  loanAmount: doublePrecision("loan_amount").notNull(),
  interestRate: doublePrecision("interest_rate").notNull(),
  loanTerm: integer("loan_term").notNull(), // in months
  paymentAmount: doublePrecision("payment_amount").notNull(),
  timeHeld: integer("time_held").notNull(), // in months
  remainingPayments: integer("remaining_payments").notNull(),
  propertyAddress: text("property_address").notNull(),
  
  // Additional fields
  askingPrice: doublePrecision("asking_price").notNull(),
  propertyType: text("property_type").notNull(),
  description: text("description"),
  status: text("status").default('active').notNull(), // active, pending, sold
  
  // New fields for filters
  loanToValueRatio: doublePrecision("loan_to_value_ratio").default(75),
  propertyValue: doublePrecision("property_value"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// For storing document URLs
export const noteDocuments = pgTable("note_documents", {
  id: serial("id").primaryKey(),
  noteListingId: integer("note_listing_id").notNull(),
  documentType: text("document_type").notNull(), // loan_application, credit_appraisal, title_report, note, payment_history
  documentUrl: text("document_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedById: integer("uploaded_by_id"), // User ID of the uploader
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Keep the original notes table for backward compatibility
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  noteType: text("note_type").notNull(),
  performanceStatus: text("performance_status").notNull(),
  unpaidBalance: text("unpaid_balance").notNull(),
  noteRate: text("note_rate").notNull(),
  remainingTerm: integer("remaining_term").notNull(),
  paymentHistory: text("payment_history").notNull(),
  askingPrice: text("asking_price").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Extend the user schema to include passwordHash for internal use
export const userExtendedSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  phone: true,
  company: true,
});

export const insertWaitlistEntrySchema = createInsertSchema(waitlistEntries).pick({
  email: true,
  role: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
});

export const insertNoteListingSchema = createInsertSchema(noteListings).pick({
  sellerId: true,
  loanAmount: true,
  interestRate: true,
  loanTerm: true,
  paymentAmount: true,
  timeHeld: true,
  remainingPayments: true,
  propertyAddress: true,
  askingPrice: true,
  propertyType: true,
  description: true,
  status: true,
  loanToValueRatio: true,
  propertyValue: true,
});

export const insertNoteDocumentSchema = createInsertSchema(noteDocuments).pick({
  noteListingId: true,
  documentType: true,
  documentUrl: true,
  fileName: true,
  fileSize: true,
  uploadedById: true,
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  userId: true,
  title: true,
  description: true,
  location: true,
  noteType: true,
  performanceStatus: true,
  unpaidBalance: true,
  noteRate: true,
  remainingTerm: true,
  paymentHistory: true,
  askingPrice: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWaitlistEntry = z.infer<typeof insertWaitlistEntrySchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertNoteListing = z.infer<typeof insertNoteListingSchema>;
export type NoteListing = typeof noteListings.$inferSelect;

export type InsertNoteDocument = z.infer<typeof insertNoteDocumentSchema>;
export type NoteDocument = typeof noteDocuments.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
