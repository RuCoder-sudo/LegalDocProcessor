import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { documentFormSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Local auth routes
  app.post('/api/auth/local', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // Demo credentials
      if (username === 'admin' && password === 'admin') {
        const user = await storage.upsertUser({
          id: 'local-admin',
          email: 'admin@local.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          subscription: 'premium',
          loginType: 'local',
          password: await bcrypt.hash(password, 10),
        });

        req.login({ claims: { sub: user.id } }, (err) => {
          if (err) return res.status(500).json({ message: "Login failed" });
          res.json(user);
        });
        return;
      }

      if (username === 'lizerded' && password === 'lizeR3056806') {
        const user = await storage.upsertUser({
          id: 'local-lizerded',
          email: 'lizerded@admin.local',
          firstName: 'Админ',
          lastName: 'Системы',
          role: 'admin',
          subscription: 'premium',
          loginType: 'local',
          password: await bcrypt.hash(password, 10),
        });

        req.login({ claims: { sub: user.id } }, (err) => {
          if (err) return res.status(500).json({ message: "Login failed" });
          res.json(user);
        });
        return;
      }

      res.status(401).json({ message: "Invalid credentials" });
    } catch (error) {
      console.error("Local auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Public routes (no auth required)
  
  // Blog posts
  app.get('/api/blog', async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Document templates (public examples)
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await storage.getDocumentTemplates();
      // Only return basic info for public view
      const publicTemplates = templates.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        industry: t.industry,
        isPremium: t.isPremium,
      }));
      res.json(publicTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id/example', async (req, res) => {
    try {
      const template = await storage.getDocumentTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Return example content (first 500 chars)
      const exampleContent = template.content.substring(0, 500) + "...";
      res.json({
        id: template.id,
        name: template.name,
        type: template.type,
        exampleContent,
        isPremium: template.isPremium,
      });
    } catch (error) {
      console.error("Error fetching template example:", error);
      res.status(500).json({ message: "Failed to fetch template example" });
    }
  });

  // Protected routes (auth required)

  // User documents
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check document limit for free users
      if (user.subscription === 'free' && user.documentsCreated >= user.documentsLimit) {
        return res.status(403).json({ 
          message: "Document limit reached. Upgrade to premium for unlimited documents.",
          code: "LIMIT_REACHED"
        });
      }

      const validatedData = documentFormSchema.parse(req.body);
      
      // Generate document content
      const content = await generateDocumentContent(validatedData);
      
      const document = await storage.createUserDocument({
        userId,
        name: `${getDocumentTypeName(validatedData.type)} - ${validatedData.companyName}`,
        type: validatedData.type,
        formData: validatedData,
        generatedContent: content,
        status: 'completed',
      });

      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.get('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const document = await storage.getUserDocument(parseInt(req.params.id), userId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Notifications
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { role } = req.body;
      if (!['user', 'premium', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updatedUser = await storage.updateUserRole(req.params.id, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function getDocumentTypeName(type: string): string {
  const names = {
    privacy: "Политика конфиденциальности",
    terms: "Пользовательское соглашение", 
    consent: "Согласие на обработку ПД",
    offer: "Публичная оферта",
    cookie: "Политика использования Cookie",
    return: "Политика возврата",
  };
  return names[type as keyof typeof names] || type;
}

async function generateDocumentContent(data: any): Promise<string> {
  // This is a simplified document generator
  // In a real app, you would use templates and sophisticated text generation
  
  const { type, companyName, inn, legalAddress, websiteUrl, contactEmail } = data;
  
  if (type === 'privacy') {
    return `
ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая Политика конфиденциальности (далее — Политика) действует в отношении информации, которую ${companyName} (ИНН ${inn}) (далее — Оператор) может получить о Пользователе во время использования сайта ${websiteUrl}.

1.2. Использование сайта означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки его персональных данных.

2. ПЕРСОНАЛЬНЫЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЕЙ

2.1. В рамках настоящей Политики под персональными данными понимается:
- Персональные данные, которые Пользователь предоставляет о себе самостоятельно при регистрации
- Данные об IP-адресе, информация из cookies, данные о браузере
- Статистическая информация о действиях пользователя на сайте

3. ЦЕЛИ СБОРА ПЕРСОНАЛЬНЫХ ДАННЫХ

Оператор собирает и использует персональные данные в следующих целях:
- Обработка заказов и предоставление услуг
- Предоставление клиентской поддержки
- Информирование о новых товарах и услугах
- Улучшение качества сервиса

4. КОНТАКТНАЯ ИНФОРМАЦИЯ

По вопросам обработки персональных данных обращайтесь:
Email: ${contactEmail}
Адрес: ${legalAddress}

Дата вступления в силу: ${new Date().toLocaleDateString('ru-RU')}
    `.trim();
  }
  
  if (type === 'terms') {
    return `
ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ

1. ТЕРМИНЫ И ОПРЕДЕЛЕНИЯ

Сайт — интернет-ресурс, расположенный по адресу ${websiteUrl}, принадлежащий ${companyName}.

2. ПРЕДМЕТ СОГЛАШЕНИЯ

2.1. Администрация предоставляет Пользователю право использования Сайта следующими способами:
- Просмотр материалов, размещенных на Сайте
- Использование сервисов Сайта
- Участие в программах и акциях

3. ПРАВА И ОБЯЗАННОСТИ ПОЛЬЗОВАТЕЛЯ

3.1. Пользователь имеет право:
- Получать доступ к информации и сервисам Сайта
- Получать техническую поддержку

3.2. Пользователь обязуется:
- Соблюдать условия настоящего Соглашения
- Не нарушать работу Сайта

4. КОНТАКТНАЯ ИНФОРМАЦИЯ

${companyName}
ИНН: ${inn}
Адрес: ${legalAddress}
Email: ${contactEmail}
    `.trim();
  }
  
  // Add more document types as needed
  return `Документ типа "${type}" для ${companyName} создан ${new Date().toLocaleDateString('ru-RU')}`;
}
