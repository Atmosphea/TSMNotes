import { pgTable, text, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";

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

export type Inquiry = typeof inquiries.$inferSelect; 