import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { 
  users, waitlistEntries, messages, noteListings, noteDocuments,
  investorPreferences, savedSearches, favoriteListings, inquiries,
  transactions, transactionTasks, transactionFiles, transactionTimelineEvents
} from "./models";

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
  reviewedBy: true,
  reviewedAt: true,
  rejectionReason: true,
  adminNotes: true,
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
  totalPrice: true,
  status: true,
  currentPhase: true,
  cutOffDate: true,
  closingDate: true,
  effectiveDate: true,
  closingScheduleType: true,
  sellerVestingInfo: true,
  buyerVestingInfo: true,
  sellerServicerInfo: true,
  buyerServicerInfo: true,
  buyerShippingAddress: true,
  sellerWireInfo: true,
  sellerCollateralShippingInfo: true,
  auditorVerificationReportUrl: true,
  contractUrl: true,
  notes: true,
});

export const insertTransactionTaskSchema = createInsertSchema(transactionTasks).pick({
  transactionId: true,
  taskIdentifier: true,
  description: true,
  status: true,
  phase: true,
  isRequired: true,
  assignedTo: true,
  completedByUserId: true,
  displayOrder: true,
});

export const insertTransactionFileSchema = createInsertSchema(transactionFiles).pick({
  transactionId: true,
  fileUrl: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  uploadedByUserId: true,
  description: true,
  isPublic: true,
  category: true,
  isVerified: true,
  verifiedByUserId: true,
});

export const insertTransactionTimelineEventSchema = createInsertSchema(transactionTimelineEvents).pick({
  transactionId: true,
  eventDescription: true,
  triggeredByUserId: true,
  eventType: true,
  eventData: true,
  relatedTaskId: true,
  relatedFileId: true,
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

export type InsertTransactionTask = z.infer<typeof insertTransactionTaskSchema>;
export type TransactionTask = typeof transactionTasks.$inferSelect;

export type InsertTransactionFile = z.infer<typeof insertTransactionFileSchema>;
export type TransactionFile = typeof transactionFiles.$inferSelect;

export type InsertTransactionTimelineEvent = z.infer<typeof insertTransactionTimelineEventSchema>;
export type TransactionTimelineEvent = typeof transactionTimelineEvents.$inferSelect;

// Creation of the access requests table and schema
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

// Access Request table
export const accessRequests = pgTable("access_requests", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  noteListingId: integer("note_listing_id").notNull().references(() => noteListings.id),
  requestType: text("request_type").notNull(), // contact, document, etc.
  status: text("status").notNull(), // pending, approved, rejected, expired
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  expiresAt: timestamp("expires_at").notNull(),
});

// Insert schema for access requests
export const insertAccessRequestSchema = createInsertSchema(accessRequests).pick({
  buyerId: true,
  noteListingId: true,
  requestType: true,
  status: true,
  expiresAt: true,
});

export type InsertAccessRequest = z.infer<typeof insertAccessRequestSchema>;
export type AccessRequest = typeof accessRequests.$inferSelect;
