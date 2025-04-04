import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const transactionTimelineEvents = pgTable("transaction_timeline_events", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  
  eventDescription: text("event_description").notNull(),
  eventTimestamp: timestamp("event_timestamp").defaultNow().notNull(),
  
  triggeredByUserId: integer("triggered_by_user_id"),
  eventType: text("event_type").default('info').notNull(), // info, success, warning, error
  eventData: text("event_data"), // JSON string for additional data
  
  // For grouping/filtering
  relatedTaskId: integer("related_task_id"),
  relatedFileId: integer("related_file_id"),
});

export type TransactionTimelineEvent = typeof transactionTimelineEvents.$inferSelect;
export type InsertTransactionTimelineEvent = typeof transactionTimelineEvents.$inferInsert;