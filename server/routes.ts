import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAccessRequestSchema } from "@shared/schema";
import { setupAuth } from "./auth";
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

// Function to add sample note listings
async function addSampleListings() {
  const listings = await storage.getAllNoteListings();
  
  // Only add sample data if there are no listings yet
  if (listings.length === 0) {
    // Check if sample user already exists
    let sampleUser = await storage.getUserByUsername("sample_investor");
    
    // Create sample user if it doesn't exist
    if (!sampleUser) {
      sampleUser = await storage.createUser({
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
    
    // Create some sample note listings with type assertion
    await storage.createNoteListing({
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
    
    await storage.createNoteListing({
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
    
    await storage.createNoteListing({
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
    
    // Add sample document for the first listing with type assertion
    await storage.createNoteDocument({
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
    
    await storage.createNoteDocument({
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
  // Set up authentication routes and middleware
  setupAuth(app);
  
  // Create test user
  await storage.createTestUser();
  
  // Add sample listings on startup
  await addSampleListings();
  // Waitlist API route
  app.post("/api/waitlist", async (req, res) => {
    try {
      const data = insertWaitlistEntrySchema.parse(req.body);
      
      // Check if email already exists in waitlist
      const existingEntry = await storage.getWaitlistEntryByEmail(data.email);
      if (existingEntry) {
        return res.status(409).json({ 
          success: false, 
          message: "This email is already on our waitlist." 
        });
      }
      
      const waitlistEntry = await storage.createWaitlistEntry(data);
      
      return res.status(201).json({ 
        success: true, 
        message: "Successfully added to waitlist", 
        data: { 
          email: waitlistEntry.email,
          role: waitlistEntry.role
        } 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error("Error adding to waitlist:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while joining the waitlist. Please try again." 
      });
    }
  });

  // Validate email route (used for client-side validation)
  app.post("/api/validate-email", (req, res) => {
    try {
      const { email } = req.body;
      emailSchema.parse(email);
      return res.status(200).json({ 
        valid: true 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          valid: false, 
          message: "Please enter a valid email address" 
        });
      }
      return res.status(500).json({ 
        valid: false, 
        message: "An error occurred during validation" 
      });
    }
  });

  // Get waitlist count
  app.get("/api/waitlist/count", async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      return res.status(200).json({ 
        count: entries.length 
      });
    } catch (error) {
      console.error("Error getting waitlist count:", error);
      return res.status(500).json({ 
        message: "An error occurred while getting waitlist count" 
      });
    }
  });
  
  // Note Listing API Routes
  
  // Get all note listings
  app.get("/api/note-listings", async (req, res) => {
    try {
      // Check if we have search params
      if (Object.keys(req.query).length > 0) {
        // Parse search filters from query params
        const filters: any = {};
        const sort: any = {};
        
        // Numeric ranges
        if (req.query.minOriginalAmount) filters.minOriginalAmount = Number(req.query.minOriginalAmount);
        if (req.query.maxOriginalAmount) filters.maxOriginalAmount = Number(req.query.maxOriginalAmount);
        if (req.query.minCurrentAmount) filters.minCurrentAmount = Number(req.query.minCurrentAmount);
        if (req.query.maxCurrentAmount) filters.maxCurrentAmount = Number(req.query.maxCurrentAmount);
        if (req.query.minInterestRate) filters.minInterestRate = Number(req.query.minInterestRate);
        if (req.query.maxInterestRate) filters.maxInterestRate = Number(req.query.maxInterestRate);
        if (req.query.minAskingPrice) filters.minAskingPrice = Number(req.query.minAskingPrice);
        if (req.query.maxAskingPrice) filters.maxAskingPrice = Number(req.query.maxAskingPrice);
        if (req.query.minPropertyValue) filters.minPropertyValue = Number(req.query.minPropertyValue);
        if (req.query.maxPropertyValue) filters.maxPropertyValue = Number(req.query.maxPropertyValue);
        if (req.query.minLoanToValueRatio) filters.minLoanToValueRatio = Number(req.query.minLoanToValueRatio);
        if (req.query.maxLoanToValueRatio) filters.maxLoanToValueRatio = Number(req.query.maxLoanToValueRatio);
        if (req.query.minRemainingLoanTerm) filters.minRemainingLoanTerm = Number(req.query.minRemainingLoanTerm);
        if (req.query.maxRemainingLoanTerm) filters.maxRemainingLoanTerm = Number(req.query.maxRemainingLoanTerm);
        
        // String filters
        if (req.query.noteType) filters.noteType = req.query.noteType;
        if (req.query.propertyState) filters.propertyState = req.query.propertyState;
        if (req.query.propertyCity) filters.propertyCity = req.query.propertyCity;
        if (req.query.propertyZipCode) filters.propertyZipCode = req.query.propertyZipCode;
        if (req.query.propertyCounty) filters.propertyCounty = req.query.propertyCounty;
        if (req.query.collateralType) filters.collateralType = req.query.collateralType;
        if (req.query.amortizationType) filters.amortizationType = req.query.amortizationType;
        if (req.query.paymentFrequency) filters.paymentFrequency = req.query.paymentFrequency;
        
        // Array filters
        if (req.query.performanceStatus) {
          filters.performanceStatus = Array.isArray(req.query.performanceStatus) 
            ? req.query.performanceStatus 
            : [req.query.performanceStatus];
        }
        if (req.query.propertyType) {
          filters.propertyType = Array.isArray(req.query.propertyType) 
            ? req.query.propertyType 
            : [req.query.propertyType];
        }
        if (req.query.status) {
          filters.status = Array.isArray(req.query.status) 
            ? req.query.status 
            : [req.query.status];
        }
        
        // Boolean filters
        if (req.query.isSecured !== undefined) {
          filters.isSecured = req.query.isSecured === 'true';
        }
        
        // Keyword search
        if (req.query.keyword) {
          filters.keyword = req.query.keyword;
        }
        
        // Sorting
        if (req.query.sortField) {
          sort.field = req.query.sortField;
          sort.direction = req.query.sortDir === 'desc' ? 'desc' : 'asc';
        }
        
        // Pagination
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const offset = req.query.page ? (Number(req.query.page) - 1) * limit : 0;
        
        // Get filtered and sorted listings
        const listings = await storage.getAllNoteListings();
        
        // For now, just return all listings since the database search function isn't implemented
        return res.status(200).json({ 
          success: true, 
          data: listings,
          total: listings.length,
          page: req.query.page ? Number(req.query.page) : 1,
          totalPages: Math.ceil(listings.length / limit)
        });
      } else {
        // No search params, return all listings
        const listings = await storage.getAllNoteListings();
        return res.status(200).json({ 
          success: true, 
          data: listings 
        });
      }
    } catch (error) {
      console.error("Error getting note listings:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching note listings" 
      });
    }
  });
  
  // Get note listing by ID
  app.get("/api/note-listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid note listing ID" 
        });
      }
      
      const listing = await storage.getNoteListingById(id);
      if (!listing) {
        return res.status(404).json({ 
          success: false, 
          message: "Note listing not found" 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        data: listing 
      });
    } catch (error) {
      console.error("Error getting note listing:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching the note listing" 
      });
    }
  });
  
  // Get note listings by seller ID
  app.get("/api/note-listings/seller/:sellerId", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid seller ID" 
        });
      }
      
      const listings = await storage.getNoteListingsBySellerId(sellerId);
      return res.status(200).json({ 
        success: true, 
        data: listings 
      });
    } catch (error) {
      console.error("Error getting seller's note listings:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching seller's note listings" 
      });
    }
  });
  
  // Create a new note listing
  app.post("/api/note-listings", async (req, res) => {
    try {
      const data = insertNoteListingSchema.parse(req.body);
      const listing = await storage.createNoteListing(data);
      
      return res.status(201).json({ 
        success: true, 
        message: "Note listing created successfully", 
        data: listing 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error("Error creating note listing:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while creating the note listing" 
      });
    }
  });
  
  // Update a note listing
  app.put("/api/note-listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid note listing ID" 
        });
      }
      
      const data = insertNoteListingSchema.partial().parse(req.body);
      const updatedListing = await storage.updateNoteListing(id, data);
      
      if (!updatedListing) {
        return res.status(404).json({ 
          success: false, 
          message: "Note listing not found" 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Note listing updated successfully", 
        data: updatedListing 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error("Error updating note listing:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while updating the note listing" 
      });
    }
  });
  
  // Delete a note listing
  app.delete("/api/note-listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid note listing ID" 
        });
      }
      
      const deleted = await storage.deleteNoteListing(id);
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: "Note listing not found" 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Note listing deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting note listing:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while deleting the note listing" 
      });
    }
  });
  
  // Document API Routes
  
  // Get documents for a note listing
  app.get("/api/note-documents/listing/:listingId", async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      if (isNaN(listingId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid listing ID" 
        });
      }
      
      const documents = await storage.getNoteDocumentsByListingId(listingId);
      return res.status(200).json({ 
        success: true, 
        data: documents 
      });
    } catch (error) {
      console.error("Error getting documents for listing:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching documents" 
      });
    }
  });
  
  // Create a new document
  app.post("/api/note-documents", async (req, res) => {
    try {
      const data = insertNoteDocumentSchema.parse(req.body);
      const document = await storage.createNoteDocument(data);
      
      return res.status(201).json({ 
        success: true, 
        message: "Document added successfully", 
        data: document 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error("Error creating document:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while adding the document" 
      });
    }
  });
  
  // Delete a document
  app.delete("/api/note-documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid document ID" 
        });
      }
      
      const deleted = await storage.deleteNoteDocument(id);
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: "Document not found" 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Document deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while deleting the document" 
      });
    }
  });
  
  // Inquiry API Routes
  
  // Get inquiries for a note listing
  app.get("/api/inquiries/listing/:listingId", async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      if (isNaN(listingId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid listing ID" 
        });
      }
      
      const inquiries = await storage.getInquiriesByNoteListingId(listingId);
      return res.status(200).json({ 
        success: true, 
        data: inquiries 
      });
    } catch (error) {
      console.error("Error getting inquiries for listing:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching inquiries" 
      });
    }
  });
  
  // Get inquiries by buyer ID
  app.get("/api/inquiries/buyer/:buyerId", async (req, res) => {
    try {
      const buyerId = parseInt(req.params.buyerId);
      if (isNaN(buyerId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid buyer ID" 
        });
      }
      
      const inquiries = await storage.getInquiriesByBuyerId(buyerId);
      return res.status(200).json({ 
        success: true, 
        data: inquiries 
      });
    } catch (error) {
      console.error("Error getting buyer's inquiries:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching buyer's inquiries" 
      });
    }
  });
  
  // Get a specific inquiry by ID
  app.get("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid inquiry ID" 
        });
      }
      
      const inquiry = await storage.getInquiryById(id);
      if (!inquiry) {
        return res.status(404).json({ 
          success: false, 
          message: "Inquiry not found" 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        data: inquiry 
      });
    } catch (error) {
      console.error("Error getting inquiry:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching the inquiry" 
      });
    }
  });
  // Access Requests API Routes
  
  // Get all access requests
  app.get("/api/access-requests", async (req, res) => {
    try {
      const accessRequests = await storage.getAllAccessRequests();
      
      // Update any expired requests
      const now = new Date();
      const updatedRequests = [];
      
      for (const request of accessRequests) {
        if (request.expiresAt && new Date(request.expiresAt) < now && request.status === 'pending') {
          const updatedRequest = await storage.updateAccessRequest(request.id, { 
            status: 'expired' 
          });
          updatedRequests.push(updatedRequest);
        } else {
          updatedRequests.push(request);
        }
      }
      
      return res.status(200).json({
        success: true,
        data: updatedRequests
      });
    } catch (error) {
      console.error("Error getting access requests:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching access requests"
      });
    }
  });
  
  // Create a new access request
  app.post("/api/request-access", async (req, res) => {
    try {
      const data = insertAccessRequestSchema.parse(req.body);
      
      // Validate that the note listing exists
      const noteListing = await storage.getNoteListingById(data.noteListingId);
      if (!noteListing) {
        return res.status(404).json({
          success: false,
          message: "Note listing not found"
        });
      }
      
      // Check if the user already has an active access request for this note
      const existingRequests = await storage.getAccessRequestsByBuyerAndNote(
        data.buyerId, 
        data.noteListingId
      );
      
      const activeRequest = existingRequests.find(req => 
        req.status === 'pending' && new Date(req.expiresAt) > new Date()
      );
      
      if (activeRequest) {
        return res.status(409).json({
          success: false,
          message: "You already have an active access request for this note"
        });
      }
      
      // Create the access request
      const accessRequest = await storage.createAccessRequest(data);
      
      // TODO: Send email notification to the buyer with note details and seller contact
      
      return res.status(201).json({
        success: true,
        message: "Access request created successfully",
        data: accessRequest
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          success: false,
          message: validationError.message
        });
      }
      
      console.error("Error creating access request:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the access request"
      });
    }
  });
  
  // Get access requests for a specific note listing
  app.get("/api/note-listings/:id/access-requests", async (req, res) => {
    try {
      const noteListingId = parseInt(req.params.id);
      if (isNaN(noteListingId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid note listing ID"
        });
      }
      
      const accessRequests = await storage.getAccessRequestsByNoteListingId(noteListingId);
      return res.status(200).json({
        success: true,
        data: accessRequests
      });
    } catch (error) {
      console.error("Error getting note listing access requests:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching access requests"
      });
    }
  });
  
  // Update an access request status
  app.put("/api/access-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid access request ID"
        });
      }
      
      const { status } = req.body;
      if (!status || !['pending', 'approved', 'rejected', 'expired'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be one of: pending, approved, rejected, expired"
        });
      }
      
      const updatedRequest = await storage.updateAccessRequest(id, { status });
      
      if (!updatedRequest) {
        return res.status(404).json({
          success: false,
          message: "Access request not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Access request updated successfully",
        data: updatedRequest
      });
    } catch (error) {
      console.error("Error updating access request:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the access request"
      });
    }
  });
  
  // Inquiries API Routes
  
  // Create a new inquiry
  app.post("/api/inquiries", async (req, res) => {
    try {
      const data = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(data);
      
      return res.status(201).json({ 
        success: true, 
        message: "Inquiry created successfully", 
        data: inquiry 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error("Error creating inquiry:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while creating the inquiry" 
      });
    }
  });
  
  // Update an inquiry
  app.put("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid inquiry ID" 
        });
      }
      
      const data = insertInquirySchema.partial().parse(req.body);
      const updatedInquiry = await storage.updateInquiry(id, data);
      
      if (!updatedInquiry) {
        return res.status(404).json({ 
          success: false, 
          message: "Inquiry not found" 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Inquiry updated successfully", 
        data: updatedInquiry 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error("Error updating inquiry:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while updating the inquiry" 
      });
    }
  });
  
  // Delete an inquiry
  app.delete("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid inquiry ID" 
        });
      }
      
      const deleted = await storage.deleteInquiry(id);
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: "Inquiry not found" 
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Inquiry deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while deleting the inquiry" 
      });
    }
  });
  
  // Respond to an inquiry (specific endpoint for sellers)
  app.post("/api/inquiries/:id/respond", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid inquiry ID" 
        });
      }
      
      // Parse required fields for a response
      const responseSchema = z.object({
        responseMessage: z.string().min(1, "Response message is required"),
        status: z.enum(["pending", "accepted", "rejected", "countered", "withdrawn", "expired"])
      });
      
      const { responseMessage, status } = responseSchema.parse(req.body);
      
      // Get the existing inquiry
      const inquiry = await storage.getInquiryById(id);
      if (!inquiry) {
        return res.status(404).json({ 
          success: false, 
          message: "Inquiry not found" 
        });
      }
      
      // Update the inquiry with response information
      const updatedInquiry = await storage.updateInquiry(id, {
        responseMessage,
        status,
        // The respondedAt field is automatically set in the storage layer when 
        // the status changes to accepted or rejected
      });
      
      return res.status(200).json({ 
        success: true, 
        message: "Response to inquiry sent successfully", 
        data: updatedInquiry 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error("Error responding to inquiry:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while responding to the inquiry" 
      });
    }
  });
  
  // Get all inquiries for a seller (across all their listings)
  app.get("/api/inquiries/seller/:sellerId", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid seller ID" 
        });
      }
      
      // First, get all listings for this seller
      const listings = await storage.getNoteListingsBySellerId(sellerId);
      
      if (!listings || listings.length === 0) {
        return res.status(200).json({ 
          success: true, 
          data: [] 
        });
      }
      
      // Then get inquiries for each listing and combine them
      const inquiriesPromises = listings.map(listing => 
        storage.getInquiriesByNoteListingId(listing.id)
      );
      
      const inquiriesArrays = await Promise.all(inquiriesPromises);
      
      // Flatten the array of arrays into a single array of inquiries
      const inquiries = inquiriesArrays.flat();
      
      return res.status(200).json({ 
        success: true, 
        data: inquiries 
      });
    } catch (error) {
      console.error("Error getting seller's inquiries:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching seller's inquiries" 
      });
    }
  });
  
  // Get inquiry statistics
  app.get("/api/inquiries/stats", async (req, res) => {
    try {
      // Get all inquiries
      const listings = await storage.getAllNoteListings();
      const inquiriesPromises = listings.map(listing => 
        storage.getInquiriesByNoteListingId(listing.id)
      );
      
      const inquiriesArrays = await Promise.all(inquiriesPromises);
      const allInquiries = inquiriesArrays.flat();
      
      // Calculate statistics
      const stats = {
        total: allInquiries.length,
        byStatus: {
          pending: allInquiries.filter(inq => inq.status === 'pending').length,
          accepted: allInquiries.filter(inq => inq.status === 'accepted').length,
          rejected: allInquiries.filter(inq => inq.status === 'rejected').length,
          countered: allInquiries.filter(inq => inq.status === 'countered').length,
          withdrawn: allInquiries.filter(inq => inq.status === 'withdrawn').length,
          expired: allInquiries.filter(inq => inq.status === 'expired').length
        },
        avgResponseTime: calculateAvgResponseTime(allInquiries),
        recentActivity: getRecentInquiryActivity(allInquiries, 7) // Activity in last 7 days
      };
      
      return res.status(200).json({ 
        success: true, 
        data: stats 
      });
    } catch (error) {
      console.error("Error getting inquiry statistics:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching inquiry statistics" 
      });
    }
  });
  
  // Helper function to calculate average response time
  function calculateAvgResponseTime(inquiries) {
    const respondedInquiries = inquiries.filter(inq => 
      inq.respondedAt !== null && inq.createdAt
    );
    
    if (respondedInquiries.length === 0) {
      return null;
    }
    
    const totalResponseTimeMs = respondedInquiries.reduce((sum, inq) => {
      const responseTime = new Date(inq.respondedAt).getTime() - new Date(inq.createdAt).getTime();
      return sum + responseTime;
    }, 0);
    
    // Return average response time in hours
    return totalResponseTimeMs / respondedInquiries.length / (1000 * 60 * 60);
  }
  
  // Helper function to get recent inquiry activity
  function getRecentInquiryActivity(inquiries, days) {
    const now = new Date();
    const cutoff = new Date(now.setDate(now.getDate() - days));
    
    return inquiries.filter(inq => new Date(inq.createdAt) >= cutoff);
  }
  
  // User API Routes
  
  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid user ID" 
        });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      // Don't return password or other sensitive information
      const { password, ...safeUser } = user;
      
      return res.status(200).json({ 
        success: true, 
        data: safeUser
      });
    } catch (error) {
      console.error("Error getting user:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while fetching the user" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
