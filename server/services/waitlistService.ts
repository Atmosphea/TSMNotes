import { db } from "../db";
import { waitlistEntries, type WaitlistEntry } from "@shared/models";
import { type InsertWaitlistEntry } from "@shared/schema";
import { eq } from "drizzle-orm";

export const waitlistService = {
  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [waitlistEntry] = await db
      .insert(waitlistEntries)
      .values(entry)
      .returning();
    return waitlistEntry;
  },
  
  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    const [entry] = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.email, email));
    return entry;
  },
  
  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries);
  }
}; 