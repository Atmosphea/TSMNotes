import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";

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

export type InvestorPreferences = typeof investorPreferences.$inferSelect; 