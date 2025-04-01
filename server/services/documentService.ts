import { db } from "../db";
import { noteDocuments, type NoteDocument } from "@shared/models";
import { type InsertNoteDocument } from "@shared/schema";
import { eq } from "drizzle-orm";

export const documentService = {
  async createNoteDocument(document: InsertNoteDocument): Promise<NoteDocument> {
    const [newDocument] = await db
      .insert(noteDocuments)
      .values({
        ...document,
        isPublic: document.isPublic ?? false,
        description: document.description || null,
        verificationStatus: document.verificationStatus || 'pending'
      })
      .returning();
    return newDocument;
  },
  
  async getNoteDocumentsByListingId(noteListingId: number): Promise<NoteDocument[]> {
    return await db
      .select()
      .from(noteDocuments)
      .where(eq(noteDocuments.noteListingId, noteListingId));
  },
  
  async deleteNoteDocument(id: number): Promise<boolean> {
    const result = await db
      .delete(noteDocuments)
      .where(eq(noteDocuments.id, id))
      .returning();
    
    return result.length > 0;
  }
}; 