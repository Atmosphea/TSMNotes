import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, date, jsonb, primaryKey, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  // User can be "investor", "seller", "admin", or multiple roles
  role: text("role").default('investor'),
  // Account status
  status: text("status").default('active').notNull(), // active, inactive, pending_verification
  // Profile information
  bio: text("bio"),
  phone: text("phone"),
  company: text("company"),
  website: text("website"),
  location: text("location"),
  profileImageUrl: text("profile_image_url"),
  // Notification preferences
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  marketingEmails: boolean("marketing_emails").default(true),
  // Securities info for regulators
  isAccreditedInvestor: boolean("is_accredited_investor").default(false),
  accreditationProofUrl: text("accreditation_proof_url"),
  // Timestamps
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  
  // Basic note details
  title: text("title").notNull(), // e.g., "Commercial Property Note in Denver"
  noteType: text("note_type").notNull(), // mortgage, land contract, deed of trust, etc.
  performanceStatus: text("performance_status").notNull(), // performing, non-performing, sub-performing
  
  // Loan details
  originalLoanAmount: doublePrecision("original_loan_amount").notNull(),
  currentLoanAmount: doublePrecision("current_loan_amount").notNull(), // principal balance
  interestRate: doublePrecision("interest_rate").notNull(),
  originalLoanTerm: integer("original_loan_term").notNull(), // in months
  remainingLoanTerm: integer("remaining_loan_term").notNull(), // in months
  monthlyPaymentAmount: doublePrecision("monthly_payment_amount").notNull(),
  loanOriginationDate: date("loan_origination_date"),
  loanMaturityDate: date("loan_maturity_date"),
  paymentHistory: integer("payment_history"), // months of consistent payment history
  
  // Property details
  propertyAddress: text("property_address").notNull(),
  propertyCity: text("property_city"),
  propertyState: text("property_state").notNull(),
  propertyZipCode: text("property_zip_code"),
  propertyCounty: text("property_county"),
  propertyType: text("property_type").notNull(), // single-family, multi-family, commercial, etc.
  propertyValue: doublePrecision("property_value"),
  loanToValueRatio: doublePrecision("loan_to_value_ratio").default(75),
  propertyDescription: text("property_description"),
  
  // Security & collateral information
  isSecured: boolean("is_secured").default(true),
  collateralType: text("collateral_type"), // 1st position, 2nd position, etc.
  
  // Financial details
  askingPrice: doublePrecision("asking_price").notNull(),
  expectedYield: doublePrecision("expected_yield"), // calculated yield based on askingPrice
  amortizationType: text("amortization_type"), // fully-amortized, interest-only, balloon
  paymentFrequency: text("payment_frequency").default('monthly'), // monthly, bi-weekly, quarterly
  
  // Listing status & visibility
  status: text("status").default('active').notNull(), // active, pending, sold, expired, draft
  featured: boolean("featured").default(false),
  isPublic: boolean("is_public").default(true),
  verificationStatus: text("verification_status").default('pending'), // pending, verified, rejected
  
  // Additional information
  description: text("description"),
  specialNotes: text("special_notes"), // foreclosure status, bankruptcy, etc.
  
  // Due diligence
  dueDiligenceCompleted: boolean("due_diligence_completed").default(false),
  dueDiligenceNotes: text("due_diligence_notes"),
  
  // Stats & metrics
  viewCount: integer("view_count").default(0),
  favoriteCount: integer("favorite_count").default(0),
  inquiryCount: integer("inquiry_count").default(0),
  
  // Timestamps
  listedAt: timestamp("listed_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// For storing document URLs
export const noteDocuments = pgTable("note_documents", {
  id: serial("id").primaryKey(),
  noteListingId: integer("note_listing_id").notNull(),
  documentType: text("document_type").notNull(), // loan_application, credit_appraisal, title_report, note, payment_history, appraisal
  documentUrl: text("document_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  isPublic: boolean("is_public").default(false), // Controls if document is viewable before transaction
  uploadedById: integer("uploaded_by_id"), // User ID of the uploader
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  description: text("description"),
  verificationStatus: text("verification_status").default('pending'), // pending, verified, rejected
});

// User search preferences/criteria
export const investorPreferences = pgTable("investor_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // One preference record per user
  
  // Note type preferences
  preferredNoteTypes: text("preferred_note_types").array(), // mortgage, land contract, etc.
  preferredPerformanceStatus: text("preferred_performance_status").array(), // performing, non-performing
  
  // Financial criteria
  minLoanAmount: doublePrecision("min_loan_amount"),
  maxLoanAmount: doublePrecision("max_loan_amount"),
  minInterestRate: doublePrecision("min_interest_rate"),
  maxLoanTerm: integer("max_loan_term"), // in months
  minYield: doublePrecision("min_yield"),
  maxLTV: doublePrecision("max_ltv"),
  
  // Location preferences
  preferredStates: text("preferred_states").array(),
  preferredCities: text("preferred_cities").array(),
  preferredZipCodes: text("preferred_zip_codes").array(),
  
  // Property preferences
  preferredPropertyTypes: text("preferred_property_types").array(), // residential, commercial, multi-family
  
  // Other preferences
  prefersDueAdditionalDiligence: boolean("prefers_due_diligence_completed").default(false),
  prefersSecured: boolean("prefers_secured").default(true),
  
  // Notification preferences
  notifyOnNewListings: boolean("notify_on_new_listings").default(true),
  notifyOnPriceDrops: boolean("notify_on_price_drops").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Saved searches for users
export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(), // User-defined name for the search
  
  // Search criteria (storing as JSON for flexibility)
  criteria: jsonb("criteria").notNull(),
  
  lastRunAt: timestamp("last_run_at"),
  totalMatches: integer("total_matches").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Saved/favorited listings
export const favoriteListings = pgTable("favorite_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  noteListingId: integer("note_listing_id").notNull(),
  notes: text("notes"), // Private notes from the user about this listing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Define a unique constraint to prevent duplicate favorites
}, (table) => {
  return {
    // Ensure a user can only favorite a listing once
    uniqueFavorite: unique({ columns: [table.userId, table.noteListingId] }),
  };
});

// Inquiries/offers from potential buyers
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  noteListingId: integer("note_listing_id").notNull(),
  
  // Inquiry details
  message: text("message").notNull(),
  offerAmount: doublePrecision("offer_amount"), // Optional: buyer can make an offer
  
  // Status tracking
  status: text("status").default('pending').notNull(), // pending, accepted, rejected, expired
  responseMessage: text("response_message"), // Seller's response
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
});

// Transaction records for sold notes
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  noteListingId: integer("note_listing_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  
  // Financial details
  finalAmount: doublePrecision("final_amount").notNull(),
  platformFee: doublePrecision("platform_fee"),
  
  // Transaction status
  status: text("status").default('pending').notNull(), // pending, completed, cancelled, disputed
  
  // Additional details
  contractUrl: text("contract_url"), // URL to signed contract
  notes: text("notes"), // Admin notes about transaction
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
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

// Insert schemas for all tables
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  bio: true,
  phone: true,
  company: true,
  website: true,
  location: true,
  profileImageUrl: true,
  emailNotifications: true,
  smsNotifications: true,
  marketingEmails: true,
  isAccreditedInvestor: true,
  accreditationProofUrl: true,
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
  title: true,
  noteType: true,
  performanceStatus: true,
  originalLoanAmount: true,
  currentLoanAmount: true,
  interestRate: true,
  originalLoanTerm: true,
  remainingLoanTerm: true,
  monthlyPaymentAmount: true,
  loanOriginationDate: true,
  loanMaturityDate: true,
  paymentHistory: true,
  propertyAddress: true,
  propertyCity: true,
  propertyState: true,
  propertyZipCode: true,
  propertyCounty: true,
  propertyType: true,
  propertyValue: true,
  loanToValueRatio: true,
  propertyDescription: true,
  isSecured: true,
  collateralType: true,
  askingPrice: true,
  expectedYield: true,
  amortizationType: true,
  paymentFrequency: true,
  status: true,
  featured: true,
  isPublic: true,
  verificationStatus: true,
  description: true,
  specialNotes: true,
  dueDiligenceCompleted: true,
  dueDiligenceNotes: true,
});

export const insertNoteDocumentSchema = createInsertSchema(noteDocuments).pick({
  noteListingId: true,
  documentType: true,
  documentUrl: true,
  fileName: true,
  fileSize: true,
  isPublic: true,
  uploadedById: true,
  description: true,
  verificationStatus: true,
});

export const insertInvestorPreferencesSchema = createInsertSchema(investorPreferences).pick({
  userId: true,
  preferredNoteTypes: true,
  preferredPerformanceStatus: true,
  minLoanAmount: true,
  maxLoanAmount: true,
  minInterestRate: true,
  maxLoanTerm: true,
  minYield: true,
  maxLTV: true,
  preferredStates: true,
  preferredCities: true,
  preferredZipCodes: true,
  preferredPropertyTypes: true,
  prefersDueAdditionalDiligence: true,
  prefersSecured: true,
  notifyOnNewListings: true,
  notifyOnPriceDrops: true,
});

export const insertSavedSearchSchema = createInsertSchema(savedSearches).pick({
  userId: true,
  name: true,
  criteria: true,
  isActive: true,
});

export const insertFavoriteListingSchema = createInsertSchema(favoriteListings).pick({
  userId: true,
  noteListingId: true,
  notes: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).pick({
  buyerId: true,
  noteListingId: true,
  message: true,
  offerAmount: true,
  status: true,
  responseMessage: true,
  expiresAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  noteListingId: true,
  sellerId: true,
  buyerId: true,
  finalAmount: true,
  platformFee: true,
  status: true,
  contractUrl: true,
  notes: true,
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

// Export types for all tables
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

export type InsertInvestorPreferences = z.infer<typeof insertInvestorPreferencesSchema>;
export type InvestorPreferences = typeof investorPreferences.$inferSelect;

export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;

export type InsertFavoriteListing = z.infer<typeof insertFavoriteListingSchema>;
export type FavoriteListing = typeof favoriteListings.$inferSelect;

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
