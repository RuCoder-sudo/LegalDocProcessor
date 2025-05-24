import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, premium, admin
  subscription: varchar("subscription").default("free"), // free, premium
  documentsCreated: integer("documents_created").default(0),
  documentsLimit: integer("documents_limit").default(3),
  loginType: varchar("login_type").default("replit"), // replit, local
  password: varchar("password"), // for local auth
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document templates
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // privacy, terms, consent, offer, cookie, return
  industry: varchar("industry"), // ecommerce, medical, education, etc
  content: text("content").notNull(),
  fields: jsonb("fields").notNull(),
  isPremium: boolean("is_premium").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User documents
export const userDocuments = pgTable("user_documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  templateId: integer("template_id").references(() => documentTemplates.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  formData: jsonb("form_data").notNull(),
  generatedContent: text("generated_content"),
  status: varchar("status").default("draft"), // draft, completed, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document exports
export const documentExports = pgTable("document_exports", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => userDocuments.id),
  format: varchar("format").notNull(), // pdf, doc, html
  exportedAt: timestamp("exported_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // legal_update, reminder, info
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // legal_news, guides, faq
  tags: text("tags").array(),
  authorId: varchar("author_id").references(() => users.id),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserDocumentSchema = createInsertSchema(userDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Select schemas  
export const selectUserSchema = createSelectSchema(users);
export const selectDocumentTemplateSchema = createSelectSchema(documentTemplates);
export const selectUserDocumentSchema = createSelectSchema(userDocuments);
export const selectBlogPostSchema = createSelectSchema(blogPosts);
export const selectNotificationSchema = createSelectSchema(notifications);

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = z.infer<typeof selectDocumentTemplateSchema>;
export type InsertUserDocument = z.infer<typeof insertUserDocumentSchema>;
export type UserDocument = z.infer<typeof selectUserDocumentSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = z.infer<typeof selectBlogPostSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;

// Form validation schemas
export const documentFormSchema = z.object({
  type: z.enum(["privacy", "terms", "consent", "offer", "cookie", "return"]),
  companyName: z.string().min(1, "Название компании обязательно"),
  inn: z.string().min(10, "ИНН должен содержать минимум 10 цифр").max(12),
  ogrn: z.string().optional(),
  legalAddress: z.string().min(1, "Юридический адрес обязателен"),
  websiteUrl: z.string().url("Некорректный URL сайта"),
  contactEmail: z.string().email("Некорректный email"),
  registrar: z.string().optional(),
  hostingProvider: z.string().optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
});

export type DocumentFormData = z.infer<typeof documentFormSchema>;
