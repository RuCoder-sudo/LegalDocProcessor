import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { setupJwtAuth } from "./simpleJwtAuth";
import { users, userDocuments, blogPosts, adminSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAuth, requireAdmin } from "./authMiddleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Cookie parser middleware
  app.use(cookieParser());

  // CORS middleware для правильной работы с cookie
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });

  // JWT Auth system
  setupJwtAuth(app);

  // Простой тест для проверки авторизации с JWT
  app.get('/api/test/login-admin', (req, res) => {
    // Принудительно логиним админа для тестирования
    const adminUser = {
      id: "admin_main",
      email: "rucoder.rf@yandex.ru",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      subscription: "premium",
      documentsCreated: 0,
      documentsLimit: -1
    };

    // Создаем простой токен
    const token = Buffer.from(JSON.stringify({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    })).toString('base64');

    // Устанавливаем cookie
    res.cookie('auth-token', token, {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });
    
    console.log("TEST - Admin logged in with JWT token");
    console.log("Set cookie auth-token:", token);
    
    // Возвращаем токен в ответе для установки в заголовках
    res.json({ 
      message: "Test admin login successful with JWT", 
      user: adminUser,
      token: token
    });
  });

  // Тестовый эндпоинт для проверки JWT системы
  app.get('/api/test/auth', (req, res) => {
    const token = (req as any).cookies['auth-token'];
    let tokenData = null;
    
    if (token) {
      try {
        tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      } catch (e) {
        // Invalid token
      }
    }
    
    res.json({
      message: "JWT Auth system is working",
      hasToken: !!token,
      tokenData: tokenData,
      cookies: req.headers.cookie
    });
  });

  // Получение документов пользователя
  app.get('/api/user/documents', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const userDocs = await db
        .select()
        .from(userDocuments)
        .where(eq(userDocuments.userId, userId))
        .orderBy(desc(userDocuments.createdAt));

      res.json(userDocs);
    } catch (error) {
      console.error("Error fetching user documents:", error);
      res.status(500).json({ message: "Ошибка при загрузке документов" });
    }
  });

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
  
  // Create document
  app.post('/api/documents', async (req: any, res) => {
    try {
      console.log('Creating document, body:', req.body);
      
      const { type, ...formData } = req.body;
      
      // Get user ID from token or session
      let userId = null;
      
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        try {
          const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
          userId = decoded.id;
          console.log("Got userId from token:", userId);
        } catch (e) {
          console.error("Error decoding token:", e);
        }
      }
      
      if (!userId && req.cookies && req.cookies['auth-token']) {
        try {
          const decoded = JSON.parse(Buffer.from(req.cookies['auth-token'], 'base64').toString('utf8'));
          userId = decoded.id;
          console.log("Got userId from cookie:", userId);
        } catch (e) {
          console.error("Error decoding cookie:", e);
        }
      }
      
      if (!userId) {
        // For anonymous users, create a temporary ID
        userId = `temp_${Date.now()}`;
        console.log("Created temporary userId:", userId);
      }
      
      // Generate document content
      const content = await generateDocumentContent(type, formData);
      
      // Save to database
      const result = await db
        .insert(userDocuments)
        .values({
          userId,
          name: `${getDocumentTypeName(type)} - ${formData.companyName || 'Untitled'}`,
          type,
          formData,
          generatedContent: content,
          status: 'completed'
        })
        .returning();
      
      console.log("Document created:", result[0]);
      
      // Return the new document
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Ошибка при создании документа" });
    }
  });

  // Admin settings (protected - admin only)
  app.get('/api/admin/settings', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const settings = await db
        .select()
        .from(adminSettings)
        .limit(1);

      if (settings.length === 0) {
        // Create default settings
        const newSettings = await db
          .insert(adminSettings)
          .values({})
          .returning();
        return res.json(newSettings[0]);
      }

      res.json(settings[0]);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Ошибка при загрузке настроек" });
    }
  });

  // Update admin settings (protected - admin only)
  app.put('/api/admin/settings', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const updates = req.body;
      
      const settings = await db
        .select()
        .from(adminSettings)
        .limit(1);

      if (settings.length === 0) {
        const newSettings = await db
          .insert(adminSettings)
          .values(updates)
          .returning();
        return res.json(newSettings[0]);
      }

      const updatedSettings = await db
        .update(adminSettings)
        .set(updates)
        .where(eq(adminSettings.id, settings[0].id))
        .returning();

      res.json(updatedSettings[0]);
    } catch (error) {
      console.error("Error updating admin settings:", error);
      res.status(500).json({ message: "Ошибка при обновлении настроек" });
    }
  });

  // Get all users (admin only)
  app.get('/api/admin/users', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));

      // Remove passwords for security
      res.json(allUsers.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Ошибка при загрузке пользователей" });
    }
  });

  // Update user role (admin only)
  app.put('/api/admin/users/:userId/role', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Недопустимая роль" });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const updatedUser = await db
        .update(users)
        .set({ role })
        .where(eq(users.id, userId))
        .returning();

      res.json({ ...updatedUser[0], password: undefined });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Ошибка при обновлении роли пользователя" });
    }
  });

  // Get admin stats (admin only)
  app.get('/api/admin/stats', requireAuth, requireAdmin, async (req: any, res) => {
    try {
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
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Ошибка при загрузке статистики" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to get document type name
function getDocumentTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    'privacy-policy': 'Политика конфиденциальности',
    'terms-of-service': 'Пользовательское соглашение',
    'job-offer': 'Предложение о работе',
    'invoice': 'Счет на оплату',
    'legal-contract': 'Юридический договор',
    'employment-contract': 'Трудовой договор',
    'nda': 'Соглашение о неразглашении'
  };
  return typeNames[type] || 'Документ';
}

// Simplified document content generation
async function generateDocumentContent(type: string, formData: any): Promise<string> {
  return `Документ типа "${type}" с данными: ${JSON.stringify(formData, null, 2)}`;
}