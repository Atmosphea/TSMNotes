import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const transactionFiles = pgTable("transaction_files", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  
  fileUrl: text("file_url").notNull(), // URL to the stored file
  fileName: text("file_name").notNull(), // Original filename
  fileType: text("file_type").notNull(), // Document type (e.g., PSA, Assignment, Allonge)
  fileSize: integer("file_size"), // Size in bytes
  
  uploadedByUserId: integer("uploaded_by_user_id").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(), // Whether visible to both parties
  category: text("category").default('other').notNull(), // closing, collateral, legal, etc.
  
  isVerified: boolean("is_verified").default(false),
  verifiedByUserId: integer("verified_by_user_id"),
  verifiedAt: timestamp("verified_at"),
});

export type TransactionFile = typeof transactionFiles.$inferSelect;
export type InsertTransactionFile = typeof transactionFiles.$inferInsert;