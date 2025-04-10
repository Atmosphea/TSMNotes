import { db } from "../db";
import { noteListings, type NoteListing } from "@shared/models";
import { type InsertNoteListing } from "@shared/schema";
import { eq, and, or, desc, asc, like, gte, lte, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { type PgSelect } from "drizzle-orm/pg-core";
import { emailService } from './emailService';
import { savedSearches } from '@shared/models';

export interface SearchFilters {
  noteType?: string;
  performanceStatus?: string[];
  minOriginalAmount?: number;
  maxOriginalAmount?: number;
  minCurrentAmount?: number;
  maxCurrentAmount?: number;
  minInterestRate?: number;
  maxInterestRate?: number;
  propertyState?: string;
  propertyCity?: string;
  propertyZipCode?: string;
  propertyCounty?: string;
  propertyType?: string[];
  minAskingPrice?: number;
  maxAskingPrice?: number;
  minPropertyValue?: number;
  maxPropertyValue?: number;
  minLoanToValueRatio?: number;
  maxLoanToValueRatio?: number;
  isSecured?: boolean;
  collateralType?: string;
  amortizationType?: string;
  paymentFrequency?: string;
  status?: string[];
  minLoanOriginationDate?: Date;
  maxLoanOriginationDate?: Date;
  minLoanMaturityDate?: Date;
  maxLoanMaturityDate?: Date;
  minRemainingLoanTerm?: number;
  maxRemainingLoanTerm?: number;
  keyword?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export const noteListingService = {
  async createNoteListing(listing: InsertNoteListing): Promise<NoteListing> {
    try {
      const [noteListing] = await db
        .insert(noteListings)
        .values({
          ...listing,
          title: listing.title || `Property Note in ${listing.propertyState || 'Unknown Location'}`,
          status: listing.status || 'active',
          isPublic: listing.isPublic ?? true,
          featured: listing.featured ?? false,
          dueDiligenceCompleted: listing.dueDiligenceCompleted ?? false,
          viewCount: 0,
          favoriteCount: 0,
          inquiryCount: 0,
          listedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      if (!noteListing) {
        throw new Error("Failed to create note listing");
      }

      return noteListing;
    } catch (error) {
      console.error("Error creating note listing:", error);
      throw error;
    }

    // Fire and forget the alert processing
    console.log('Processing alerts for new note listing:', noteListing.id);
    setImmediate(async () => {
      try {
        const activeSearches = await db
          .select()
          .from(savedSearches)
          .where(eq(savedSearches.isActive, true));

        console.log('Found active searches:', activeSearches.length);

        await Promise.all(activeSearches.map(async (search) => {
          const matchesSearch = await this.checkListingMatchesCriteria(noteListing, search.criteria);
          console.log('Search criteria match:', matchesSearch, 'for search:', search.id);
          
          if (matchesSearch) {
            console.log('Sending email alert to:', search.userEmail);
            await emailService.sendSearchAlert(search.userEmail, [noteListing]);
            
            await db
              .update(savedSearches)
              .set({ 
                totalMatches: (search.totalMatches || 0) + 1,
                lastRunAt: new Date()
              })
              .where(eq(savedSearches.id, search.id));
          }
        }));
      } catch (error) {
        console.error('Error processing search alerts:', error);
      }
    });

    return noteListing;
  },
  
  async getNoteListingById(id: number): Promise<NoteListing | undefined> {
    const [listing] = await db
      .select()
      .from(noteListings)
      .where(eq(noteListings.id, id));
    return listing;
  },
  
  async getNoteListingsBySellerId(sellerId: number): Promise<NoteListing[]> {
    return await db
      .select()
      .from(noteListings)
      .where(eq(noteListings.sellerId, sellerId));
  },
  
  async getAllNoteListings(): Promise<NoteListing[]> {
    return await db
      .select()
      .from(noteListings)
      .orderBy(desc(noteListings.createdAt));
  },
  
  async updateNoteListing(id: number, listingData: Partial<InsertNoteListing>): Promise<NoteListing | undefined> {
    const [updatedListing] = await db
      .update(noteListings)
      .set({
        ...listingData,
        updatedAt: new Date()
      })
      .where(eq(noteListings.id, id))
      .returning();
    
    return updatedListing;
  },
  
  async deleteNoteListing(id: number): Promise<boolean> {
    const result = await db
      .delete(noteListings)
      .where(eq(noteListings.id, id))
      .returning();
    
    return result.length > 0;
  },
  
  async searchNoteListings(
    filters: SearchFilters,
    sort?: SortOptions,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ listings: NoteListing[], total: number }> {
    let query = db.select().from(noteListings);
    type QueryType = typeof query;
    let finalQuery: QueryType = query;
    
    // Apply filters
    const conditions = [];
    
    if (filters) {
      if (filters.noteType) {
        conditions.push(eq(noteListings.noteType, filters.noteType));
      }
      
      if (filters.performanceStatus && filters.performanceStatus.length > 0) {
        conditions.push(inArray(noteListings.performanceStatus, filters.performanceStatus));
      }
      
      if (filters.minOriginalAmount !== undefined) {
        conditions.push(gte(noteListings.originalLoanAmount, filters.minOriginalAmount));
      }
      if (filters.maxOriginalAmount !== undefined) {
        conditions.push(lte(noteListings.originalLoanAmount, filters.maxOriginalAmount));
      }
      
      if (filters.minCurrentAmount !== undefined) {
        conditions.push(gte(noteListings.currentLoanAmount, filters.minCurrentAmount));
      }
      if (filters.maxCurrentAmount !== undefined) {
        conditions.push(lte(noteListings.currentLoanAmount, filters.maxCurrentAmount));
      }
      
      if (filters.minInterestRate !== undefined) {
        conditions.push(gte(noteListings.interestRate, filters.minInterestRate));
      }
      if (filters.maxInterestRate !== undefined) {
        conditions.push(lte(noteListings.interestRate, filters.maxInterestRate));
      }
      
      if (filters.propertyState) {
        conditions.push(eq(noteListings.propertyState, filters.propertyState));
      }
      if (filters.propertyCity) {
        conditions.push(eq(noteListings.propertyCity, filters.propertyCity));
      }
      if (filters.propertyZipCode) {
        conditions.push(eq(noteListings.propertyZipCode, filters.propertyZipCode));
      }
      if (filters.propertyCounty) {
        conditions.push(eq(noteListings.propertyCounty, filters.propertyCounty));
      }
      
      if (filters.propertyType && filters.propertyType.length > 0) {
        conditions.push(inArray(noteListings.propertyType, filters.propertyType));
      }
      
      if (filters.minAskingPrice !== undefined) {
        conditions.push(gte(noteListings.askingPrice, filters.minAskingPrice));
      }
      if (filters.maxAskingPrice !== undefined) {
        conditions.push(lte(noteListings.askingPrice, filters.maxAskingPrice));
      }
      
      if (filters.minPropertyValue !== undefined) {
        conditions.push(gte(noteListings.propertyValue, filters.minPropertyValue));
      }
      if (filters.maxPropertyValue !== undefined) {
        conditions.push(lte(noteListings.propertyValue, filters.maxPropertyValue));
      }
      
      if (filters.minLoanToValueRatio !== undefined) {
        conditions.push(gte(noteListings.loanToValueRatio, filters.minLoanToValueRatio));
      }
      if (filters.maxLoanToValueRatio !== undefined) {
        conditions.push(lte(noteListings.loanToValueRatio, filters.maxLoanToValueRatio));
      }
      
      if (filters.isSecured !== undefined) {
        conditions.push(eq(noteListings.isSecured, filters.isSecured));
      }
      if (filters.collateralType) {
        conditions.push(eq(noteListings.collateralType, filters.collateralType));
      }
      
      if (filters.amortizationType) {
        conditions.push(eq(noteListings.amortizationType, filters.amortizationType));
      }
      if (filters.paymentFrequency) {
        conditions.push(eq(noteListings.paymentFrequency, filters.paymentFrequency));
      }
      
      if (filters.status && filters.status.length > 0) {
        conditions.push(inArray(noteListings.status, filters.status));
      } else {
        conditions.push(eq(noteListings.status, 'active'));
      }
      
      if (filters.minLoanOriginationDate) {
        conditions.push(gte(noteListings.loanOriginationDate, filters.minLoanOriginationDate.toISOString()));
      }
      if (filters.maxLoanOriginationDate) {
        conditions.push(lte(noteListings.loanOriginationDate, filters.maxLoanOriginationDate.toISOString()));
      }
      if (filters.minLoanMaturityDate) {
        conditions.push(gte(noteListings.loanMaturityDate, filters.minLoanMaturityDate.toISOString()));
      }
      if (filters.maxLoanMaturityDate) {
        conditions.push(lte(noteListings.loanMaturityDate, filters.maxLoanMaturityDate.toISOString()));
      }
      
      if (filters.minRemainingLoanTerm !== undefined) {
        conditions.push(gte(noteListings.remainingLoanTerm, filters.minRemainingLoanTerm));
      }
      if (filters.maxRemainingLoanTerm !== undefined) {
        conditions.push(lte(noteListings.remainingLoanTerm, filters.maxRemainingLoanTerm));
      }
      
      if (filters.keyword) {
        const keywordPattern = `%${filters.keyword}%`;
        conditions.push(
          or(
            like(noteListings.title, keywordPattern),
            like(noteListings.description || '', keywordPattern),
            like(noteListings.propertyAddress, keywordPattern)
          )
        );
      }
    }
    
    if (conditions.length > 0) {
      finalQuery = finalQuery.where(and(...conditions)) as typeof finalQuery;
    }
    
    // Apply sorting
    if (sort) {
      const sortColumn = noteListings[sort.field as keyof typeof noteListings];
      if (sortColumn && typeof sortColumn !== 'function') {
        finalQuery = finalQuery.orderBy(sql`${sortColumn} ${sql.raw(sort.direction)}`) as typeof finalQuery;
      }
    } else {
      finalQuery = finalQuery.orderBy(desc(noteListings.createdAt)) as typeof finalQuery;
    }
    
    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(noteListings)
      .where(and(...conditions));
    
    // Apply pagination
    finalQuery = finalQuery.limit(limit).offset(offset) as typeof finalQuery;
    
    // Execute query
    const listings = await finalQuery;
    
    return {
      listings,
      total: Number(countResult.count)
    };
  },

  async checkListingMatchesCriteria(listing: NoteListing, criteria: any): Promise<boolean> {
    // Apply the same filter logic used in searchNoteListings
    const { listings } = await this.searchNoteListings(criteria, undefined, 1, 0);
    return listings.some(l => l.id === listing.id);
  }
};