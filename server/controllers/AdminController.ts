import { Request, Response } from "express";
import { userService } from "../services/userService";
import { noteListingService } from "../services/noteListingService";
import { transactionService } from "../services/transactionService";
import { inquiryService } from "../services/inquiryService";
import { AuthRequest } from "../auth";
import { count } from "drizzle-orm";
import { transactions, users, noteListings, inquiries } from "@shared/models";
import { db } from "../db";
import { and, eq, ne, gt, lt, gte, lte, isNull, asc, desc } from "drizzle-orm";

export class AdminController {
  // Check if the user is an admin
  private async isAdmin(req: AuthRequest): Promise<boolean> {
    if (!req.userId) return false;
    
    const user = await userService.getUser(req.userId);
    return user?.role === "admin";
  }

  // Get all users
  async getUsers(req: AuthRequest, res: Response) {
    try {
      if (!await this.isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      const allUsers = await userService.getAllUsers();
      return res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Error fetching users" });
    }
  }

  // Get single user by ID
  async getUserById(req: AuthRequest, res: Response) {
    try {
      if (!await this.isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      const userId = parseInt(req.params.id);
      const user = await userService.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Error fetching user" });
    }
  }

  // Update user
  async updateUser(req: AuthRequest, res: Response) {
    try {
      if (!await this.isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Remove sensitive fields from update data
      delete userData.password;
      
      const updatedUser = await userService.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Error updating user" });
    }
  }

  // Delete user
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      if (!await this.isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      const userId = parseInt(req.params.id);
      const deleteResult = await userService.deleteUser(userId);
      
      if (!deleteResult) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ message: "Error deleting user" });
    }
  }

  // Get all note listings (with admin data)
  async getListings(req: AuthRequest, res: Response) {
    try {
      if (!await this.isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      const allListings = await noteListingService.getAllNoteListings();
      
      // Enrich listings with additional data (e.g., inquiry counts)
      const enrichedListings = await Promise.all(allListings.map(async (listing) => {
        const inquiries = await inquiryService.getInquiriesByNoteListingId(listing.id);
        return {
          ...listing,
          inquiryCount: inquiries.length
        };
      }));
      
      return res.json(enrichedListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      return res.status(500).json({ message: "Error fetching listings" });
    }
  }

  // Get dashboard statistics
  async getStats(req: AuthRequest, res: Response) {
    try {
      if (!await this.isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      // Get user count
      const [userCount] = await db.select({ count: count() }).from(users);
      
      // Get listing counts by status
      const [activeListings] = await db
        .select({ count: count() })
        .from(noteListings)
        .where(eq(noteListings.status, "active"));
      
      const [pendingReview] = await db
        .select({ count: count() })
        .from(noteListings)
        .where(eq(noteListings.status, "pending"));
      
      const [soldListings] = await db
        .select({ count: count() })
        .from(noteListings)
        .where(eq(noteListings.status, "sold"));
      
      // Get transaction stats
      const allTransactions = await transactionService.getAllTransactions();
      const completedTransactions = allTransactions.filter(t => t.status === "completed");
      
      const totalValue = completedTransactions.reduce((sum, t) => sum + (t.finalAmount || 0), 0);
      
      // Get average interest rate
      const allListings = await noteListingService.getAllNoteListings();
      const activeListingsData = allListings.filter(l => l.status === "active");
      
      const averageYield = activeListingsData.length > 0
        ? activeListingsData.reduce((sum, l) => sum + (l.interestRate || 0), 0) / activeListingsData.length
        : 0;
      
      // Get recent activity stats
      const recentTimeframe = new Date();
      recentTimeframe.setDate(recentTimeframe.getDate() - 30); // Last 30 days
      
      const [recentUsers] = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, recentTimeframe));
      
      const [recentListings] = await db
        .select({ count: count() })
        .from(noteListings)
        .where(gte(noteListings.createdAt, recentTimeframe));
      
      const [recentInquiries] = await db
        .select({ count: count() })
        .from(inquiries)
        .where(gte(inquiries.createdAt, recentTimeframe));
      
      return res.json({
        totalUsers: userCount.count,
        activeListings: activeListings.count,
        pendingReview: pendingReview.count,
        soldNotes: soldListings.count,
        totalValue,
        averageYield,
        recentActivity: {
          newUsers: recentUsers.count,
          newListings: recentListings.count,
          newInquiries: recentInquiries.count
        }
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return res.status(500).json({ message: "Error fetching admin statistics" });
    }
  }

  // Approve a pending listing
  async approveListing(req: AuthRequest, res: Response) {
    try {
      if (!await this.isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      const listingId = parseInt(req.params.id);
      const listing = await noteListingService.getNoteListingById(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.status !== "pending") {
        return res.status(400).json({ message: "Only pending listings can be approved" });
      }
      
      const updatedListing = await noteListingService.updateNoteListing(listingId, {
        status: "active",
        reviewedBy: req.userId,
        reviewedAt: new Date()
      });
      
      return res.json(updatedListing);
    } catch (error) {
      console.error("Error approving listing:", error);
      return res.status(500).json({ message: "Error approving listing" });
    }
  }

  // Reject a pending listing
  async rejectListing(req: AuthRequest, res: Response) {
    try {
      if (!await this.isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      const listingId = parseInt(req.params.id);
      const { rejectionReason } = req.body;
      
      if (!rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const listing = await noteListingService.getNoteListingById(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.status !== "pending") {
        return res.status(400).json({ message: "Only pending listings can be rejected" });
      }
      
      const updatedListing = await noteListingService.updateNoteListing(listingId, {
        status: "rejected",
        reviewedBy: req.userId,
        reviewedAt: new Date(),
        rejectionReason
      });
      
      return res.json(updatedListing);
    } catch (error) {
      console.error("Error rejecting listing:", error);
      return res.status(500).json({ message: "Error rejecting listing" });
    }
  }

  // Get transaction statistics
  async getTransactionStats(req: AuthRequest, res: Response) {
    try {
      if (!await this.isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }

      const allTransactions = await transactionService.getAllTransactions();
      
      // Group transactions by status
      const byStatus = {
        pending: allTransactions.filter(t => t.status === "pending").length,
        active: allTransactions.filter(t => t.status === "active").length,
        completed: allTransactions.filter(t => t.status === "completed").length,
        cancelled: allTransactions.filter(t => t.status === "cancelled").length
      };
      
      // Calculate volume by month (last 6 months)
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return { 
          month: date.toLocaleString('default', { month: 'short' }), 
          year: date.getFullYear(),
          date: date
        };
      });
      
      const volumeByMonth = months.map(monthData => {
        const startOfMonth = new Date(monthData.date);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(monthData.date);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        const monthTransactions = allTransactions.filter(t => {
          const txDate = new Date(t.createdAt);
          return txDate >= startOfMonth && txDate <= endOfMonth && t.status === "completed";
        });
        
        const volume = monthTransactions.reduce((sum, t) => sum + (t.finalAmount || 0), 0);
        
        return {
          month: `${monthData.month} ${monthData.year}`,
          count: monthTransactions.length,
          volume
        };
      }).reverse();
      
      return res.json({
        byStatus,
        volumeByMonth
      });
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
      return res.status(500).json({ message: "Error fetching transaction statistics" });
    }
  }
}