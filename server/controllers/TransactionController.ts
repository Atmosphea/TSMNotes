import { Request, Response } from "express";
import { transactionService } from "../services/transactionService";
import { AuthRequest } from "../auth";
import { 
  insertTransactionSchema, 
  insertTransactionTaskSchema,
  insertTransactionFileSchema,
  insertTransactionTimelineEventSchema
} from "@shared/schema";

export class TransactionController {
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      
      const transactionData = await transactionService.getTransactionWithRelatedData(id);
      if (!transactionData) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      // Authorization check - only buyer, seller, or admin can view a transaction
      const user = (req as AuthRequest).userId;
      if (user !== transactionData.transaction.buyerId && 
          user !== transactionData.transaction.sellerId &&
          (req as any).userRole !== 'admin') {
        return res.status(403).json({ error: "Not authorized to view this transaction" });
      }
      
      res.json(transactionData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getByUser(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const role = req.query.role as string;
      let transactions;
      
      if (role === 'buyer') {
        transactions = await transactionService.getTransactionsByBuyerId(userId);
      } else if (role === 'seller') {
        transactions = await transactionService.getTransactionsBySellerId(userId);
      } else {
        // Get all transactions where user is either buyer or seller
        const buyerTransactions = await transactionService.getTransactionsByBuyerId(userId);
        const sellerTransactions = await transactionService.getTransactionsBySellerId(userId);
        transactions = [...buyerTransactions, ...sellerTransactions];
      }
      
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async create(req: Request, res: Response) {
    try {
      const parsedData = insertTransactionSchema.parse(req.body);
      
      // Ensure the creator is either the buyer or seller
      const userId = (req as AuthRequest).userId;
      if (userId !== parsedData.buyerId && userId !== parsedData.sellerId) {
        return res.status(403).json({ error: "Not authorized to create this transaction" });
      }
      
      const transaction = await transactionService.createTransaction(parsedData);
      
      // Create an initial timeline event
      await transactionService.createTimelineEvent({
        transactionId: transaction.id,
        eventDescription: "Transaction created",
        eventType: "info",
        triggeredByUserId: userId
      });
      
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      
      const transaction = await transactionService.getTransactionById(id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      // Authorization check - only buyer, seller, or admin can update a transaction
      const userId = (req as AuthRequest).userId;
      if (userId !== transaction.buyerId && 
          userId !== transaction.sellerId &&
          (req as any).userRole !== 'admin') {
        return res.status(403).json({ error: "Not authorized to update this transaction" });
      }
      
      const updatedTransaction = await transactionService.updateTransaction(id, req.body);
      
      // Create a timeline event for the update
      await transactionService.createTimelineEvent({
        transactionId: id,
        eventDescription: "Transaction details updated",
        eventType: "info",
        triggeredByUserId: userId
      });
      
      res.json(updatedTransaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async completeTask(req: Request, res: Response) {
    try {
      const transactionId = parseInt(req.params.id);
      const taskId = parseInt(req.params.taskId);
      
      if (isNaN(transactionId) || isNaN(taskId)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      // Get the transaction and task
      const transaction = await transactionService.getTransactionById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      // Authorization check
      const userId = (req as AuthRequest).userId;
      if (userId !== transaction.buyerId && 
          userId !== transaction.sellerId &&
          (req as any).userRole !== 'admin') {
        return res.status(403).json({ error: "Not authorized to complete tasks in this transaction" });
      }
      
      const updatedTask = await transactionService.completeTask(taskId, userId);
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      // Create a timeline event for the task completion
      await transactionService.createTimelineEvent({
        transactionId,
        eventDescription: `Task completed: ${updatedTask.description}`,
        eventType: "success",
        triggeredByUserId: userId,
        relatedTaskId: taskId
      });
      
      // Check if all tasks in the current phase are complete
      const allTasksComplete = await transactionService.areAllPhaseTasksComplete(
        transactionId, 
        transaction.currentPhase
      );
      
      // If all tasks are complete, update the transaction phase
      if (allTasksComplete) {
        if (transaction.currentPhase === 'negotiations') {
          await transactionService.updateTransactionPhase(transactionId, 'closing');
        } else if (transaction.currentPhase === 'closing') {
          await transactionService.updateTransactionPhase(transactionId, 'completed');
          // Mark the transaction as completed
          await transactionService.updateTransaction(transactionId, {
            status: 'completed',
            completedAt: new Date()
          });
        }
      }
      
      res.json(updatedTask);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async uploadFile(req: Request, res: Response) {
    try {
      const transactionId = parseInt(req.params.id);
      if (isNaN(transactionId)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      
      const transaction = await transactionService.getTransactionById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      // Authorization check
      const userId = (req as AuthRequest).userId;
      if (userId !== transaction.buyerId && 
          userId !== transaction.sellerId &&
          (req as any).userRole !== 'admin') {
        return res.status(403).json({ error: "Not authorized to upload files to this transaction" });
      }
      
      // Note: File upload handling would be implemented here
      // This would involve handling the multipart form data and storing the file
      
      // For now, we'll simulate a successful file upload
      const fileData = {
        transactionId,
        uploadedByUserId: userId,
        fileName: req.body.fileName,
        fileUrl: req.body.fileUrl,
        fileType: req.body.fileType,
        fileSize: req.body.fileSize,
        description: req.body.description,
        category: req.body.category || 'other',
        isPublic: req.body.isPublic || false
      };
      
      const file = await transactionService.createTransactionFile(fileData);
      
      // Create a timeline event for the file upload
      await transactionService.createTimelineEvent({
        transactionId,
        eventDescription: `File uploaded: ${file.fileName}`,
        eventType: "info",
        triggeredByUserId: userId,
        relatedFileId: file.id
      });
      
      res.status(201).json(file);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getSignedFileUrl(req: Request, res: Response) {
    try {
      const fileId = parseInt(req.params.fileId);
      if (isNaN(fileId)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      
      // Implementation would involve generating a signed URL for secure file access
      // For now, we'll return a mock response
      
      // In a real implementation: 
      // 1. Check if the file exists
      // 2. Check if the user has permission to access it
      // 3. Generate a signed URL with expiration
      
      res.json({
        signedUrl: "https://example.com/secure-file-access/123456789",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}