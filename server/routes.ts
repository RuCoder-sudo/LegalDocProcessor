import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { documentFormSchema, insertUserDocumentSchema } from "@shared/schema";
import { storage } from "./storage";
import { requireAuth } from "./simpleAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Авторизация
  app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      res.json(user);
    } catch (error) {
      console.error("Ошибка получения пользователя:", error);
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  });

  // Получение шаблонов документов
  app.get("/api/document-templates", async (req, res) => {
    try {
      const templates = await storage.getDocumentTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Ошибка получения шаблонов:", error);
      res.status(500).json({ message: "Ошибка получения шаблонов" });
    }
  });

  // Получение конкретного шаблона
  app.get("/api/document-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getDocumentTemplate(parseInt(id));
      if (!template) {
        return res.status(404).json({ message: "Шаблон не найден" });
      }
      res.json(template);
    } catch (error) {
      console.error("Ошибка получения шаблона:", error);
      res.status(500).json({ message: "Ошибка получения шаблона" });
    }
  });

  // Создание документа (требует авторизации)
  app.post("/api/documents", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      // Проверяем лимиты для бесплатных пользователей
      if (user.subscription === "free" && (user.documentsCreated || 0) >= (user.documentsLimit || 3)) {
        return res.status(403).json({ 
          message: "Достигнут лимит создания документов. Обновитесь до премиум аккаунта." 
        });
      }

      // Валидируем данные формы
      const validatedData = documentFormSchema.parse(req.body);
      
      // Создаем документ
      const document = await storage.createUserDocument({
        userId: userId,
        name: `${getDocumentTypeName(validatedData.type)} - ${validatedData.companyName}`,
        type: validatedData.type,
        formData: validatedData,
        generatedContent: await generateDocumentContent(validatedData.type, validatedData),
        customFields: req.body.customFields || null,
        status: "completed",
      });

      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Неверные данные формы", 
          errors: error.errors 
        });
      }
      console.error("Ошибка создания документа:", error);
      res.status(500).json({ message: "Ошибка создания документа" });
    }
  });

  // Получение документов пользователя
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Ошибка получения документов:", error);
      res.status(500).json({ message: "Ошибка получения документов" });
    }
  });

  // Получение конкретного документа пользователя
  app.get("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const { id } = req.params;
      const document = await storage.getUserDocument(parseInt(id), userId);
      
      if (!document) {
        return res.status(404).json({ message: "Документ не найден" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Ошибка получения документа:", error);
      res.status(500).json({ message: "Ошибка получения документа" });
    }
  });

  // Обновление документа (только для премиум пользователей)
  app.put("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (user.subscription !== "premium") {
        return res.status(403).json({ 
          message: "Редактирование документов доступно только для премиум пользователей" 
        });
      }

      const { id } = req.params;
      const updates = req.body;
      
      const document = await storage.updateUserDocument(parseInt(id), userId, updates);
      res.json(document);
    } catch (error) {
      console.error("Ошибка обновления документа:", error);
      res.status(500).json({ message: "Ошибка обновления документа" });
    }
  });

  // Генерация QR кода (только для премиум)
  app.post("/api/documents/:id/qr", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (user.subscription !== "premium") {
        return res.status(403).json({ 
          message: "Генерация QR кодов доступна только для премиум пользователей" 
        });
      }

      const { id } = req.params;
      const document = await storage.getUserDocument(parseInt(id), userId);
      
      if (!document) {
        return res.status(404).json({ message: "Документ не найден" });
      }

      // Генерируем QR код (простой пример)
      const qrData = `https://yourdomain.com/documents/${id}`;
      const qrCodeSvg = generateQRCodeSVG(qrData);
      
      res.json({ qrCode: qrCodeSvg, url: qrData });
    } catch (error) {
      console.error("Ошибка генерации QR кода:", error);
      res.status(500).json({ message: "Ошибка генерации QR кода" });
    }
  });

  // Получение блог постов
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch (error) {
      console.error("Ошибка получения блог постов:", error);
      res.status(500).json({ message: "Ошибка получения блог постов" });
    }
  });

  // Получение конкретного блог поста
  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPost(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Статья не найдена" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Ошибка получения статьи:", error);
      res.status(500).json({ message: "Ошибка получения статьи" });
    }
  });

  // Получение уведомлений пользователя
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Ошибка получения уведомлений:", error);
      res.status(500).json({ message: "Ошибка получения уведомлений" });
    }
  });

  // Отметка уведомления как прочитанного
  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const { id } = req.params;
      await storage.markNotificationRead(parseInt(id), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Ошибка отметки уведомления:", error);
      res.status(500).json({ message: "Ошибка отметки уведомления" });
    }
  });

  // Админские роуты
  app.get("/api/admin/users", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Ошибка получения пользователей:", error);
      res.status(500).json({ message: "Ошибка получения пользователей" });
    }
  });

  app.get("/api/admin/stats", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Доступ запрещен" });
      }

      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Ошибка получения статистики:", error);
      res.status(500).json({ message: "Ошибка получения статистики" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getDocumentTypeName(type: string): string {
  const types = {
    privacy: "Политика конфиденциальности",
    terms: "Пользовательское соглашение",
    consent: "Согласие на обработку ПД",
    offer: "Публичная оферта",
    cookie: "Политика использования cookies",
    return: "Политика возврата",
  };
  return types[type as keyof typeof types] || type;
}

function generateQRCodeSVG(data: string): string {
  // Простая генерация QR кода в SVG формате
  // В реальном проекте используйте библиотеку типа qrcode
  const size = 200;
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="white"/>
    <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="black">QR: ${data.substring(0, 20)}...</text>
  </svg>`;
}

async function generateDocumentContent(type: string, formData: any): Promise<string> {
  const { companyName, inn, legalAddress, websiteUrl, contactEmail, phone } = formData;
  
  const baseTemplate = `
ДОКУМЕНТ: ${getDocumentTypeName(type).toUpperCase()}

1. ОБЩИЕ ПОЛОЖЕНИЯ

Настоящий документ разработан в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ "О персональных данных" и других нормативных правовых актов Российской Федерации.

2. ИНФОРМАЦИЯ ОБ ОРГАНИЗАЦИИ

Полное наименование: ${companyName}
ИНН: ${inn}
Юридический адрес: ${legalAddress}
Веб-сайт: ${websiteUrl}
Контактный email: ${contactEmail}
${phone ? `Телефон: ${phone}` : ''}

3. ОСНОВНЫЕ ПОЛОЖЕНИЯ

${type === 'privacy' ? `
Настоящая Политика конфиденциальности определяет порядок обработки персональных данных пользователей сайта ${websiteUrl}.

3.1. Персональные данные обрабатываются в соответствии с принципами:
- законности целей и способов обработки персональных данных;
- соответствия целей обработки персональных данных целям, заранее определенным и заявленным при сборе персональных данных;
- соответствия объема и характера обрабатываемых персональных данных, способов обработки персональных данных целям обработки персональных данных.

3.2. Обработка персональных данных осуществляется с согласия субъекта персональных данных на обработку его персональных данных.

3.3. Персональные данные подлежат уничтожению либо обезличиванию по достижении целей обработки или в случае утраты необходимости в достижении этих целей.
` : ''}

${type === 'terms' ? `
Настоящее Пользовательское соглашение регулирует отношения между ${companyName} и пользователями сайта ${websiteUrl}.

3.1. Используя сайт, вы соглашаетесь с условиями настоящего соглашения.

3.2. Сайт предоставляет информационные услуги в соответствии с действующим законодательством Российской Федерации.

3.3. Пользователь обязуется не нарушать работоспособность сайта и не предпринимать действий, направленных на нарушение нормальной работы сайта.
` : ''}

${type === 'consent' ? `
Настоящим я, субъект персональных данных, в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ "О персональных данных" предоставляю ${companyName} свое согласие на обработку персональных данных.

3.1. Согласие предоставляется на обработку следующих персональных данных:
- фамилия, имя, отчество;
- номер телефона;
- адрес электронной почты;
- иные данные, предоставленные субъектом персональных данных.

3.2. Цели обработки персональных данных:
- предоставление услуг;
- информирование о новых продуктах и услугах;
- проведение маркетинговых исследований.
` : ''}

4. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ

Настоящий документ вступает в силу с момента его размещения на сайте ${websiteUrl}.

Все вопросы и предложения направлять по адресу: ${contactEmail}

Дата составления: ${new Date().toLocaleDateString('ru-RU')}
`;

  return baseTemplate;
}