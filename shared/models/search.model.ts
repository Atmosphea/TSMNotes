import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  name: text("name").notNull(), // User-defined name for the search
  criteria: jsonb("criteria").notNull(),
  lastRunAt: timestamp("last_run_at"),
  totalMatches: integer("total_matches").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect; 