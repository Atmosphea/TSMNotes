import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWaitlistEntrySchema, 
  insertNoteListingSchema, 
  insertNoteDocumentSchema,
  insertUserSchema 
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
    // Create a sample user first
    // Using type assertion to work around schema constraints for sample data
    const sampleUser = await storage.createUser({
      username: "sample_investor",
      email: "investor@notetrade.com",
      password: await bcrypt.hash("password123", 10),
      firstName: "Jane",
      lastName: "Smith",
      company: "Investment Partners LLC",
      phone: "555-123-4567",
      role: "seller"
    } as any);
    
    // Create some sample note listings with type assertion
    await storage.createNoteListing({
      sellerId: sampleUser.id,
      loanAmount: 150000,
      interestRate: 7.25,
      loanTerm: 360,
      paymentAmount: 1023.12,
      timeHeld: 18,
      remainingPayments: 342,
      propertyType: "Single Family",
      propertyAddress: "123 Oak Lane, Austin, TX 78701",
      askingPrice: 125000,
      status: "active",
      loanToValueRatio: 65,
      propertyValue: 230770, // Calculated as loanAmount * (100 / loanToValueRatio)
      description: "Well-performing note with a strong payment history. Property is in an excellent neighborhood with rising property values."
    } as any);
    
    await storage.createNoteListing({
      sellerId: sampleUser.id,
      loanAmount: 85000,
      interestRate: 6.5,
      loanTerm: 240,
      paymentAmount: 635.75,
      timeHeld: 24,
      remainingPayments: 216,
      propertyType: "Condo",
      propertyAddress: "456 Pine Street #302, Seattle, WA 98101",
      askingPrice: 70000,
      status: "active",
      loanToValueRatio: 70,
      propertyValue: 121428, // Calculated as loanAmount * (100 / loanToValueRatio)
      description: "Seasoned note backed by a renovated condo in downtown Seattle. Borrower has excellent credit and perfect payment history."
    } as any);
    
    await storage.createNoteListing({
      sellerId: sampleUser.id,
      loanAmount: 225000,
      interestRate: 8.1,
      loanTerm: 300,
      paymentAmount: 1560.42,
      timeHeld: 36,
      remainingPayments: 264,
      propertyType: "Multi-Family",
      propertyAddress: "789 Maple Ave, Chicago, IL 60611",
      askingPrice: 195000,
      status: "active",
      loanToValueRatio: 75,
      propertyValue: 300000, // Calculated as loanAmount * (100 / loanToValueRatio)
      description: "High-yield note secured by a well-maintained duplex in a rapidly appreciating area of Chicago. Strong rental income supports payments."
    } as any);
    
    // Add sample document for the first listing with type assertion
    await storage.createNoteDocument({
      noteListingId: 1,
      fileName: "Loan_Agreement.pdf",
      fileSize: 2048,
      documentType: "Loan Agreement",
      documentUrl: "https://example.com/docs/loan_agreement.pdf",
      uploadedById: sampleUser.id
    } as any);
    
    await storage.createNoteDocument({
      noteListingId: 1,
      fileName: "Property_Appraisal.pdf",
      fileSize: 4096,
      documentType: "Appraisal",
      documentUrl: "https://example.com/docs/appraisal.pdf",
      uploadedById: sampleUser.id
    } as any);
  }
}

const emailSchema = z.string().email("Please enter a valid email address");

export async function registerRoutes(app: Express): Promise<Server> {
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
      const listings = await storage.getAllNoteListings();
      return res.status(200).json({ 
        success: true, 
        data: listings 
      });
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
