import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const favoriteListings = pgTable("favorite_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  noteListingId: integer("note_listing_id").notNull(),
  notes: text("notes"), // Private notes from the user about this listing
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueFavorite: unique().on(table.userId, table.noteListingId)
}));

export type FavoriteListing = typeof favoriteListings.$inferSelect; 