import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default('investor'),
  status: text("status").default('active').notNull(),
  bio: text("bio"),
  phone: text("phone"),
  company: text("company"),
  website: text("website"),
  location: text("location"),
  profileImageUrl: text("profile_image_url"),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  marketingEmails: boolean("marketing_emails").default(true),
  isAccreditedInvestor: boolean("is_accredited_investor").default(false),
  accreditationProofUrl: text("accreditation_proof_url"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect; 