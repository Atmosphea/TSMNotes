import { pgTable, text, serial, integer, timestamp, doublePrecision, date, boolean } from "drizzle-orm/pg-core";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  noteListingId: integer("note_listing_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  
  // Financial details
  finalAmount: doublePrecision("final_amount").notNull(),
  platformFee: doublePrecision("platform_fee"),
  totalPrice: doublePrecision("total_price"),
  
  // Transaction status
  status: text("status").default('negotiations').notNull(), // negotiations, closing, completed, cancelled
  currentPhase: text("current_phase").default('negotiations').notNull(), // negotiations, closing, completed
  
  // Closing details
  cutOffDate: date("cut_off_date"),
  closingDate: date("closing_date"),
  effectiveDate: date("effective_date"),
  closingScheduleType: text("closing_schedule_type"),
  
  // Vesting information
  sellerVestingInfo: text("seller_vesting_info"),
  buyerVestingInfo: text("buyer_vesting_info"),
  
  // Servicer information
  sellerServicerInfo: text("seller_servicer_info"),
  buyerServicerInfo: text("buyer_servicer_info"),
  
  // Shipping and wire information
  buyerShippingAddress: text("buyer_shipping_address"),
  sellerWireInfo: text("seller_wire_info"),
  sellerCollateralShippingInfo: text("seller_collateral_shipping_info"),
  
  // Verification
  auditorVerificationReportUrl: text("auditor_verification_report_url"),
  
  // Additional details
  contractUrl: text("contract_url"), // URL to signed contract
  notes: text("notes"), // Admin notes about transaction
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Transaction = typeof transactions.$inferSelect; 