import { db } from "../db";
import { messages, type Message } from "@shared/models";
import { type InsertMessage } from "@shared/schema";
import { eq, or } from "drizzle-orm";

export const messageService = {
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  },
  
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      );
  }
}; 