import { db } from "../db";
import { inquiries, type Inquiry, noteListings } from "@shared/models";
import { type InsertInquiry } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export const inquiryService = {
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db
      .insert(inquiries)
      .values(inquiry)
      .returning();
    
    // Increment the inquiry count for the corresponding note listing
    await db
      .update(noteListings)
      .set({
        inquiryCount: sql`${noteListings.inquiryCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(noteListings.id, inquiry.noteListingId));
    
    return newInquiry;
  },
  
  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, id));
    return inquiry;
  },
  
  async getInquiriesByNoteListingId(noteListingId: number): Promise<Inquiry[]> {
    return await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.noteListingId, noteListingId))
      .orderBy(desc(inquiries.createdAt));
  },
  
  async getInquiriesByBuyerId(buyerId: number): Promise<Inquiry[]> {
    return await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.buyerId, buyerId))
      .orderBy(desc(inquiries.createdAt));
  },
  
  async updateInquiry(id: number, inquiryData: Partial<InsertInquiry>): Promise<Inquiry | undefined> {
    const updateData = {
      ...inquiryData,
      ...(inquiryData.status === 'accepted' || inquiryData.status === 'rejected'
        ? { respondedAt: new Date() }
        : {})
    };
    
    const [updatedInquiry] = await db
      .update(inquiries)
      .set(updateData)
      .where(eq(inquiries.id, id))
      .returning();
    
    return updatedInquiry;
  },
  
  async deleteInquiry(id: number): Promise<boolean> {
    const result = await db
      .delete(inquiries)
      .where(eq(inquiries.id, id))
      .returning();
    
    return result.length > 0;
  },

  async updateInquiryStatus(
    inquiryId: number, 
    status: string, 
    responseMessage?: string
  ): Promise<Inquiry> {
    const [updatedInquiry] = await db
      .update(inquiries)
      .set({
        status,
        responseMessage,
        respondedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(inquiries.id, inquiryId))
      .returning();
    
    return updatedInquiry;
  }
}; 