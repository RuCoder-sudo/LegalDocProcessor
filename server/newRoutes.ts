import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSimpleAuth, requireAuth } from "./simpleAuth";
import { users, userDocuments, blogPosts, adminSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple Auth middleware
  setupSimpleAuth(app);

  // Blog posts (public)
  app.get('/api/blog', async (req, res) => {
    try {
      const posts = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.isPublished, true))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(10);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Ошибка при загрузке новостей" });
    }
  });

  // Document templates (public)
  app.get('/api/templates', async (req, res) => {
    try {
      // For now, return empty array since we need to implement templates
      res.json([]);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Ошибка при загрузке шаблонов" });
    }
  });

  // Create document - ИСПРАВЛЕНА ПЕРЕДАЧА ДАННЫХ
  app.post('/api/documents', async (req: any, res) => {
    try {
      console.log('Full request body:', req.body);
      
      const { type, ...formData } = req.body;
      const userId = "admin_main"; // Временная заглушка

      console.log('Extracted type:', type);
      console.log('Extracted formData:', formData);

      // Check document limit
      const userDocCount = await db
        .select()
        .from(userDocuments)
        .where(eq(userDocuments.userId, userId));

      const user = { subscription: 'premium' }; // Временная заглушка
      const limit = 100;

      if (userDocCount.length >= limit) {
        return res.status(403).json({ 
          message: `Достигнут лимит документов (${limit}). Обновитесь до премиум для создания большего количества документов.` 
        });
      }

      // Generate document content with extracted form data
      const content = await generateDocumentContent(type, formData);

      const [newDocument] = await db
        .insert(userDocuments)
        .values({
          userId,
          name: `${getDocumentTypeName(type)} - ${formData.companyName}`,
          type,
          formData,
          generatedContent: content,
          status: 'completed'
        })
        .returning();

      res.json(newDocument);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Ошибка при создании документа" });
    }
  });

  // Get user documents (protected)
  app.get('/api/documents', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const documents = await db
        .select()
        .from(userDocuments)
        .where(eq(userDocuments.userId, userId))
        .orderBy(desc(userDocuments.createdAt));

      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Ошибка при загрузке документов" });
    }
  });

  // Admin settings (protected - admin only)
  app.get('/api/admin/settings', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const [settings] = await db
        .select()
        .from(adminSettings)
        .limit(1);

      if (!settings) {
        // Create default settings
        const [newSettings] = await db
          .insert(adminSettings)
          .values({})
          .returning();
        return res.json(newSettings);
      }

      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Ошибка при загрузке настроек" });
    }
  });

  // Update admin settings (protected - admin only)
  app.put('/api/admin/settings', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const updates = req.body;
      
      const [settings] = await db
        .select()
        .from(adminSettings)
        .limit(1);

      if (!settings) {
        const [newSettings] = await db
          .insert(adminSettings)
          .values(updates)
          .returning();
        return res.json(newSettings);
      }

      const [updatedSettings] = await db
        .update(adminSettings)
        .set(updates)
        .where(eq(adminSettings.id, settings.id))
        .returning();

      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating admin settings:", error);
      res.status(500).json({ message: "Ошибка при обновлении настроек" });
    }
  });

  // Get all users (admin only)
  app.get('/api/admin/users', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));

      res.json(allUsers.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Ошибка при загрузке пользователей" });
    }
  });

  // Update user role (admin only)
  app.put('/api/admin/users/:userId/role', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const { userId } = req.params;
      const { role } = req.body;

      const [updatedUser] = await db
        .update(users)
        .set({ role, subscription: role === 'premium' ? 'premium' : role === 'admin' ? 'premium' : 'free' })
        .where(eq(users.id, userId))
        .returning();

      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Ошибка при обновлении роли" });
    }
  });

  // Get admin stats (admin only)
  app.get('/api/admin/stats', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const allUsers = await db.select().from(users);
      const totalUsers = allUsers.length;
      const premiumUsers = allUsers.filter(u => u.subscription === 'premium').length;
      const documentsCreated = allUsers.reduce((sum, u) => sum + (u.documentsCreated || 0), 0);

      res.json({
        totalUsers,
        premiumUsers,
        documentsCreated
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Ошибка при загрузке статистики" });
    }
  });

  const httpServer = createServer(app);
  // Admin routes - исправлены критические ошибки
  app.get('/api/admin/stats', requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Недостаточно прав" });
      }

      // Простая статистика из базы данных
      const totalUsers = await db.select().from(users);
      const premiumUsers = totalUsers.filter(u => u.subscription === 'premium');
      const documentsCreated = await db.select().from(userDocuments);

      const stats = {
        totalUsers: totalUsers.length,
        premiumUsers: premiumUsers.length,
        documentsCreated: documentsCreated.length
      };

      res.json(stats);
    } catch (error) {
      console.error("Ошибка получения статистики:", error);
      res.status(500).json({ message: "Ошибка получения статистики" });
    }
  });

  app.get('/api/admin/users', requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Недостаточно прав" });
      }

      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error("Ошибка получения пользователей:", error);
      res.status(500).json({ message: "Ошибка получения пользователей" });
    }
  });

  app.patch('/api/admin/users/:userId/role', requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const currentUserId = req.session.userId;
      const [currentUser] = await db.select().from(users).where(eq(users.id, currentUserId));
      
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Недостаточно прав" });
      }

      const { userId } = req.params;
      const { role } = req.body;

      const [updatedUser] = await db
        .update(users)
        .set({ role })
        .where(eq(users.id, userId))
        .returning();

      res.json(updatedUser);
    } catch (error) {
      console.error("Ошибка обновления роли:", error);
      res.status(500).json({ message: "Ошибка обновления роли" });
    }
  });

  app.post('/api/admin/notifications', requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Недостаточно прав" });
      }

      const { title, message } = req.body;

      // Создаем простое уведомление - пока в консоль
      console.log(`Admin notification sent: ${title} - ${message}`);

      res.json({ message: "Уведомление отправлено" });
    } catch (error) {
      console.error("Ошибка отправки уведомлений:", error);
      res.status(500).json({ message: "Ошибка отправки уведомлений" });
    }
  });

  return httpServer;
}

function getDocumentTypeName(type: string): string {
  const types = {
    privacy: "Политика конфиденциальности",
    terms: "Пользовательское соглашение", 
    consent: "Согласие на обработку ПД",
    offer: "Публичная оферта",
    cookie: "Политика использования cookies",
    return: "Политика возврата"
  };
  return types[type as keyof typeof types] || "Документ";
}

async function generateDocumentContent(type: string, formData: any): Promise<string> {
  console.log('Generating document content for type:', type);
  console.log('FormData received:', formData);
  
  // Извлекаем данные напрямую из formData, учитывая возможные вложенности
  const companyName = formData?.companyName || formData?.company_name || 'Не указано';
  const inn = formData?.inn || 'Не указан';
  const legalAddress = formData?.legalAddress || formData?.legal_address || 'Не указан';
  const websiteUrl = formData?.websiteUrl || formData?.website_url || 'example.com';
  const contactEmail = formData?.contactEmail || formData?.contact_email || 'contact@example.com';
  const phone = formData?.phone || 'Не указан';
  const registrar = formData?.registrar || 'Не указан';
  const hostingProvider = formData?.hostingProvider || formData?.hosting_provider || 'Не указан';
  
  console.log('Extracted values:', { companyName, inn, legalAddress, websiteUrl, contactEmail });
  
  if (type === 'privacy') {
    return `ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая Политика конфиденциальности (далее — Политика) действует в отношении информации, которую ${companyName} (ИНН ${inn}) (далее — Оператор) может получить о Пользователе во время использования сайта ${websiteUrl}.

1.2. Использование сайта означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки его персональных данных.

2. ПЕРСОНАЛЬНЫЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЕЙ

2.1. В рамках настоящей Политики под персональными данными понимается:
- Персональные данные, которые Пользователь предоставляет о себе самостоятельно при регистрации или совершении покупок
- Данные об IP-адресе, информация из cookies, данные о браузере  
- Статистическая информация о действиях пользователя на сайте

3. ЦЕЛИ СБОРА ПЕРСОНАЛЬНЫХ ДАННЫХ

Оператор собирает и использует персональные данные в следующих целях:
- Обработка заказов и предоставление услуг
- Предоставление клиентской поддержки
- Информирование о новых товарах и услугах
- Улучшение качества сервиса

4. ОБРАБОТКА ПЕРСОНАЛЬНЫХ ДАННЫХ

4.1. Обработка персональных данных пользователя осуществляется в соответствии с законодательством Российской Федерации.

4.2. Оператор обрабатывает персональные данные пользователя в случае:
- Заполнения пользователем форм на сайте
- Совершения действий пользователем, предусмотренных Политикой
- Регистрации на сайте или подписки на рассылку

5. ХРАНЕНИЕ И ЗАЩИТА ПЕРСОНАЛЬНЫХ ДАННЫХ

5.1. Оператор принимает необходимые организационные и технические меры для защиты персональных данных.

5.2. Хостинг-провайдер: ${hostingProvider || 'не указан'}
5.3. Регистратор домена: ${registrar || 'не указан'}

6. КОНТАКТНАЯ ИНФОРМАЦИЯ

По вопросам обработки персональных данных обращайтесь:
Email: ${contactEmail}
${phone ? `Телефон: ${phone}` : ''}
Адрес: ${legalAddress}

Дата вступления в силу: ${new Date().toLocaleDateString('ru-RU')}`;
  }

  // Add other document types here
  return `Документ ${getDocumentTypeName(type)} для ${companyName}`;
}