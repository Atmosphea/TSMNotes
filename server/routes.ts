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

const emailSchema = z.string().email("Please enter a valid email address");

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
