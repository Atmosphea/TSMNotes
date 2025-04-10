import type { Express } from "express";
import { createServer, type Server } from "http";
import { AuthRequest, authenticateToken, setupAuth } from "./auth";
import { 
  insertWaitlistEntrySchema, 
  insertNoteListingSchema, 
  insertNoteDocumentSchema,
  insertUserSchema,
  insertInquirySchema
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcrypt";
import { userService } from "./services/userService";
import { noteListingService } from "./services/noteListingService";
import { documentService } from "./services/documentService";
import { inquiryService } from "./services/inquiryService";
import { waitlistService } from "./services/waitlistService";
import { Request, Response } from "express";
import { and, eq, inArray, gte, lte, desc, asc, or, like } from "drizzle-orm";
import { db } from "./db";
import { noteListings } from "@shared/models";
import { WaitlistController } from "./controllers/WaitlistController";
import { NoteListingController } from "./controllers/NoteListingController";
import { DocumentController } from "./controllers/DocumentController";
import { InquiryController } from "./controllers/InquiryController";
import { TransactionController } from "./controllers/TransactionController";
import { AdminController } from "./controllers/AdminController";
import fs from 'fs';
import path from 'path';

// Function to handle saving waitlist emails to data file
const saveToLocalWaitlist = async (req: Request, res: Response) => {
  try {
    const { email, role, timestamp } = req.body;
    
    // Read existing waitlist data
    const waitlistPath = path.join(process.cwd(), 'data', 'waitlist.json');
    let waitlistData = [];
    
    try {
      if (fs.existsSync(waitlistPath)) {
        const data = fs.readFileSync(waitlistPath, 'utf8');
        waitlistData = JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading waitlist file:', err);
    }
    
    // Add new entry
    waitlistData.push({
      email,
      role,
      timestamp
    });
    
    // Write back to file
    fs.writeFileSync(waitlistPath, JSON.stringify(waitlistData, null, 2));
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving to waitlist:', error);
    res.status(500).json({ success: false, message: 'Failed to save to waitlist' });
  }
};

// Function to verify invite key
const verifyInviteKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.body;
    
    // Read invite keys from file
    const keysPath = path.join(process.cwd(), 'data', 'inviteKeys.json');
    let keysData = [];
    
    try {
      if (fs.existsSync(keysPath)) {
        const data = fs.readFileSync(keysPath, 'utf8');
        keysData = JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading invite keys file:', err);
      return res.status(500).json({ valid: false, message: 'Error reading keys' });
    }
    
    // Check if key exists and is active
    const keyEntry = keysData.find((k: any) => k.key === key && k.active === true);
    
    if (keyEntry) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(200).json({ valid: false, message: 'Invalid or inactive key' });
    }
  } catch (error) {
    console.error('Error verifying key:', error);
    res.status(500).json({ valid: false, message: 'Failed to verify key' });
  }
};

// Function to add sample note listings
async function addSampleListings() {
  const listings = await noteListingService.getAllNoteListings();
  
  // Only add sample data if there are no listings yet
  if (listings.length === 0) {
    // Check if sample user already exists
    let sampleUser = await userService.getUserByUsername("sample_investor");
    
    // Create sample user if it doesn't exist
    if (!sampleUser) {
      sampleUser = await userService.createUser({
        username: "sample_investor",
        email: "investor@notetrade.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Jane",
        lastName: "Smith",
        company: "Investment Partners LLC",
        phone: "555-123-4567",
        role: "seller",
        status: "active"
      } as any);
    }
    
    // Add test user with credentials that the user specified
    let testUser = await userService.getUserByUsername("user");
    if (!testUser) {
      testUser = await userService.createUser({
        username: "user",
        email: "user@notetrade.com",
        password: await bcrypt.hash("password", 10),
        firstName: "Test",
        lastName: "User",
        company: "Test Company",
        phone: "555-555-5555",
        role: "user",
        status: "active"
      } as any);
    }
    
    // Add admin user as specified
    let adminUser = await userService.getUserByEmail("tradeplayful@gmail.com");
    if (!adminUser) {
      adminUser = await userService.createUser({
        username: "admin",
        email: "tradeplayful@gmail.com",
        password: await bcrypt.hash("tsmnotes", 10),
        firstName: "Admin",
        lastName: "User",
        company: "NoteTrade Platform",
        phone: "555-555-5555",
        role: "admin",
        status: "active"
      } as any);
    }
    
    // Create some sample note listings
    await noteListingService.createNoteListing({
      sellerId: sampleUser.id,
      title: "Single Family Home in Austin",
      noteType: "Mortgage Note",
      performanceStatus: "performing",
      originalLoanAmount: 150000,
      currentLoanAmount: 145000,
      interestRate: 7.25,
      originalLoanTerm: 360,
      remainingLoanTerm: 342,
      monthlyPaymentAmount: 1023.12,
      propertyAddress: "123 Oak Lane, Austin, TX 78701",
      propertyState: "TX",
      propertyType: "Single Family",
      propertyValue: 230770,
      loanToValueRatio: 65,
      askingPrice: 125000,
      status: "active",
      description: "Well-performing note with a strong payment history. Property is in an excellent neighborhood with rising property values."
    } as any);
    
    await noteListingService.createNoteListing({
      sellerId: sampleUser.id,
      title: "Condo in Downtown Seattle",
      noteType: "Deed of Trust",
      performanceStatus: "performing",
      originalLoanAmount: 85000,
      currentLoanAmount: 78000,
      interestRate: 6.5,
      originalLoanTerm: 240,
      remainingLoanTerm: 216,
      monthlyPaymentAmount: 635.75,
      propertyAddress: "456 Pine Street #302, Seattle, WA 98101",
      propertyState: "WA",
      propertyType: "Condo",
      propertyValue: 121428,
      loanToValueRatio: 70,
      askingPrice: 70000,
      status: "active",
      description: "Seasoned note backed by a renovated condo in downtown Seattle. Borrower has excellent credit and perfect payment history."
    } as any);
    
    await noteListingService.createNoteListing({
      sellerId: sampleUser.id,
      title: "Multi-Family Property in Chicago",
      noteType: "Commercial Mortgage",
      performanceStatus: "performing",
      originalLoanAmount: 225000,
      currentLoanAmount: 215000,
      interestRate: 8.1,
      originalLoanTerm: 300,
      remainingLoanTerm: 264,
      monthlyPaymentAmount: 1560.42,
      propertyAddress: "789 Maple Ave, Chicago, IL 60611",
      propertyState: "IL",
      propertyType: "Multi-Family",
      propertyValue: 300000,
      loanToValueRatio: 75,
      askingPrice: 195000,
      status: "active",
      description: "High-yield note secured by a well-maintained duplex in a rapidly appreciating area of Chicago. Strong rental income supports payments."
    } as any);
    
    // Add sample document
    await documentService.createNoteDocument({
      noteListingId: 1,
      fileName: "Loan_Agreement.pdf",
      fileSize: 2048,
      documentType: "Loan Agreement",
      documentUrl: "https://example.com/docs/loan_agreement.pdf",
      uploadedById: sampleUser.id,
      isPublic: false,
      verificationStatus: "pending",
      description: "Original loan agreement document"
    } as any);
    
    await documentService.createNoteDocument({
      noteListingId: 1,
      fileName: "Property_Appraisal.pdf",
      fileSize: 4096,
      documentType: "Appraisal",
      documentUrl: "https://example.com/docs/appraisal.pdf",
      uploadedById: sampleUser.id,
      isPublic: true,
      verificationStatus: "verified",
      description: "Property appraisal showing current market value"
    } as any);
  }
}

const emailSchema = z.string().email("Please enter a valid email address");

export async function registerRoutes(app: Express): Promise<Server> {
  // Test endpoint for transaction fee calculation
  app.get('/api/test/transaction-fee', (req, res) => {
    const amount = parseFloat(req.query.amount as string) || 100000;
    const fee = amount * 0.008;
    const total = amount + fee;
    
    res.json({
      amount,
      fee,
      total,
      feePercentage: "0.8%"
    });
  });
  // Set up authentication routes and middleware
  setupAuth(app);
  
  // Add sample listings on startup
  await addSampleListings();

  // Initialize controllers
  const waitlistController = new WaitlistController();
  const noteListingController = new NoteListingController();
  const documentController = new DocumentController();
  const inquiryController = new InquiryController();
  const transactionController = new TransactionController();
  const adminController = new AdminController();

  // Waitlist routes
  app.post("/api/waitlist", waitlistController.create.bind(waitlistController));
  app.post("/api/validate-email", waitlistController.validateEmail.bind(waitlistController));
  app.get("/api/waitlist/count", waitlistController.getCount.bind(waitlistController));
  
  // Local data routes for waitlist and invite keys
  app.post("/api/local-waitlist", saveToLocalWaitlist);
  app.post("/api/verify-invite-key", verifyInviteKey);

  // Public note listing routes
  app.get("/api/note-listings", noteListingController.getAll.bind(noteListingController));
  app.get("/api/note-listings/:id", noteListingController.getById.bind(noteListingController));
  app.get("/api/note-documents/listing/:listingId", documentController.getByListingId.bind(documentController));

  // Protected routes
  app.use(authenticateToken);

  // Protected note listing routes
  app.post("/api/note-listings", noteListingController.create.bind(noteListingController));
  app.put("/api/note-listings/:id", noteListingController.update.bind(noteListingController));
  app.delete("/api/note-listings/:id", noteListingController.delete.bind(noteListingController));
  app.get("/api/note-listings/seller/:sellerId", noteListingController.getBySellerId.bind(noteListingController));

  // Protected document routes
  app.post("/api/note-documents", documentController.create.bind(documentController));
  app.delete("/api/note-documents/:id", documentController.delete.bind(documentController));

  // Protected inquiry routes
  app.get("/api/inquiries/listing/:listingId", inquiryController.getByListingId.bind(inquiryController));
  app.get("/api/inquiries/buyer/:buyerId", inquiryController.getByBuyerId.bind(inquiryController));
  app.get("/api/inquiries/seller/:sellerId", inquiryController.getBySellerId.bind(inquiryController));
  app.get("/api/inquiries/:id", inquiryController.getById.bind(inquiryController));
  app.post("/api/inquiries", inquiryController.create.bind(inquiryController));
  app.put("/api/inquiries/:id", inquiryController.update.bind(inquiryController));
  app.delete("/api/inquiries/:id", inquiryController.delete.bind(inquiryController));
  app.post("/api/inquiries/:id/respond", inquiryController.respond.bind(inquiryController));
  app.get("/api/inquiries/stats", inquiryController.getStats.bind(inquiryController));

  // Protected transaction routes
  app.get("/api/transactions/:id", transactionController.getById.bind(transactionController));
  app.get("/api/transactions", transactionController.getByUser.bind(transactionController));
  app.post("/api/transactions", transactionController.create.bind(transactionController));
  app.put("/api/transactions/:id", transactionController.update.bind(transactionController));
  
  // Transaction task management
  app.get("/api/transactions/:id/tasks", transactionController.getTasksByTransactionId.bind(transactionController));
  app.post("/api/transactions/:id/tasks", transactionController.createTask.bind(transactionController));
  app.post("/api/transactions/:id/tasks/:taskId/complete", transactionController.completeTask.bind(transactionController));
  
  // Transaction file management
  app.get("/api/transactions/:id/files", transactionController.getFilesByTransactionId.bind(transactionController));
  app.post("/api/transactions/:id/files", transactionController.uploadFile.bind(transactionController));
  app.get("/api/files/:fileId/signed-url", transactionController.getSignedFileUrl.bind(transactionController));
  
  // Transaction timeline events
  app.get("/api/transactions/:id/timeline", transactionController.getTimelineByTransactionId.bind(transactionController));
  app.post("/api/transactions/:id/timeline", transactionController.createTimelineEvent.bind(transactionController));
  
  // Admin routes
  app.get("/api/admin/users", adminController.getUsers.bind(adminController));
  app.get("/api/admin/users/:id", adminController.getUserById.bind(adminController));
  app.patch("/api/admin/users/:id", adminController.updateUser.bind(adminController));
  app.delete("/api/admin/users/:id", adminController.deleteUser.bind(adminController));
  
  app.get("/api/admin/listings", adminController.getListings.bind(adminController));
  app.post("/api/admin/listings/:id/approve", adminController.approveListing.bind(adminController));
  app.post("/api/admin/listings/:id/reject", adminController.rejectListing.bind(adminController));
  
  app.get("/api/admin/stats", adminController.getStats.bind(adminController));
  app.get("/api/admin/transactions/stats", adminController.getTransactionStats.bind(adminController));

  const httpServer = createServer(app);

  return httpServer;
}
