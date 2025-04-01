import { Request, Response } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertNoteListingSchema } from "@shared/schema";
import * as schema from "@shared/schema";
import { noteListingService, SearchFilters } from "../services/noteListingService";
import { db } from "../db";
import { noteListings, savedSearches, users } from "@shared/models";
import { and, eq, inArray, gte, lte, desc, asc, or, like, sql } from "drizzle-orm";

export class NoteListingController {
  async getAll(req: Request, res: Response) {
    try {
      // Clean up filters by removing empty/undefined values
      const filters: SearchFilters = Object.fromEntries(
        Object.entries({
          noteType: req.query.noteType as string,
          status: req.query.status ? (req.query.status as string).split(',') : undefined,
          
          // Amount ranges
          minOriginalAmount: req.query.minOriginalAmount ? Number(req.query.minOriginalAmount) : undefined,
          maxOriginalAmount: req.query.maxOriginalAmount ? Number(req.query.maxOriginalAmount) : undefined,
          minCurrentAmount: req.query.minCurrentAmount ? Number(req.query.minCurrentAmount) : undefined,
          maxCurrentAmount: req.query.maxCurrentAmount ? Number(req.query.maxCurrentAmount) : undefined,
          
          // Interest and price
          minInterestRate: req.query.minInterestRate ? Number(req.query.minInterestRate) : undefined,
          maxInterestRate: req.query.maxInterestRate ? Number(req.query.maxInterestRate) : undefined,
          minAskingPrice: req.query.minAskingPrice ? Number(req.query.minAskingPrice) : undefined,
          maxAskingPrice: req.query.maxAskingPrice ? Number(req.query.maxAskingPrice) : undefined,
          
          // Property details
          propertyType: req.query.propertyType ? (req.query.propertyType as string).split(',') : undefined,
          minPropertyValue: req.query.minPropertyValue ? Number(req.query.minPropertyValue) : undefined,
          maxPropertyValue: req.query.maxPropertyValue ? Number(req.query.maxPropertyValue) : undefined,
          
          // Location
          propertyState: req.query.propertyState as string,
          propertyCity: req.query.propertyCity as string,
          propertyZipCode: req.query.propertyZipCode as string,
          propertyCounty: req.query.propertyCounty as string,
          
          // Loan details
          minRemainingLoanTerm: req.query.minRemainingLoanTerm ? Number(req.query.minRemainingLoanTerm) : undefined,
          maxRemainingLoanTerm: req.query.maxRemainingLoanTerm ? Number(req.query.maxRemainingLoanTerm) : undefined,
          minLoanToValueRatio: req.query.minLoanToValueRatio ? Number(req.query.minLoanToValueRatio) : undefined,
          maxLoanToValueRatio: req.query.maxLoanToValueRatio ? Number(req.query.maxLoanToValueRatio) : undefined,
          
          // Dates
          minLoanOriginationDate: req.query.minLoanOriginationDate ? new Date(req.query.minLoanOriginationDate as string) : undefined,
          maxLoanOriginationDate: req.query.maxLoanOriginationDate ? new Date(req.query.maxLoanOriginationDate as string) : undefined,
          minLoanMaturityDate: req.query.minLoanMaturityDate ? new Date(req.query.minLoanMaturityDate as string) : undefined,
          maxLoanMaturityDate: req.query.maxLoanMaturityDate ? new Date(req.query.maxLoanMaturityDate as string) : undefined,
          
          // Other properties
          isSecured: req.query.isSecured ? req.query.isSecured === 'true' : undefined,
          collateralType: req.query.collateralType as string,
          paymentFrequency: req.query.paymentFrequency as string,
          amortizationType: req.query.amortizationType as string,
          keyword: req.query.keyword as string,
          performanceStatus: req.query.performanceStatus ? [req.query.performanceStatus as string] : undefined,
        }).filter(([_, value]) => 
          value !== undefined && 
          value !== '' && 
          value !== null &&
          (Array.isArray(value) ? value.length > 0 : true)
        )
      );

      console.log('Cleaned Filters:', filters);
      console.log('Email Notify:', req.query.emailNotify);
      console.log('UserId:', req.query.userId);
      // Save search if emailNotify is true and userId is provided
      if (req.query.emailNotify === 'true' && req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        
        // Get user's email from database
        const [user] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, userId));

        if (!user) {
          throw new Error('User not found');
        }

        
        const [savedSearch] = await db
          .insert(savedSearches)
          .values({
            userId,
            userEmail: user.email,
            name: 'Market Search Alert',
            criteria: filters,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
          
      }

      const { listings, total } = await noteListingService.searchNoteListings(filters);
      
      return res.status(200).json({
        success: true,
        data: listings,
        total
      });
    } catch (error) {
      console.error("Error getting note listings:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching note listings"
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid note listing ID" 
        });
      }
      
      const listing = await noteListingService.getNoteListingById(id);
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
  }

  async getBySellerId(req: Request, res: Response) {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid seller ID" 
        });
      }
      
      const listings = await noteListingService.getNoteListingsBySellerId(sellerId);
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
  }

  async create(req: Request, res: Response) {
    try {
      const listingData = insertNoteListingSchema.parse(req.body);
      console.log('Creating new note listing with data:', listingData);

      const noteListing = await noteListingService.createNoteListing(listingData);
      console.log('Note listing created:', noteListing.id);

      return res.status(201).json({
        success: true,
        message: "Note listing created successfully",
        data: noteListing
      });
    } catch (error) {
      console.error("Error creating note listing:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: fromZodError(error).message
        });
      }
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the note listing"
      });
    }
  }


  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid note listing ID" 
        });
      }
      
      const data = insertNoteListingSchema.partial().parse(req.body);
      const updatedListing = await noteListingService.updateNoteListing(id, data);
      
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
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid note listing ID" 
        });
      }
      
      const deleted = await noteListingService.deleteNoteListing(id);
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
  }
} 