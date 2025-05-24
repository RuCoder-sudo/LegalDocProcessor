import {
  users,
  documentTemplates,
  userDocuments,
  blogPosts,
  notifications,
  adminSettings,
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
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
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

  async createUser(userData: UpsertUser): Promise<User> {
    const userToInsert = {
      ...userData,
      id: crypto.randomUUID(),
      role: userData.role || 'user',
      subscription: userData.subscription || 'free',
      documentsCreated: userData.documentsCreated || 0,
      documentsLimit: userData.documentsLimit || 3,
    };

    const [user] = await db
      .insert(users)
      .values(userToInsert)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userToInsert = {
      ...userData,
      role: userData.role || 'user',
      subscription: userData.subscription || 'free',
      documentsCreated: userData.documentsCreated || 0,
      documentsLimit: userData.documentsLimit || 3,
    };

    // Проверяем, есть ли уже пользователь с таким email
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      const [user] = await db
        .update(users)
        .set({
          firstName: userToInsert.firstName,
          lastName: userToInsert.lastName,
          role: userToInsert.role,
          subscription: userToInsert.subscription,
          documentsCreated: userToInsert.documentsCreated,
          documentsLimit: userToInsert.documentsLimit,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return user;
    } else {
      // Создаем нового пользователя с уникальным ID
      const userWithId = {
        ...userToInsert,
        id: crypto.randomUUID()
      };
      const [user] = await db
        .insert(users)
        .values(userWithId)
        .returning();
      return user;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserDocumentCount(userId: string): Promise<void> {
    const [{ count: docCount }] = await db
      .select({ count: count() })
      .from(userDocuments)
      .where(eq(userDocuments.userId, userId));

    await db
      .update(users)
      .set({ documentsCreated: docCount })
      .where(eq(users.id, userId));
  }

  // Document template operations
  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    const templates = await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.isActive, true))
      .orderBy(documentTemplates.name);
    return templates as DocumentTemplate[];
  }

  async getDocumentTemplate(id: number): Promise<DocumentTemplate | undefined> {
    const [template] = await db
      .select()
      .from(documentTemplates)
      .where(and(eq(documentTemplates.id, id), eq(documentTemplates.isActive, true)));
    return template as DocumentTemplate;
  }

  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [newTemplate] = await db
      .insert(documentTemplates)
      .values(template)
      .returning();
    return newTemplate as DocumentTemplate;
  }

  // User document operations
  async getUserDocuments(userId: string): Promise<UserDocument[]> {
    const documents = await db
      .select()
      .from(userDocuments)
      .where(eq(userDocuments.userId, userId))
      .orderBy(desc(userDocuments.createdAt));
    return documents as UserDocument[];
  }

  async createUserDocument(document: InsertUserDocument): Promise<UserDocument> {
    const [newDocument] = await db
      .insert(userDocuments)
      .values(document)
      .returning();
    
    // Обновляем счетчик документов пользователя
    await this.updateUserDocumentCount(document.userId);
    
    return newDocument as UserDocument;
  }

  async getUserDocument(id: number, userId: string): Promise<UserDocument | undefined> {
    const [document] = await db
      .select()
      .from(userDocuments)
      .where(and(eq(userDocuments.id, id), eq(userDocuments.userId, userId)));
    return document as UserDocument;
  }

  async updateUserDocument(id: number, userId: string, updates: Partial<InsertUserDocument>): Promise<UserDocument> {
    const [updatedDocument] = await db
      .update(userDocuments)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(userDocuments.id, id), eq(userDocuments.userId, userId)))
      .returning();
    return updatedDocument as UserDocument;
  }

  // Blog operations
  async getBlogPosts(published = true): Promise<BlogPost[]> {
    const posts = await db
      .select()
      .from(blogPosts)
      .where(published ? eq(blogPosts.isPublished, true) : undefined)
      .orderBy(desc(blogPosts.publishedAt));
    return posts;
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return newPost;
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return userNotifications as Notification[];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification as Notification;
  }

  async markNotificationRead(id: number, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
    return allUsers;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getUserStats(): Promise<{ totalUsers: number; premiumUsers: number; documentsCreated: number }> {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [premiumUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscription, "premium"));
    const [documentsResult] = await db.select({ count: count() }).from(userDocuments);

    return {
      totalUsers: totalUsersResult.count,
      premiumUsers: premiumUsersResult.count,
      documentsCreated: documentsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();