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
  type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, ilike } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

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
  updateNoteListing(id: number, listing: Partial<InsertNoteListing>): Promise<NoteListing | undefined>;
  deleteNoteListing(id: number): Promise<boolean>;
  
  // Note Document operations
  createNoteDocument(document: InsertNoteDocument): Promise<NoteDocument>;
  getNoteDocumentsByListingId(noteListingId: number): Promise<NoteDocument[]>;
  deleteNoteDocument(id: number): Promise<boolean>;
  
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
  
  private currentUserId: number;
  private currentWaitlistEntryId: number;
  private currentMessageId: number;
  private currentNoteListingId: number;
  private currentNoteDocumentId: number;
  private currentNoteId: number;

  constructor() {
    this.users = new Map();
    this.waitlistEntries = new Map();
    this.messages = new Map();
    this.noteListings = new Map();
    this.noteDocuments = new Map();
    this.notes = new Map();
    
    this.currentUserId = 1;
    this.currentWaitlistEntryId = 1;
    this.currentMessageId = 1;
    this.currentNoteListingId = 1;
    this.currentNoteDocumentId = 1;
    this.currentNoteId = 1;
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
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password, 
      email: insertUser.email,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      role: insertUser.role || 'user',
      phone: insertUser.phone || null,
      company: insertUser.company || null,
      createdAt: new Date() 
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
      loanAmount: insertNoteListing.loanAmount,
      interestRate: insertNoteListing.interestRate,
      loanTerm: insertNoteListing.loanTerm,
      paymentAmount: insertNoteListing.paymentAmount,
      timeHeld: insertNoteListing.timeHeld,
      remainingPayments: insertNoteListing.remainingPayments,
      propertyAddress: insertNoteListing.propertyAddress,
      askingPrice: insertNoteListing.askingPrice,
      propertyType: insertNoteListing.propertyType,
      description: insertNoteListing.description || null,
      status: 'active',
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
    
    // Handle description field correctly
    const updatedListing: NoteListing = {
      ...existingListing,
      sellerId: listing.sellerId ?? existingListing.sellerId,
      loanAmount: listing.loanAmount ?? existingListing.loanAmount,
      interestRate: listing.interestRate ?? existingListing.interestRate,
      loanTerm: listing.loanTerm ?? existingListing.loanTerm,
      paymentAmount: listing.paymentAmount ?? existingListing.paymentAmount,
      timeHeld: listing.timeHeld ?? existingListing.timeHeld,
      remainingPayments: listing.remainingPayments ?? existingListing.remainingPayments,
      propertyAddress: listing.propertyAddress ?? existingListing.propertyAddress,
      askingPrice: listing.askingPrice ?? existingListing.askingPrice,
      propertyType: listing.propertyType ?? existingListing.propertyType,
      description: listing.description !== undefined ? (listing.description || null) : existingListing.description,
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
}

export class DatabaseStorage implements IStorage {
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
}

// Replace MemStorage with DatabaseStorage to use PostgreSQL database
export const storage = new DatabaseStorage();
