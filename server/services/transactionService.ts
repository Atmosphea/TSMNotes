import { db } from "../db";
import {
  InsertTransaction, Transaction, 
  InsertTransactionTask, TransactionTask,
  InsertTransactionFile, TransactionFile,
  InsertTransactionTimelineEvent, TransactionTimelineEvent,
  User, NoteListing
} from "@shared/schema";
import { 
  transactions, transactionTasks, transactionFiles, transactionTimelineEvents,
  users, noteListings
} from "@shared/models";
import { eq, and, desc } from "drizzle-orm";

export const transactionService = {
  // Transaction CRUD operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    return transaction;
  },
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  },
  
  async getTransactionsByBuyerId(buyerId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.buyerId, buyerId));
  },
  
  async getTransactionsBySellerId(sellerId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.sellerId, sellerId));
  },
  
  async updateTransaction(id: number, transactionData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db.update(transactions)
      .set(transactionData)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  },
  
  // Transaction Tasks operations
  async createTransactionTask(taskData: InsertTransactionTask): Promise<TransactionTask> {
    const [task] = await db.insert(transactionTasks).values(taskData).returning();
    return task;
  },
  
  async getTasksByTransactionId(transactionId: number): Promise<TransactionTask[]> {
    return db.select()
      .from(transactionTasks)
      .where(eq(transactionTasks.transactionId, transactionId))
      .orderBy(transactionTasks.displayOrder);
  },
  
  async completeTask(taskId: number, userId: number): Promise<TransactionTask | undefined> {
    const [updatedTask] = await db.update(transactionTasks)
      .set({
        status: 'complete',
        completedByUserId: userId,
        completedAt: new Date()
      })
      .where(eq(transactionTasks.id, taskId))
      .returning();
    return updatedTask;
  },
  
  // Transaction Files operations
  async createTransactionFile(fileData: InsertTransactionFile): Promise<TransactionFile> {
    const [file] = await db.insert(transactionFiles).values(fileData).returning();
    return file;
  },
  
  async getFilesByTransactionId(transactionId: number): Promise<TransactionFile[]> {
    return db.select()
      .from(transactionFiles)
      .where(eq(transactionFiles.transactionId, transactionId))
      .orderBy(desc(transactionFiles.uploadedAt));
  },
  
  // Timeline Events operations
  async createTimelineEvent(eventData: InsertTransactionTimelineEvent): Promise<TransactionTimelineEvent> {
    const [event] = await db.insert(transactionTimelineEvents).values(eventData).returning();
    return event;
  },
  
  async getTimelineByTransactionId(transactionId: number): Promise<TransactionTimelineEvent[]> {
    return db.select()
      .from(transactionTimelineEvents)
      .where(eq(transactionTimelineEvents.transactionId, transactionId))
      .orderBy(desc(transactionTimelineEvents.eventTimestamp));
  },
  
  // Helper methods
  async getTransactionWithRelatedData(id: number) {
    const transaction = await this.getTransactionById(id);
    if (!transaction) return undefined;
    
    const tasks = await this.getTasksByTransactionId(id);
    const files = await this.getFilesByTransactionId(id);
    const timeline = await this.getTimelineByTransactionId(id);
    
    // Get buyer and seller information
    const [buyer] = await db.select().from(users).where(eq(users.id, transaction.buyerId));
    const [seller] = await db.select().from(users).where(eq(users.id, transaction.sellerId));
    
    // Get note listing information
    const [noteListing] = await db.select().from(noteListings).where(eq(noteListings.id, transaction.noteListingId));
    
    return {
      transaction,
      tasks,
      files,
      timeline,
      buyer,
      seller,
      noteListing
    };
  },
  
  // Transaction phase management
  async updateTransactionPhase(id: number, newPhase: string): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db.update(transactions)
      .set({
        currentPhase: newPhase
      })
      .where(eq(transactions.id, id))
      .returning();
    
    // Create a timeline event for the phase change
    if (updatedTransaction) {
      await this.createTimelineEvent({
        transactionId: id,
        eventDescription: `Transaction moved to ${newPhase} phase`,
        eventType: 'info'
      });
    }
    
    return updatedTransaction;
  },
  
  // Checks if all tasks in a given phase are complete
  async areAllPhaseTasksComplete(transactionId: number, phase: string): Promise<boolean> {
    const tasks = await db.select()
      .from(transactionTasks)
      .where(
        and(
          eq(transactionTasks.transactionId, transactionId),
          eq(transactionTasks.phase, phase),
          eq(transactionTasks.isRequired, true)
        )
      );
    
    return tasks.every(task => task.status === 'complete');
  }
};