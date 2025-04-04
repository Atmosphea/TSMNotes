import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const transactionTasks = pgTable("transaction_tasks", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  
  taskIdentifier: text("task_identifier").notNull(), // Unique key for each task type
  description: text("description").notNull(), // User-friendly description
  status: text("status").default('pending').notNull(), // pending, complete, skipped, failed
  
  phase: text("phase").notNull(), // negotiations, closing
  isRequired: boolean("is_required").default(true).notNull(),
  assignedTo: text("assigned_to").notNull(), // buyer, seller, platform
  
  // Completion details
  completedByUserId: integer("completed_by_user_id"),
  completedAt: timestamp("completed_at"),
  
  // Order for display
  displayOrder: integer("display_order").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export type TransactionTask = typeof transactionTasks.$inferSelect;
export type InsertTransactionTask = typeof transactionTasks.$inferInsert;