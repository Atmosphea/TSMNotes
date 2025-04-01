import { Request, Response } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertNoteDocumentSchema } from "@shared/schema";
import { documentService } from "server/services/documentService";
import { noteDocuments } from "@shared/models";

export class DocumentController {
  async getByListingId(req: Request, res: Response) {
    try {
      const listingId = parseInt(req.params.listingId);
      if (isNaN(listingId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid listing ID" 
        });
      }
      
      const documents = await documentService.getNoteDocumentsByListingId(listingId);
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
  }

  async create(req: Request, res: Response) {
    try {
      const data = insertNoteDocumentSchema.parse(req.body);
      const document = await documentService.createNoteDocument(data);
      
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
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid document ID" 
        });
      }
      
      const deleted = await documentService.deleteNoteDocument(id);
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
  }
} 