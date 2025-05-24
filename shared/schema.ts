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
  role: varchar("role").default("user"), // user, premium, ultra, admin
  subscription: varchar("subscription").default("free"), // free, premium, ultra
  documentsCreated: integer("documents_created").default(0),
  documentsLimit: integer("documents_limit").default(3),
  premiumUntil: timestamp("premium_until"),
  telegramBotToken: varchar("telegram_bot_token"),
  telegramChannelId: varchar("telegram_channel_id"),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by").references(() => users.id),
  referralEarnings: integer("referral_earnings").default(0),
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
  ultraPlanLimit: integer("ultra_plan_limit").default(-1), // -1 = unlimited
  ultraPlanName: varchar("ultra_plan_name").default("Ультра"),
  ultraPlanPrice: integer("ultra_plan_price").default(1500),
  ultraPlanDescription: text("ultra_plan_description").default("Все премиум функции + персональная поддержка, приоритетная обработка, API доступ, персональные шаблоны"),
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

// QR Codes table
export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => userDocuments.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  qrData: text("qr_data").notNull(),
  qrSvg: text("qr_svg").notNull(),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback and suggestions
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // suggestion, complaint, compliment, question
  category: varchar("category").notNull(), // interface, functionality, content, performance
  rating: integer("rating"), // 1-5 stars
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  email: varchar("email"),
  isAnonymous: boolean("is_anonymous").default(false),
  status: varchar("status").default("new"), // new, reviewing, resolved
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Help articles
export const helpArticles = pgTable("help_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // getting-started, features, troubleshooting, faq
  subcategory: varchar("subcategory"),
  order: integer("order").default(0),
  isPublished: boolean("is_published").default(true),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document advanced templates
export const advancedTemplates = pgTable("advanced_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // privacy, terms, consent, offer, cookie, return, charter
  industry: varchar("industry"),
  content: text("content").notNull(),
  formConfig: jsonb("form_config").notNull(), // advanced form configuration with radio buttons, checkboxes, etc
  isPremium: boolean("is_premium").default(true),
  isUltra: boolean("is_ultra").default(false),
  features: text("features").array(), // list of features like qr_code, export_formats, etc
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

export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHelpArticleSchema = createInsertSchema(helpArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdvancedTemplateSchema = createInsertSchema(advancedTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Select schemas  
export const selectUserSchema = createSelectSchema(users);
export const selectDocumentTemplateSchema = createSelectSchema(documentTemplates);
export const selectUserDocumentSchema = createSelectSchema(userDocuments);
export const selectBlogPostSchema = createSelectSchema(blogPosts);
export const selectNotificationSchema = createSelectSchema(notifications);
export const selectQrCodeSchema = createSelectSchema(qrCodes);
export const selectFeedbackSchema = createSelectSchema(feedback);
export const selectHelpArticleSchema = createSelectSchema(helpArticles);
export const selectAdvancedTemplateSchema = createSelectSchema(advancedTemplates);

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
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type QrCode = z.infer<typeof selectQrCodeSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = z.infer<typeof selectFeedbackSchema>;
export type InsertHelpArticle = z.infer<typeof insertHelpArticleSchema>;
export type HelpArticle = z.infer<typeof selectHelpArticleSchema>;
export type InsertAdvancedTemplate = z.infer<typeof insertAdvancedTemplateSchema>;
export type AdvancedTemplate = z.infer<typeof selectAdvancedTemplateSchema>;

// Form validation schemas
export const documentFormSchema = z.object({
  type: z.enum(["privacy", "terms", "consent", "offer", "cookie", "return", "charter"]),
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
  
  // Расширенные поля для премиум/ультра пользователей
  ownerType: z.enum(["individual", "legal"]).optional(), // Физ. лицо / Юр. лицо или ИП
  isSmi: z.boolean().optional(), // Является ли сайт СМИ
  userCanPost: z.boolean().optional(), // Размещает ли пользователь информацию
  agreementStart: z.enum(["any_use", "after_registration"]).optional(),
  agreementDuration: z.enum(["indefinite", "until_new_version"]).optional(),
  canAdminChange: z.boolean().optional(),
  notifyChanges: z.enum(["yes", "sometimes", "no"]).optional(),
  
  // Права пользователя
  userRights: z.array(z.string()).optional(),
  copyRights: z.array(z.string()).optional(),
  hideInfoRights: z.array(z.string()).optional(),
  useInfoRights: z.array(z.string()).optional(),
  
  // Права администрации
  adminRights: z.array(z.string()).optional(),
  
  // Обязанности пользователя
  userObligations: z.array(z.string()).optional(),
  
  // Обязанности администрации
  adminObligations: z.array(z.string()).optional(),
  
  // Данные для обработки
  dataTypes: z.array(z.string()).optional(),
  
  // QR-код опции
  generateQr: z.boolean().optional(),
  qrData: z.string().optional(),
});

export type DocumentFormData = z.infer<typeof documentFormSchema>;

// Feedback form schema
export const feedbackFormSchema = z.object({
  type: z.enum(["suggestion", "complaint", "compliment", "question"]),
  category: z.enum(["interface", "functionality", "content", "performance"]),
  rating: z.number().min(1).max(5).optional(),
  subject: z.string().min(1, "Тема обязательна"),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
  email: z.string().email().optional(),
  isAnonymous: z.boolean().default(false),
});

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;
