import { Request, Response } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertWaitlistEntrySchema } from "@shared/schema";
import { storage } from "../storage";
import { z } from "zod";
import { waitlistService } from "server/services/waitlistService";

const emailSchema = z.string().email("Please enter a valid email address");

export class WaitlistController {
  async create(req: Request, res: Response) {
    try {
      const data = insertWaitlistEntrySchema.parse(req.body);
      
      // Check if email already exists in waitlist
      const existingEntry = await waitlistService.getWaitlistEntryByEmail(data.email);
      if (existingEntry) {
        return res.status(409).json({ 
          success: false, 
          message: "This email is already on our waitlist." 
        });
      }
      
      const waitlistEntry = await waitlistService.createWaitlistEntry(data);
      
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
  }

  async validateEmail(req: Request, res: Response) {
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
  }

  async getCount(req: Request, res: Response) {
    try {
      const entries = await waitlistService.getAllWaitlistEntries();
      return res.status(200).json({ 
        count: entries.length 
      });
    } catch (error) {
      console.error("Error getting waitlist count:", error);
      return res.status(500).json({ 
        message: "An error occurred while getting waitlist count" 
      });
    }
  }
} 