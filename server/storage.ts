import { 
  users, 
  waitlistEntries, 
  messages, 
  notes,
  noteListings,
  noteDocuments,
  investorPreferences,
  savedSearches,
  favoriteListings,
  inquiries,
  transactions,
  accessRequests,
  type User, 
  type InsertUser, 
  type WaitlistEntry, 
  type InsertWaitlistEntry,
  type Message,
  type InsertMessage,
  type Note,
  type InsertNote,
  type NoteListing,
  type InsertNoteListing,
  type NoteDocument,
  type InsertNoteDocument,
  type InvestorPreferences,
  type InsertInvestorPreferences,
  type SavedSearch,
  type InsertSavedSearch,
  type FavoriteListing,
  type InsertFavoriteListing,
  type Inquiry,
  type InsertInquiry,
  type Transaction,
  type InsertTransaction,
  type AccessRequest,
  type InsertAccessRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, like, gte, lte, inArray } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

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

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Waitlist operations
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined>;
  getAllWaitlistEntries(): Promise<WaitlistEntry[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  
  // Note Listing operations
  createNoteListing(listing: InsertNoteListing): Promise<NoteListing>;
  getNoteListingById(id: number): Promise<NoteListing | undefined>;
  getNoteListingsBySellerId(sellerId: number): Promise<NoteListing[]>;
  getAllNoteListings(): Promise<NoteListing[]>;
  searchNoteListings(filters: SearchFilters, sort?: SortOptions, limit?: number, offset?: number): Promise<{listings: NoteListing[], total: number}>;
  updateNoteListing(id: number, listing: Partial<InsertNoteListing>): Promise<NoteListing | undefined>;
  deleteNoteListing(id: number): Promise<boolean>;
  
  // Note Document operations
  createNoteDocument(document: InsertNoteDocument): Promise<NoteDocument>;
  getNoteDocumentsByListingId(noteListingId: number): Promise<NoteDocument[]>;
  deleteNoteDocument(id: number): Promise<boolean>;
  
  // Access Request operations
  createAccessRequest(accessRequest: InsertAccessRequest): Promise<AccessRequest>;
  getAccessRequestById(id: number): Promise<AccessRequest | undefined>;
  getAccessRequestsByNoteListingId(noteListingId: number): Promise<AccessRequest[]>;
  getAccessRequestsByBuyerId(buyerId: number): Promise<AccessRequest[]>;
  getAccessRequestsByBuyerAndNote(buyerId: number, noteListingId: number): Promise<AccessRequest[]>;
  getAllAccessRequests(): Promise<AccessRequest[]>;
  updateAccessRequest(id: number, accessRequest: Partial<InsertAccessRequest>): Promise<AccessRequest | undefined>;
  deleteAccessRequest(id: number): Promise<boolean>;
  
  // Inquiry operations
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiryById(id: number): Promise<Inquiry | undefined>;
  getInquiriesByNoteListingId(noteListingId: number): Promise<Inquiry[]>;
  getInquiriesByBuyerId(buyerId: number): Promise<Inquiry[]>;
  updateInquiry(id: number, inquiry: Partial<InsertInquiry>): Promise<Inquiry | undefined>;
  deleteInquiry(id: number): Promise<boolean>;
  
  // Legacy Note operations
  createNote(note: InsertNote): Promise<Note>;
  getNoteById(id: number): Promise<Note | undefined>;
  getNotesByUserId(userId: number): Promise<Note[]>;
  getAllNotes(): Promise<Note[]>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waitlistEntries: Map<number, WaitlistEntry>;
  private messages: Map<number, Message>;
  private noteListings: Map<number, NoteListing>;
  private noteDocuments: Map<number, NoteDocument>;
  private notes: Map<number, Note>; // Legacy
  private inquiries: Map<number, Inquiry>;
  private accessRequests: Map<number, AccessRequest>;
  
  private currentUserId: number;
  private currentWaitlistEntryId: number;
  private currentMessageId: number;
  private currentNoteListingId: number;
  private currentNoteDocumentId: number;
  private currentNoteId: number;
  private currentInquiryId: number;
  private currentAccessRequestId: number;

  constructor() {
    this.users = new Map();
    this.waitlistEntries = new Map();
    this.messages = new Map();
    this.noteListings = new Map();
    this.noteDocuments = new Map();
    this.notes = new Map();
    this.inquiries = new Map();
    this.accessRequests = new Map();
    
    this.currentUserId = 1;
    this.currentWaitlistEntryId = 1;
    this.currentMessageId = 1;
    this.currentNoteListingId = 1;
    this.currentNoteDocumentId = 1;
    this.currentNoteId = 1;
    this.currentInquiryId = 1;
    this.currentAccessRequestId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password, 
      email: insertUser.email,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      role: insertUser.role || 'investor',
      status: insertUser.status || 'active',
      bio: insertUser.bio || null,
      phone: insertUser.phone || null,
      company: insertUser.company || null,
      website: insertUser.website || null,
      location: insertUser.location || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      emailNotifications: insertUser.emailNotifications ?? true,
      smsNotifications: insertUser.smsNotifications ?? false,
      marketingEmails: insertUser.marketingEmails ?? true,
      isAccreditedInvestor: insertUser.isAccreditedInvestor ?? false,
      accreditationProofUrl: insertUser.accreditationProofUrl || null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...user
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Waitlist operations
  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const id = this.currentWaitlistEntryId++;
    const waitlistEntry: WaitlistEntry = {
      ...entry,
      id,
      createdAt: new Date()
    };
    this.waitlistEntries.set(id, waitlistEntry);
    return waitlistEntry;
  }
  
  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    return Array.from(this.waitlistEntries.values()).find(
      (entry) => entry.email === email,
    );
  }
  
  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return Array.from(this.waitlistEntries.values());
  }
  
  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      read: false,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }
  
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }
  
  // Note operations
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const note: Note = {
      ...insertNote,
      id,
      active: true,
      createdAt: new Date()
    };
    this.notes.set(id, note);
    return note;
  }
  
  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }
  
  async getNotesByUserId(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId
    );
  }
  
  async getAllNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }
  
  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    
    if (!existingNote) {
      return undefined;
    }
    
    const updatedNote: Note = {
      ...existingNote,
      ...note
    };
    
    this.notes.set(id, updatedNote);
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }
  
  // Note Listing operations
  async createNoteListing(insertNoteListing: InsertNoteListing): Promise<NoteListing> {
    const id = this.currentNoteListingId++;
    const noteListing: NoteListing = {
      id,
      sellerId: insertNoteListing.sellerId,
      title: insertNoteListing.title || `Property Note in ${insertNoteListing.propertyState || 'Unknown Location'}`,
      noteType: insertNoteListing.noteType,
      performanceStatus: insertNoteListing.performanceStatus,
      originalLoanAmount: insertNoteListing.originalLoanAmount,
      currentLoanAmount: insertNoteListing.currentLoanAmount,
      interestRate: insertNoteListing.interestRate,
      originalLoanTerm: insertNoteListing.originalLoanTerm,
      remainingLoanTerm: insertNoteListing.remainingLoanTerm,
      monthlyPaymentAmount: insertNoteListing.monthlyPaymentAmount,
      loanOriginationDate: insertNoteListing.loanOriginationDate || null,
      loanMaturityDate: insertNoteListing.loanMaturityDate || null,
      paymentHistory: insertNoteListing.paymentHistory || null,
      propertyAddress: insertNoteListing.propertyAddress,
      propertyCity: insertNoteListing.propertyCity || null,
      propertyState: insertNoteListing.propertyState,
      propertyZipCode: insertNoteListing.propertyZipCode || null,
      propertyCounty: insertNoteListing.propertyCounty || null,
      propertyType: insertNoteListing.propertyType,
      propertyValue: insertNoteListing.propertyValue || null,
      loanToValueRatio: insertNoteListing.loanToValueRatio || 75,
      propertyDescription: insertNoteListing.propertyDescription || null,
      isSecured: insertNoteListing.isSecured ?? true,
      collateralType: insertNoteListing.collateralType || null,
      askingPrice: insertNoteListing.askingPrice,
      expectedYield: insertNoteListing.expectedYield || null,
      amortizationType: insertNoteListing.amortizationType || null,
      paymentFrequency: insertNoteListing.paymentFrequency || 'monthly',
      status: insertNoteListing.status || 'active',
      featured: insertNoteListing.featured ?? false,
      isPublic: insertNoteListing.isPublic ?? true,
      verificationStatus: insertNoteListing.verificationStatus || 'pending',
      description: insertNoteListing.description || null,
      specialNotes: insertNoteListing.specialNotes || null,
      dueDiligenceCompleted: insertNoteListing.dueDiligenceCompleted ?? false,
      dueDiligenceNotes: insertNoteListing.dueDiligenceNotes || null,
      viewCount: 0,
      favoriteCount: 0,
      inquiryCount: 0,
      accessRequests: 0,
      lastAccessRequestAt: null,
      listedAt: new Date(),
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.noteListings.set(id, noteListing);
    return noteListing;
  }
  
  async getNoteListingById(id: number): Promise<NoteListing | undefined> {
    return this.noteListings.get(id);
  }
  
  async getNoteListingsBySellerId(sellerId: number): Promise<NoteListing[]> {
    return Array.from(this.noteListings.values()).filter(
      (listing) => listing.sellerId === sellerId
    );
  }
  
  async getAllNoteListings(): Promise<NoteListing[]> {
    return Array.from(this.noteListings.values());
  }
  
  async updateNoteListing(id: number, listing: Partial<InsertNoteListing>): Promise<NoteListing | undefined> {
    const existingListing = this.noteListings.get(id);
    
    if (!existingListing) {
      return undefined;
    }
    
    // Create updated listing with all the existing fields first
    const updatedListing: NoteListing = {
      ...existingListing,
      // Update with new values if provided or keep existing ones
      sellerId: listing.sellerId ?? existingListing.sellerId,
      title: listing.title ?? existingListing.title,
      noteType: listing.noteType ?? existingListing.noteType,
      performanceStatus: listing.performanceStatus ?? existingListing.performanceStatus,
      originalLoanAmount: listing.originalLoanAmount ?? existingListing.originalLoanAmount,
      currentLoanAmount: listing.currentLoanAmount ?? existingListing.currentLoanAmount,
      interestRate: listing.interestRate ?? existingListing.interestRate,
      originalLoanTerm: listing.originalLoanTerm ?? existingListing.originalLoanTerm,
      remainingLoanTerm: listing.remainingLoanTerm ?? existingListing.remainingLoanTerm,
      monthlyPaymentAmount: listing.monthlyPaymentAmount ?? existingListing.monthlyPaymentAmount,
      propertyAddress: listing.propertyAddress ?? existingListing.propertyAddress,
      propertyState: listing.propertyState ?? existingListing.propertyState,
      propertyType: listing.propertyType ?? existingListing.propertyType,
      askingPrice: listing.askingPrice ?? existingListing.askingPrice,
      description: listing.description !== undefined ? (listing.description || null) : existingListing.description,
      // Always update the timestamp when editing
      updatedAt: new Date()
    };
    
    this.noteListings.set(id, updatedListing);
    return updatedListing;
  }
  
  async deleteNoteListing(id: number): Promise<boolean> {
    return this.noteListings.delete(id);
  }
  
  // Note Document operations
  async createNoteDocument(insertDocument: InsertNoteDocument): Promise<NoteDocument> {
    const id = this.currentNoteDocumentId++;
    const document: NoteDocument = {
      id,
      noteListingId: insertDocument.noteListingId,
      documentType: insertDocument.documentType,
      documentUrl: insertDocument.documentUrl,
      fileName: insertDocument.fileName,
      fileSize: insertDocument.fileSize,
      isPublic: insertDocument.isPublic ?? false,
      verificationStatus: insertDocument.verificationStatus || 'pending',
      description: insertDocument.description || null,
      uploadedById: insertDocument.uploadedById || null,
      uploadedAt: new Date()
    };
    this.noteDocuments.set(id, document);
    return document;
  }
  
  async getNoteDocumentsByListingId(noteListingId: number): Promise<NoteDocument[]> {
    return Array.from(this.noteDocuments.values()).filter(
      (document) => document.noteListingId === noteListingId
    );
  }
  
  async deleteNoteDocument(id: number): Promise<boolean> {
    return this.noteDocuments.delete(id);
  }
  
  // Access Request operations
  async createAccessRequest(insertAccessRequest: InsertAccessRequest): Promise<AccessRequest> {
    const id = this.currentAccessRequestId++;
    const now = new Date();
    
    // Calculate expiration date (48 hours from now)
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    const accessRequest: AccessRequest = {
      id,
      buyerId: insertAccessRequest.buyerId,
      noteListingId: insertAccessRequest.noteListingId,
      requestType: insertAccessRequest.requestType || 'contact',
      message: insertAccessRequest.message || null,
      status: insertAccessRequest.status || 'pending',
      reviewedById: insertAccessRequest.reviewedById || null,
      reviewedAt: null,
      accessGranted: insertAccessRequest.accessGranted ?? false,
      documentAccessCount: 0,
      emailSent: insertAccessRequest.emailSent ?? false,
      emailSentAt: null,
      expiresAt: insertAccessRequest.expiresAt || expiresAt,
      createdAt: now,
      updatedAt: now
    };
    
    this.accessRequests.set(id, accessRequest);
    
    // Update the note listing with access request info
    const noteListing = this.noteListings.get(accessRequest.noteListingId);
    if (noteListing) {
      // Increment the access request count
      noteListing.accessRequests = (noteListing.accessRequests || 0) + 1;
      // Update the timestamp of the most recent request
      noteListing.lastAccessRequestAt = now;
      
      this.noteListings.set(accessRequest.noteListingId, noteListing);
    }
    
    return accessRequest;
  }
  
  async getAccessRequestById(id: number): Promise<AccessRequest | undefined> {
    return this.accessRequests.get(id);
  }
  
  async getAccessRequestsByNoteListingId(noteListingId: number): Promise<AccessRequest[]> {
    return Array.from(this.accessRequests.values()).filter(
      (request) => request.noteListingId === noteListingId
    );
  }
  
  async getAccessRequestsByBuyerId(buyerId: number): Promise<AccessRequest[]> {
    return Array.from(this.accessRequests.values()).filter(
      (request) => request.buyerId === buyerId
    );
  }
  
  async getAccessRequestsByBuyerAndNote(buyerId: number, noteListingId: number): Promise<AccessRequest[]> {
    return Array.from(this.accessRequests.values()).filter(
      (request) => request.buyerId === buyerId && request.noteListingId === noteListingId
    );
  }
  
  async getAllAccessRequests(): Promise<AccessRequest[]> {
    return Array.from(this.accessRequests.values());
  }
  
  async updateAccessRequest(id: number, accessRequestData: Partial<InsertAccessRequest>): Promise<AccessRequest | undefined> {
    const existingRequest = this.accessRequests.get(id);
    
    if (!existingRequest) {
      return undefined;
    }
    
    // Check if status is being updated to 'approved' or 'rejected'
    // and set reviewedAt timestamp if not already set
    let reviewedAt = existingRequest.reviewedAt;
    if ((accessRequestData.status === 'approved' || accessRequestData.status === 'rejected') && !existingRequest.reviewedAt) {
      reviewedAt = new Date();
    }
    
    const updatedRequest: AccessRequest = {
      ...existingRequest,
      buyerId: accessRequestData.buyerId ?? existingRequest.buyerId,
      noteListingId: accessRequestData.noteListingId ?? existingRequest.noteListingId,
      requestType: accessRequestData.requestType ?? existingRequest.requestType,
      status: accessRequestData.status ?? existingRequest.status,
      message: accessRequestData.message ?? existingRequest.message,
      reviewedById: accessRequestData.reviewedById ?? existingRequest.reviewedById,
      reviewedAt: reviewedAt,
      accessGranted: accessRequestData.accessGranted ?? existingRequest.accessGranted,
      emailSent: accessRequestData.emailSent ?? existingRequest.emailSent,
      emailSentAt: existingRequest.emailSentAt,
      expiresAt: accessRequestData.expiresAt ?? existingRequest.expiresAt,
      documentAccessCount: existingRequest.documentAccessCount,
      updatedAt: new Date()
    };
    
    // If emailSent is changing from false to true, set the emailSentAt timestamp
    if (accessRequestData.emailSent === true && !existingRequest.emailSent) {
      updatedRequest.emailSentAt = new Date();
    }
    
    this.accessRequests.set(id, updatedRequest);
    
    // If access is being granted, update the note listing status if it's active
    if (accessRequestData.accessGranted === true && !existingRequest.accessGranted) {
      const noteListing = this.noteListings.get(existingRequest.noteListingId);
      if (noteListing && noteListing.status === 'active') {
        noteListing.status = 'pending';  // Change to pending when access is granted
        this.noteListings.set(noteListing.id, noteListing);
      }
    }
    
    return updatedRequest;
  }
  
  async deleteAccessRequest(id: number): Promise<boolean> {
    return this.accessRequests.delete(id);
  }
  
  // Inquiry operations
  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.currentInquiryId++;
    const now = new Date();
    const inquiry: Inquiry = {
      id,
      buyerId: insertInquiry.buyerId,
      noteListingId: insertInquiry.noteListingId,
      message: insertInquiry.message,
      offerAmount: insertInquiry.offerAmount || null,
      status: insertInquiry.status || 'pending',
      responseMessage: insertInquiry.responseMessage || null,
      respondedAt: null,
      expiresAt: insertInquiry.expiresAt || null,
      createdAt: now,
      updatedAt: now
    };
    this.inquiries.set(id, inquiry);
    
    // Update the note listing inquiry count if we were using a real database
    // But since this is in-memory, we don't need to do that
    
    return inquiry;
  }
  
  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }
  
  async getInquiriesByNoteListingId(noteListingId: number): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).filter(
      (inquiry) => inquiry.noteListingId === noteListingId
    );
  }
  
  async getInquiriesByBuyerId(buyerId: number): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).filter(
      (inquiry) => inquiry.buyerId === buyerId
    );
  }
  
  async updateInquiry(id: number, inquiryData: Partial<InsertInquiry>): Promise<Inquiry | undefined> {
    const existingInquiry = this.inquiries.get(id);
    
    if (!existingInquiry) {
      return undefined;
    }
    
    // Check if the status is being updated to "accepted" or "rejected" 
    // and set the respondedAt timestamp accordingly
    let respondedAt = existingInquiry.respondedAt;
    if (inquiryData.status === 'accepted' || inquiryData.status === 'rejected') {
      if (!existingInquiry.respondedAt) {
        respondedAt = new Date();
      }
    }
    
    const updatedInquiry: Inquiry = {
      ...existingInquiry,
      buyerId: inquiryData.buyerId ?? existingInquiry.buyerId,
      noteListingId: inquiryData.noteListingId ?? existingInquiry.noteListingId,
      message: inquiryData.message ?? existingInquiry.message,
      offerAmount: inquiryData.offerAmount ?? existingInquiry.offerAmount,
      status: inquiryData.status ?? existingInquiry.status,
      responseMessage: inquiryData.responseMessage ?? existingInquiry.responseMessage,
      expiresAt: inquiryData.expiresAt ?? existingInquiry.expiresAt,
      respondedAt: respondedAt,
      updatedAt: new Date()
    };
    
    this.inquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }
  
  async deleteInquiry(id: number): Promise<boolean> {
    return this.inquiries.delete(id);
  }
  
  // SearchNoteListings implementation for MemStorage
  async searchNoteListings(
    filters: SearchFilters,
    sort?: SortOptions,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ listings: NoteListing[], total: number }> {
    let listings = Array.from(this.noteListings.values());
    
    // Apply filters
    if (filters) {
      if (filters.noteType) {
        listings = listings.filter(listing => listing.noteType === filters.noteType);
      }
      
      if (filters.performanceStatus && filters.performanceStatus.length > 0) {
        listings = listings.filter(listing => filters.performanceStatus!.includes(listing.performanceStatus));
      }
      
      if (filters.minOriginalAmount !== undefined) {
        listings = listings.filter(listing => listing.originalLoanAmount >= filters.minOriginalAmount!);
      }
      
      if (filters.maxOriginalAmount !== undefined) {
        listings = listings.filter(listing => listing.originalLoanAmount <= filters.maxOriginalAmount!);
      }
      
      if (filters.minInterestRate !== undefined) {
        listings = listings.filter(listing => listing.interestRate >= filters.minInterestRate!);
      }
      
      if (filters.maxInterestRate !== undefined) {
        listings = listings.filter(listing => listing.interestRate <= filters.maxInterestRate!);
      }
      
      if (filters.propertyState) {
        listings = listings.filter(listing => listing.propertyState === filters.propertyState);
      }
      
      if (filters.propertyCity) {
        listings = listings.filter(listing => listing.propertyCity === filters.propertyCity);
      }
      
      if (filters.propertyType && filters.propertyType.length > 0) {
        listings = listings.filter(listing => filters.propertyType!.includes(listing.propertyType));
      }
      
      if (filters.minAskingPrice !== undefined) {
        listings = listings.filter(listing => listing.askingPrice >= filters.minAskingPrice!);
      }
      
      if (filters.maxAskingPrice !== undefined) {
        listings = listings.filter(listing => listing.askingPrice <= filters.maxAskingPrice!);
      }
      
      if (filters.status && filters.status.length > 0) {
        listings = listings.filter(listing => filters.status!.includes(listing.status));
      }
      
      // Simple keyword search implementation
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        listings = listings.filter(listing => 
          listing.title?.toLowerCase().includes(keyword) || 
          listing.description?.toLowerCase().includes(keyword) || 
          listing.propertyAddress?.toLowerCase().includes(keyword)
        );
      }
    }
    
    // Apply sorting
    if (sort) {
      listings.sort((a, b) => {
        // Handle common fields
        if (sort.field === 'askingPrice') {
          return sort.direction === 'asc' 
            ? a.askingPrice - b.askingPrice 
            : b.askingPrice - a.askingPrice;
        }
        
        if (sort.field === 'interestRate') {
          return sort.direction === 'asc' 
            ? a.interestRate - b.interestRate 
            : b.interestRate - a.interestRate;
        }
        
        if (sort.field === 'createdAt') {
          return sort.direction === 'asc' 
            ? a.createdAt.getTime() - b.createdAt.getTime() 
            : b.createdAt.getTime() - a.createdAt.getTime();
        }
        
        // Default sort by creation date
        return sort.direction === 'asc' 
          ? a.createdAt.getTime() - b.createdAt.getTime() 
          : b.createdAt.getTime() - a.createdAt.getTime();
      });
    } else {
      // Default sort by creation date, newest first
      listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    // Apply pagination
    const total = listings.length;
    listings = listings.slice(offset, offset + limit);
    
    return { listings, total };
  }
}

export class DatabaseStorage implements IStorage {
  // Access Request operations
  async createAccessRequest(accessRequest: InsertAccessRequest): Promise<AccessRequest> {
    // Set default values for fields that might not be in the input
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 48); // Default 48-hour expiration
    
    const accessRequestWithDefaults = {
      ...accessRequest,
      requestType: accessRequest.requestType || 'contact',
      message: accessRequest.message || null,
      status: accessRequest.status || 'pending',
      reviewedById: accessRequest.reviewedById || null,
      accessGranted: accessRequest.accessGranted ?? false,
      emailSent: accessRequest.emailSent ?? false,
      expiresAt: accessRequest.expiresAt || expiresAt
    };

    const [newAccessRequest] = await db
      .insert(accessRequests)
      .values(accessRequestWithDefaults)
      .returning();
    
    // Update the note listing with access request info
    await db
      .update(noteListings)
      .set({
        accessRequests: sql`COALESCE(${noteListings.accessRequests}, 0) + 1`,
        lastAccessRequestAt: now,
        updatedAt: now
      })
      .where(eq(noteListings.id, accessRequest.noteListingId));
    
    return newAccessRequest;
  }
  
  async getAccessRequestById(id: number): Promise<AccessRequest | undefined> {
    const [accessRequest] = await db
      .select()
      .from(accessRequests)
      .where(eq(accessRequests.id, id));
    return accessRequest;
  }
  
  async getAccessRequestsByNoteListingId(noteListingId: number): Promise<AccessRequest[]> {
    return await db
      .select()
      .from(accessRequests)
      .where(eq(accessRequests.noteListingId, noteListingId));
  }
  
  async getAccessRequestsByBuyerId(buyerId: number): Promise<AccessRequest[]> {
    return await db
      .select()
      .from(accessRequests)
      .where(eq(accessRequests.buyerId, buyerId));
  }
  
  async getAccessRequestsByBuyerAndNote(buyerId: number, noteListingId: number): Promise<AccessRequest[]> {
    return await db
      .select()
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.buyerId, buyerId),
          eq(accessRequests.noteListingId, noteListingId)
        )
      );
  }
  
  async getAllAccessRequests(): Promise<AccessRequest[]> {
    return await db
      .select()
      .from(accessRequests)
      .orderBy(desc(accessRequests.createdAt));
  }
  
  async updateAccessRequest(id: number, accessRequestData: Partial<InsertAccessRequest>): Promise<AccessRequest | undefined> {
    const updates: any = {
      ...accessRequestData,
      updatedAt: new Date()
    };
    
    // If we're updating the status to approved or rejected, set reviewedAt
    if (accessRequestData.status === 'approved' || accessRequestData.status === 'rejected') {
      updates.reviewedAt = new Date();
    }
    
    // If we're setting emailSent to true for the first time, set emailSentAt
    if (accessRequestData.emailSent === true) {
      const [existingRequest] = await db
        .select()
        .from(accessRequests)
        .where(eq(accessRequests.id, id));
      
      if (existingRequest && !existingRequest.emailSent) {
        updates.emailSentAt = new Date();
      }
    }
    
    const [updatedRequest] = await db
      .update(accessRequests)
      .set(updates)
      .where(eq(accessRequests.id, id))
      .returning();
    
    // If access is being granted, update the note listing status if it's active
    if (updatedRequest && accessRequestData.accessGranted === true) {
      // Check if this is a newly granted access (was previously false)
      const [existingRequest] = await db
        .select()
        .from(accessRequests)
        .where(eq(accessRequests.id, id));
      
      if (existingRequest && !existingRequest.accessGranted) {
        // Update the note listing status to pending when access is granted
        await db
          .update(noteListings)
          .set({
            status: 'pending',
            updatedAt: new Date()
          })
          .where(
            and(
              eq(noteListings.id, updatedRequest.noteListingId),
              eq(noteListings.status, 'active')
            )
          );
      }
    }
    
    return updatedRequest;
  }
  
  async deleteAccessRequest(id: number): Promise<boolean> {
    const result = await db
      .delete(accessRequests)
      .where(eq(accessRequests.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Set default values for the new schema fields that might not be in insertUser
    const userWithDefaults = {
      ...insertUser,
      status: insertUser.status || 'active',
      bio: insertUser.bio || null,
      website: insertUser.website || null,
      location: insertUser.location || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      emailNotifications: insertUser.emailNotifications ?? true,
      smsNotifications: insertUser.smsNotifications ?? false,
      marketingEmails: insertUser.marketingEmails ?? true,
      isAccreditedInvestor: insertUser.isAccreditedInvestor ?? false,
      accreditationProofUrl: insertUser.accreditationProofUrl || null,
      updatedAt: new Date()
    };

    const [user] = await db
      .insert(users)
      .values(userWithDefaults)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  // Waitlist operations
  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [waitlistEntry] = await db
      .insert(waitlistEntries)
      .values(entry)
      .returning();
    return waitlistEntry;
  }
  
  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    const [entry] = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.email, email));
    return entry;
  }
  
  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries);
  }
  
  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }
  
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      );
  }
  
  // Note Listing operations
  async createNoteListing(listing: InsertNoteListing): Promise<NoteListing> {
    // Prepare listing with proper defaults for our new schema fields
    const listingWithDefaults = {
      ...listing,
      // Set defaults for any fields not provided
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
    };

    const [noteListing] = await db
      .insert(noteListings)
      .values(listingWithDefaults)
      .returning();
    return noteListing;
  }
  
  async getNoteListingById(id: number): Promise<NoteListing | undefined> {
    const [listing] = await db
      .select()
      .from(noteListings)
      .where(eq(noteListings.id, id));
    return listing;
  }
  
  async getNoteListingsBySellerId(sellerId: number): Promise<NoteListing[]> {
    return await db
      .select()
      .from(noteListings)
      .where(eq(noteListings.sellerId, sellerId));
  }
  
  async getAllNoteListings(): Promise<NoteListing[]> {
    return await db
      .select()
      .from(noteListings)
      .orderBy(desc(noteListings.createdAt));
  }
  
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
  }
  
  async deleteNoteListing(id: number): Promise<boolean> {
    const result = await db
      .delete(noteListings)
      .where(eq(noteListings.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Note Document operations
  async createNoteDocument(document: InsertNoteDocument): Promise<NoteDocument> {
    // Add default values for fields that might not be in the input
    const documentWithDefaults = {
      ...document,
      isPublic: document.isPublic ?? false,
      description: document.description || null,
      verificationStatus: document.verificationStatus || 'pending'
    };

    const [newDocument] = await db
      .insert(noteDocuments)
      .values(documentWithDefaults)
      .returning();
    return newDocument;
  }
  
  async getNoteDocumentsByListingId(noteListingId: number): Promise<NoteDocument[]> {
    return await db
      .select()
      .from(noteDocuments)
      .where(eq(noteDocuments.noteListingId, noteListingId));
  }
  
  async deleteNoteDocument(id: number): Promise<boolean> {
    const result = await db
      .delete(noteDocuments)
      .where(eq(noteDocuments.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Legacy Note operations
  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db
      .insert(notes)
      .values(note)
      .returning();
    return newNote;
  }
  
  async getNoteById(id: number): Promise<Note | undefined> {
    const [note] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id));
    return note;
  }
  
  async getNotesByUserId(userId: number): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId));
  }
  
  async getAllNotes(): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .orderBy(desc(notes.createdAt));
  }
  
  async updateNote(id: number, noteData: Partial<InsertNote>): Promise<Note | undefined> {
    const [updatedNote] = await db
      .update(notes)
      .set(noteData)
      .where(eq(notes.id, id))
      .returning();
    
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    const result = await db
      .delete(notes)
      .where(eq(notes.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Implement search functionality for note listings
  async searchNoteListings(
    filters: SearchFilters,
    sort?: SortOptions,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ listings: NoteListing[], total: number }> {
    // Start with a base query
    let query = db.select().from(noteListings);
    
    // Apply filters
    if (filters) {
      // Note type filter
      if (filters.noteType) {
        query = query.where(eq(noteListings.noteType, filters.noteType));
      }
      
      // Performance status filter (array)
      if (filters.performanceStatus && filters.performanceStatus.length > 0) {
        query = query.where(inArray(noteListings.performanceStatus, filters.performanceStatus));
      }
      
      // Original loan amount range
      if (filters.minOriginalAmount !== undefined) {
        query = query.where(gte(noteListings.originalLoanAmount, filters.minOriginalAmount));
      }
      if (filters.maxOriginalAmount !== undefined) {
        query = query.where(lte(noteListings.originalLoanAmount, filters.maxOriginalAmount));
      }
      
      // Current loan amount range
      if (filters.minCurrentAmount !== undefined) {
        query = query.where(gte(noteListings.currentLoanAmount, filters.minCurrentAmount));
      }
      if (filters.maxCurrentAmount !== undefined) {
        query = query.where(lte(noteListings.currentLoanAmount, filters.maxCurrentAmount));
      }
      
      // Interest rate range
      if (filters.minInterestRate !== undefined) {
        query = query.where(gte(noteListings.interestRate, filters.minInterestRate));
      }
      if (filters.maxInterestRate !== undefined) {
        query = query.where(lte(noteListings.interestRate, filters.maxInterestRate));
      }
      
      // Property location filters
      if (filters.propertyState) {
        query = query.where(eq(noteListings.propertyState, filters.propertyState));
      }
      if (filters.propertyCity) {
        query = query.where(eq(noteListings.propertyCity, filters.propertyCity));
      }
      if (filters.propertyZipCode) {
        query = query.where(eq(noteListings.propertyZipCode, filters.propertyZipCode));
      }
      if (filters.propertyCounty) {
        query = query.where(eq(noteListings.propertyCounty, filters.propertyCounty));
      }
      
      // Property type filter (array)
      if (filters.propertyType && filters.propertyType.length > 0) {
        query = query.where(inArray(noteListings.propertyType, filters.propertyType));
      }
      
      // Asking price range
      if (filters.minAskingPrice !== undefined) {
        query = query.where(gte(noteListings.askingPrice, filters.minAskingPrice));
      }
      if (filters.maxAskingPrice !== undefined) {
        query = query.where(lte(noteListings.askingPrice, filters.maxAskingPrice));
      }
      
      // Property value range
      if (filters.minPropertyValue !== undefined) {
        query = query.where(gte(noteListings.propertyValue, filters.minPropertyValue));
      }
      if (filters.maxPropertyValue !== undefined) {
        query = query.where(lte(noteListings.propertyValue, filters.maxPropertyValue));
      }
      
      // Loan to value ratio range
      if (filters.minLoanToValueRatio !== undefined) {
        query = query.where(gte(noteListings.loanToValueRatio, filters.minLoanToValueRatio));
      }
      if (filters.maxLoanToValueRatio !== undefined) {
        query = query.where(lte(noteListings.loanToValueRatio, filters.maxLoanToValueRatio));
      }
      
      // Security and collateral filters
      if (filters.isSecured !== undefined) {
        query = query.where(eq(noteListings.isSecured, filters.isSecured));
      }
      if (filters.collateralType) {
        query = query.where(eq(noteListings.collateralType, filters.collateralType));
      }
      
      // Amortization and payment frequency
      if (filters.amortizationType) {
        query = query.where(eq(noteListings.amortizationType, filters.amortizationType));
      }
      if (filters.paymentFrequency) {
        query = query.where(eq(noteListings.paymentFrequency, filters.paymentFrequency));
      }
      
      // Listing status filter (array)
      if (filters.status && filters.status.length > 0) {
        query = query.where(inArray(noteListings.status, filters.status));
      } else {
        // Default to active listings only if no status filter is provided
        query = query.where(eq(noteListings.status, 'active'));
      }
      
      // Loan date range filters
      if (filters.minLoanOriginationDate) {
        query = query.where(gte(noteListings.loanOriginationDate, filters.minLoanOriginationDate));
      }
      if (filters.maxLoanOriginationDate) {
        query = query.where(lte(noteListings.loanOriginationDate, filters.maxLoanOriginationDate));
      }
      if (filters.minLoanMaturityDate) {
        query = query.where(gte(noteListings.loanMaturityDate, filters.minLoanMaturityDate));
      }
      if (filters.maxLoanMaturityDate) {
        query = query.where(lte(noteListings.loanMaturityDate, filters.maxLoanMaturityDate));
      }
      
      // Remaining loan term range
      if (filters.minRemainingLoanTerm !== undefined) {
        query = query.where(gte(noteListings.remainingLoanTerm, filters.minRemainingLoanTerm));
      }
      if (filters.maxRemainingLoanTerm !== undefined) {
        query = query.where(lte(noteListings.remainingLoanTerm, filters.maxRemainingLoanTerm));
      }
      
      // Keyword search (search in title and description)
      if (filters.keyword) {
        const keywordPattern = `%${filters.keyword}%`;
        query = query.where(
          or(
            like(noteListings.title, keywordPattern),
            like(noteListings.description || '', keywordPattern),
            like(noteListings.propertyAddress, keywordPattern)
          )
        );
      }
    }
    
    // Get the total count of matching listings (for pagination)
    const countQuery = db.select({ count: sql`count(*)` }).from(noteListings);
    const [countResult] = await countQuery;
    const total = Number(countResult.count);
    
    // Apply sorting
    if (sort) {
      const sortColumn = noteListings[sort.field as keyof typeof noteListings];
      if (sortColumn) {
        if (sort.direction === 'asc') {
          query = query.orderBy(asc(sortColumn));
        } else {
          query = query.orderBy(desc(sortColumn));
        }
      }
    } else {
      // Default sort by created date (newest first)
      query = query.orderBy(desc(noteListings.createdAt));
    }
    
    // Apply pagination
    query = query.limit(limit).offset(offset);
    
    // Execute the query
    const listings = await query;
    
    return { listings, total };
  }
  
  // Inquiry operations
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db
      .insert(inquiries)
      .values(inquiry)
      .returning();
    
    // Increment the inquiry count for the corresponding note listing
    await db
      .update(noteListings)
      .set({
        inquiryCount: sql`${noteListings.inquiryCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(noteListings.id, inquiry.noteListingId));
    
    return newInquiry;
  }
  
  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, id));
    return inquiry;
  }
  
  async getInquiriesByNoteListingId(noteListingId: number): Promise<Inquiry[]> {
    return await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.noteListingId, noteListingId))
      .orderBy(desc(inquiries.createdAt));
  }
  
  async getInquiriesByBuyerId(buyerId: number): Promise<Inquiry[]> {
    return await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.buyerId, buyerId))
      .orderBy(desc(inquiries.createdAt));
  }
  
  async updateInquiry(id: number, inquiryData: Partial<InsertInquiry>): Promise<Inquiry | undefined> {
    // If status is being set to responded, add the response timestamp
    const updateData = {
      ...inquiryData,
      ...(inquiryData.status === 'accepted' || inquiryData.status === 'rejected'
        ? { respondedAt: new Date() }
        : {})
    };
    
    const [updatedInquiry] = await db
      .update(inquiries)
      .set(updateData)
      .where(eq(inquiries.id, id))
      .returning();
    
    return updatedInquiry;
  }
  
  async deleteInquiry(id: number): Promise<boolean> {
    const result = await db
      .delete(inquiries)
      .where(eq(inquiries.id, id));
    
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
