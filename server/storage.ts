import { 
  users, 
  waitlistEntries, 
  messages, 
  notes, 
  type User, 
  type InsertUser, 
  type WaitlistEntry, 
  type InsertWaitlistEntry,
  type Message,
  type InsertMessage,
  type Note,
  type InsertNote
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Waitlist operations
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined>;
  getAllWaitlistEntries(): Promise<WaitlistEntry[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  
  // Note operations
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
  private notes: Map<number, Note>;
  private currentUserId: number;
  private currentWaitlistEntryId: number;
  private currentMessageId: number;
  private currentNoteId: number;

  constructor() {
    this.users = new Map();
    this.waitlistEntries = new Map();
    this.messages = new Map();
    this.notes = new Map();
    this.currentUserId = 1;
    this.currentWaitlistEntryId = 1;
    this.currentMessageId = 1;
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
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
