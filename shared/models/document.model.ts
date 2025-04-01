import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

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

export type NoteDocument = typeof noteDocuments.$inferSelect; 