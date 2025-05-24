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

// User storage table
export const users = pgTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, premium, admin
  subscription: varchar("subscription").default("free"), // free, premium
  documentsCreated: integer("documents_created").default(0),
  documentsLimit: integer("documents_limit").default(3),
  premiumUntil: timestamp("premium_until"),
  telegramBotToken: varchar("telegram_bot_token"),
  telegramChannelId: varchar("telegram_channel_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin settings
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  // Telegram настройки
  telegramBotToken: varchar("telegram_bot_token"),
  telegramChannelId: varchar("telegram_channel_id"),
  telegramSupport: varchar("telegram_support").default("@RussCoder"),
  telegramSupportText: text("telegram_support_text").default("Telegram поддержка"),
  // Email настройки  
  supportEmail: varchar("support_email").default("rucoder.rf@yandex.ru"),
  supportEmailText: text("support_email_text").default("Email поддержка"),
  // WhatsApp настройки
  whatsappNumber: varchar("whatsapp_number").default("+7 (985) 985-53-97"),
  whatsappText: text("whatsapp_text").default("WhatsApp поддержка"),
  // Сайт
  websiteUrl: varchar("website_url").default("рукодер.рф"),
  websiteText: text("website_text").default("Основной сайт"),
  // Тарифы
  freePlanLimit: integer("free_plan_limit").default(3),
  freePlanName: varchar("free_plan_name").default("Бесплатный"),
  premiumPlanLimit: integer("premium_plan_limit").default(100),
  premiumPlanName: varchar("premium_plan_name").default("Премиум"),
  premiumPlanPrice: integer("premium_plan_price").default(500),
  premiumPlanDescription: text("premium_plan_description").default("Безлимитное создание документов, редактирование, экспорт в разные форматы, QR-коды"),
  // SEO
  seoTitle: varchar("seo_title").default("ЮрДок Генератор - Автоматическое создание юридических документов"),
  seoDescription: text("seo_description").default("Профессиональный генератор юридических документов в соответствии с российским законодательством. Политики конфиденциальности, согласия на обработку ПД и другие документы."),
  seoKeywords: text("seo_keywords").default("юридические документы, политика конфиденциальности, согласие на обработку персональных данных, 152-ФЗ"),
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
  customFields: jsonb("custom_fields"), // для платных пользователей
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
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({
  id: true,
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
