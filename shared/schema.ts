import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, waitlistEntries, messages, noteListings, noteDocuments, investorPreferences, savedSearches, favoriteListings, inquiries, transactions } from "./models";

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
