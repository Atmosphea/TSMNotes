import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, date } from "drizzle-orm/pg-core";

export const noteListings = pgTable("note_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  title: text("title").notNull(),
  noteType: text("note_type").notNull(),
  performanceStatus: text("performance_status").notNull(),
  
  // Loan details
  originalLoanAmount: doublePrecision("original_loan_amount").notNull(),
  currentLoanAmount: doublePrecision("current_loan_amount").notNull(),
  interestRate: doublePrecision("interest_rate").notNull(),
  originalLoanTerm: integer("original_loan_term").notNull(),
  remainingLoanTerm: integer("remaining_loan_term").notNull(),
  monthlyPaymentAmount: doublePrecision("monthly_payment_amount").notNull(),
  loanOriginationDate: date("loan_origination_date"),
  loanMaturityDate: date("loan_maturity_date"),
  paymentHistory: integer("payment_history"),
  
  // Property details
  propertyAddress: text("property_address").notNull(),
  propertyCity: text("property_city"),
  propertyState: text("property_state").notNull(),
  propertyZipCode: text("property_zip_code"),
  propertyCounty: text("property_county"),
  propertyType: text("property_type").notNull(),
  propertyValue: doublePrecision("property_value"),
  loanToValueRatio: doublePrecision("loan_to_value_ratio").default(75),
  propertyDescription: text("property_description"),
  
  // Security & collateral information
  isSecured: boolean("is_secured").default(true),
  collateralType: text("collateral_type"),
  
  // Financial details
  askingPrice: doublePrecision("asking_price").notNull(),
  expectedYield: doublePrecision("expected_yield"),
  amortizationType: text("amortization_type"),
  paymentFrequency: text("payment_frequency").default('monthly'),
  
  // Listing status & visibility
  status: text("status").default('active').notNull(),
  featured: boolean("featured").default(false),
  isPublic: boolean("is_public").default(true),
  verificationStatus: text("verification_status").default('pending'),
  
  // Additional information
  description: text("description"),
  specialNotes: text("special_notes"),
  
  // Due diligence
  dueDiligenceCompleted: boolean("due_diligence_completed").default(false),
  dueDiligenceNotes: text("due_diligence_notes"),
  
  // Admin review
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  adminNotes: text("admin_notes"),
  
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


export type NoteListing = typeof noteListings.$inferSelect;