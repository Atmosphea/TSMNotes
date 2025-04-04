import { db } from "../db";
import { users, type User } from "@shared/models";
import { InsertUser } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export const userService = {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  },
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  },
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  },

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  },

  async deleteUser(id: number): Promise<boolean> {
    try {
      const deleted = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning({ id: users.id });
      
      return deleted.length > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
}; 