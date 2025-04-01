import { pgTable, text, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";

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

export type Transaction = typeof transactions.$inferSelect; 