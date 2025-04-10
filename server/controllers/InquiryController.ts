import { Request, Response } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertInquirySchema } from "@shared/schema";
import { inquiryService } from "../services/inquiryService";
import { z } from "zod";
import { noteListingService } from "server/services/noteListingService";

export class InquiryController {
  async getByListingId(req: Request, res: Response) {
    try {
      const listingId = parseInt(req.params.listingId);
      if (isNaN(listingId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid listing ID" 
        });
      }
      
      const inquiries = await inquiryService.getInquiriesByNoteListingId(listingId);
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
  }

  async getByBuyerId(req: Request, res: Response) {
    try {
      const buyerId = parseInt(req.params.buyerId);
      if (isNaN(buyerId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid buyer ID" 
        });
      }
      
      const inquiries = await inquiryService.getInquiriesByBuyerId(buyerId);
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
      
      // First, get all listings for this seller
      const listings = await noteListingService.getNoteListingsBySellerId(sellerId);
      
      if (!listings || listings.length === 0) {
        return res.status(200).json({ 
          success: true, 
          data: [] 
        });
      }
      
      // Then get inquiries for each listing and combine them
      const inquiriesPromises = listings.map(listing => 
        inquiryService.getInquiriesByNoteListingId(listing.id)
      );
      
      const inquiriesArrays = await Promise.all(inquiriesPromises);
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
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid inquiry ID" 
        });
      }
      
      const inquiry = await inquiryService.getInquiryById(id);
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
  }

  async create(req: Request, res: Response) {
    try {
      const data = insertInquirySchema.parse(req.body);
      const inquiry = await inquiryService.createInquiry(data);
      
      // Send email notification
      try {
        await emailService.sendInquiryNotification(inquiry);
      } catch (error) {
        console.error("Failed to send inquiry notification:", error);
      }
      
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
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid inquiry ID" 
        });
      }
      
      const data = insertInquirySchema.partial().parse(req.body);
      const updatedInquiry = await inquiryService.updateInquiry(id, data);
      
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
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid inquiry ID" 
        });
      }
      
      const deleted = await inquiryService.deleteInquiry(id);
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
  }

  async respond(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid inquiry ID" 
        });
      }
      
      const responseSchema = z.object({
        responseMessage: z.string().min(1, "Response message is required"),
        status: z.enum(["pending", "accepted", "rejected", "countered", "withdrawn", "expired"])
      });
      
      const { responseMessage, status } = responseSchema.parse(req.body);
      
      const inquiry = await inquiryService.getInquiryById(id);
      if (!inquiry) {
        return res.status(404).json({ 
          success: false, 
          message: "Inquiry not found" 
        });
      }
      
      const updatedInquiry = await inquiryService.updateInquiry(id, {
        responseMessage,
        status
      });

      // Send email notification for response
      try {
        await emailService.sendInquiryResponseNotification(updatedInquiry);
      } catch (error) {
        console.error("Failed to send response notification:", error);
      }
      
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
  }

  async getStats(req: Request, res: Response) {
    try {
      const listings = await noteListingService.getAllNoteListings();
      const inquiriesPromises = listings.map(listing => 
        inquiryService.getInquiriesByNoteListingId(listing.id)
      );
      
      const inquiriesArrays = await Promise.all(inquiriesPromises);
      const allInquiries = inquiriesArrays.flat();
      
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
        avgResponseTime: this.calculateAvgResponseTime(allInquiries),
        recentActivity: this.getRecentInquiryActivity(allInquiries, 7)
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
  }

  private calculateAvgResponseTime(inquiries: any[]) {
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
    
    return totalResponseTimeMs / respondedInquiries.length / (1000 * 60 * 60);
  }

  private getRecentInquiryActivity(inquiries: any[], days: number) {
    const now = new Date();
    const cutoff = new Date(now.setDate(now.getDate() - days));
    
    return inquiries.filter(inq => new Date(inq.createdAt) >= cutoff);
  }
} 