import { pgTable, text, serial, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

export const searchAlerts = pgTable("search_alerts", {
  id: serial("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  filters: jsonb("filters").notNull(), // Stores the filter criteria as JSON
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SearchAlert = typeof searchAlerts.$inferSelect;
export type InsertSearchAlert = typeof searchAlerts.$inferInsert; 