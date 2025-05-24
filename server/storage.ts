import {
  users,
  documentTemplates,
  userDocuments,
  blogPosts,
  notifications,
  type User,
  type UpsertUser,
  type DocumentTemplate,
  type InsertDocumentTemplate,
  type UserDocument,
  type InsertUserDocument,
  type BlogPost,
  type InsertBlogPost,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserDocumentCount(userId: string): Promise<void>;
  
  // Document template operations
  getDocumentTemplates(): Promise<DocumentTemplate[]>;
  getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined>;
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  
  // User document operations
  getUserDocuments(userId: string): Promise<UserDocument[]>;
  createUserDocument(document: InsertUserDocument): Promise<UserDocument>;
  getUserDocument(id: number, userId: string): Promise<UserDocument | undefined>;
  updateUserDocument(id: number, userId: string, updates: Partial<InsertUserDocument>): Promise<UserDocument>;
  
  // Blog operations
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number, userId: string): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  getUserStats(): Promise<{ totalUsers: number; premiumUsers: number; documentsCreated: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserDocumentCount(userId: string): Promise<void> {
    const [result] = await db
      .select({ count: count() })
      .from(userDocuments)
      .where(eq(userDocuments.userId, userId));
    
    await db
      .update(users)
      .set({ documentsCreated: result.count })
      .where(eq(users.id, userId));
  }

  // Document template operations
  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    return await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.isActive, true))
      .orderBy(documentTemplates.name);
  }

  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    const [template] = await db
      .select()
      .from(documentTemplates)
      .where(and(eq(documentTemplates.id, id), eq(documentTemplates.isActive, true)));
    return template;
  }

  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [created] = await db
      .insert(documentTemplates)
      .values(template)
      .returning();
    return created;
  }

  // User document operations
  async getUserDocuments(userId: string): Promise<UserDocument[]> {
    return await db
      .select()
      .from(userDocuments)
      .where(eq(userDocuments.userId, userId))
      .orderBy(desc(userDocuments.createdAt));
  }

  async createUserDocument(document: InsertUserDocument): Promise<UserDocument> {
    const [created] = await db
      .insert(userDocuments)
      .values(document)
      .returning();
    
    // Update user document count
    await this.updateUserDocumentCount(document.userId);
    
    return created;
  }

  async getUserDocument(id: number, userId: string): Promise<UserDocument | undefined> {
    const [document] = await db
      .select()
      .from(userDocuments)
      .where(and(eq(userDocuments.id, id), eq(userDocuments.userId, userId)));
    return document;
  }

  async updateUserDocument(id: number, userId: string, updates: Partial<InsertUserDocument>): Promise<UserDocument> {
    const [updated] = await db
      .update(userDocuments)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(userDocuments.id, id), eq(userDocuments.userId, userId)))
      .returning();
    return updated;
  }

  // Blog operations
  async getBlogPosts(published = true): Promise<BlogPost[]> {
    const query = db.select().from(blogPosts);
    
    if (published) {
      return await query
        .where(eq(blogPosts.isPublished, true))
        .orderBy(desc(blogPosts.publishedAt));
    }
    
    return await query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [created] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return created;
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return created;
  }

  async markNotificationRead(id: number, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getUserStats(): Promise<{ totalUsers: number; premiumUsers: number; documentsCreated: number }> {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [premiumUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscription, "premium"));
    const [documentsCreated] = await db.select({ count: count() }).from(userDocuments);
    
    return {
      totalUsers: totalUsers.count,
      premiumUsers: premiumUsers.count,
      documentsCreated: documentsCreated.count,
    };
  }
}

export const storage = new DatabaseStorage();
