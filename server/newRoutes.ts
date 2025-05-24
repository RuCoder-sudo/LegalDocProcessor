import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSimpleAuth, requireAuth } from "./simpleAuth";
import { users, userDocuments, blogPosts, adminSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple Auth middleware
  setupSimpleAuth(app);

  // Регистрация пользователя
  app.post('/api/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email и пароль обязательны" });
      }

      // Проверяем, существует ли пользователь
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Пользователь с таким email уже существует" });
      }

      // Создаем нового пользователя
      const result = await db
        .insert(users)
        .values({
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          role: 'user',
          subscription: 'free',
          documentsCreated: 0,
          documentsLimit: 3
        })
        .returning();

      const newUser = result[0];

      // Устанавливаем сессию
      (req as any).session.userId = newUser.id;
      
      res.json({ 
        id: newUser.id, 
        email: newUser.email, 
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        subscription: newUser.subscription
      });
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      res.status(500).json({ message: "Ошибка сервера при регистрации" });
    }
  });

  // Вход пользователя
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email и пароль обязательны" });
      }

      // Находим пользователя
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return res.status(401).json({ message: "Неверный email или пароль" });
      }

      // Устанавливаем сессию
      (req as any).session.userId = user.id;
      
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscription: user.subscription
      });
    } catch (error) {
      console.error("Ошибка входа:", error);
      res.status(500).json({ message: "Ошибка сервера при входе" });
    }
  });

  // Выход пользователя
  app.post('/api/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при выходе" });
      }
      res.json({ message: "Успешный выход" });
    });
  });

  // Получение данных текущего пользователя
  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscription: user.subscription,
        documentsCreated: user.documentsCreated,
        documentsLimit: user.documentsLimit
      });
    } catch (error) {
      console.error("Ошибка получения пользователя:", error);
      res.status(500).json({ message: "Ошибка сервера" });
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

  // Create document - Теперь работает для всех пользователей
  app.post('/api/documents', async (req: any, res) => {
    try {
      console.log('Full request body:', req.body);
      
      const { type, ...formData } = req.body;
      
      // Получаем пользователя из сессии, если есть, иначе создаем временного пользователя
      let userId = (req as any).session?.userId;
      
      if (!userId) {
        // Создаем временного анонимного пользователя для демонстрации
        const tempUserResult = await db
          .insert(users)
          .values({
            email: `temp_${Date.now()}@demo.com`,
            firstName: 'Анонимный',
            lastName: 'Пользователь',
            role: 'user',
            subscription: 'free',
            documentsCreated: 0,
            documentsLimit: 10
          })
          .returning();
        
        userId = tempUserResult[0].id;
      } else {
        // Проверяем, существует ли пользователь в базе
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (existingUser.length === 0) {
          // Если пользователь не найден, создаем нового
          const newUserResult = await db
            .insert(users)
            .values({
              id: userId,
              email: `user_${userId}@demo.com`,
              firstName: 'Пользователь',
              lastName: 'Системы',
              role: 'user',
              subscription: 'free',
              documentsCreated: 0,
              documentsLimit: 10
            })
            .returning();
          
          userId = newUserResult[0].id;
        }
      }

      console.log('Extracted type:', type);
      console.log('Extracted formData:', formData);
      console.log('Using userId:', userId);

      // Check document limit
      const userDocCount = await db
        .select()
        .from(userDocuments)
        .where(eq(userDocuments.userId, userId));

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      // Устанавливаем лимиты в зависимости от подписки
      let limit;
      if (user?.role === 'admin') {
        limit = -1; // Безлимитно для админов
      } else if (user?.subscription === 'premium') {
        limit = 100; // 100 документов для премиум
      } else {
        limit = 3; // 3 документа для бесплатных пользователей
      }

      if (userDocCount.length >= limit) {
        return res.status(403).json({ 
          message: `Достигнут лимит документов (${limit}). Обновитесь до премиум для создания большего количества документов.` 
        });
      }

      // Generate document content with extracted form data
      const content = await generateDocumentContent(type, formData);

      const result = await db
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

      const newDocument = result[0];

      // Обновляем счетчик документов пользователя
      await db
        .update(users)
        .set({ 
          documentsCreated: (user?.documentsCreated || 0) + 1 
        })
        .where(eq(users.id, userId));

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
  const ogrn = formData?.ogrn || 'Не указан';
  const legalAddress = formData?.legalAddress || formData?.legal_address || 'Не указан';
  const websiteUrl = formData?.websiteUrl || formData?.website_url || 'example.com';
  const contactEmail = formData?.contactEmail || formData?.contact_email || 'contact@example.com';
  const phone = formData?.phone || 'Не указан';
  const registrar = formData?.registrar || 'Не указан';
  const hostingProvider = formData?.hostingProvider || formData?.hosting_provider || 'Не указан';
  const industry = formData?.industry || 'Не указана';
  
  console.log('Extracted values:', { companyName, inn, legalAddress, websiteUrl, contactEmail });
  
  const currentDate = new Date().toLocaleDateString('ru-RU');
  
  switch (type) {
    case 'privacy':
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

5.2. Хостинг-провайдер: ${hostingProvider}
5.3. Регистратор домена: ${registrar}

6. КОНТАКТНАЯ ИНФОРМАЦИЯ

По вопросам обработки персональных данных обращайтесь:
Email: ${contactEmail}
${phone !== 'Не указан' ? `Телефон: ${phone}` : ''}
Адрес: ${legalAddress}

Дата вступления в силу: ${currentDate}`;

    case 'terms':
      return `ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между ${companyName} (ИНН ${inn}) и пользователями сайта ${websiteUrl}.

1.2. Используя сайт, вы соглашаетесь с условиями настоящего соглашения в полном объеме.

2. ПРЕДМЕТ СОГЛАШЕНИЯ

2.1. Сайт предоставляет пользователям доступ к информационным ресурсам и услугам в сфере ${industry}.

2.2. Все существующие на данный момент службы сайта, а также любое их развитие и/или добавление новых является предметом настоящего Соглашения.

3. ПРАВА И ОБЯЗАННОСТИ СТОРОН

3.1. Администрация сайта обязуется:
- Предоставлять информацию в соответствии с заявленными целями
- Обеспечивать конфиденциальность персональных данных

3.2. Пользователь обязуется:
- Не нарушать работоспособность сайта
- Соблюдать законодательство РФ

4. ОГРАНИЧЕНИЕ ОТВЕТСТВЕННОСТИ

4.1. Администрация сайта не несет ответственности за убытки, возникшие в результате использования или невозможности использования сайта.

5. КОНТАКТНАЯ ИНФОРМАЦИЯ

${companyName}
ИНН: ${inn}
${ogrn !== 'Не указан' ? `ОГРН: ${ogrn}` : ''}
Адрес: ${legalAddress}
Email: ${contactEmail}
${phone !== 'Не указан' ? `Телефон: ${phone}` : ''}

Дата вступления в силу: ${currentDate}`;

    case 'consent':
      return `СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ

Я, субъект персональных данных, в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ "О персональных данных" предоставляю ${companyName} (ИНН ${inn}) согласие на обработку персональных данных.

1. СОСТАВ ПЕРСОНАЛЬНЫХ ДАННЫХ

Согласие предоставляется на обработку следующих персональных данных:
- фамилия, имя, отчество
- номер телефона
- адрес электронной почты
- адрес регистрации и фактического проживания
- иные данные, предоставленные субъектом

2. ЦЕЛИ ОБРАБОТКИ

Цели обработки персональных данных:
- предоставление услуг в сфере ${industry}
- информирование о новых продуктах и услугах
- проведение маркетинговых исследований
- исполнение договорных обязательств

3. СПОСОБЫ ОБРАБОТКИ

Обработка персональных данных осуществляется с использованием средств автоматизации и без использования таких средств.

4. СРОК ДЕЙСТВИЯ СОГЛАСИЯ

Настоящее согласие действует до его отзыва субъектом персональных данных.

5. КОНТАКТНАЯ ИНФОРМАЦИЯ

${companyName}
Email: ${contactEmail}
Адрес: ${legalAddress}

Дата: ${currentDate}`;

    case 'offer':
      return `ПУБЛИЧНАЯ ОФЕРТА

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая публичная оферта (далее — Оферта) является официальным предложением ${companyName} (ИНН ${inn}) о заключении договора купли-продажи товаров/услуг.

1.2. Оферта адресована физическим и юридическим лицам и действует с момента размещения на сайте ${websiteUrl}.

2. ПРЕДМЕТ ДОГОВОРА

2.1. Продавец обязуется передать в собственность Покупателя товар/услугу, а Покупатель обязуется принять и оплатить товар/услугу.

2.2. Характеристики товаров/услуг указаны на сайте ${websiteUrl}.

3. ПОРЯДОК ЗАКЛЮЧЕНИЯ ДОГОВОРА

3.1. Договор считается заключенным с момента получения Продавцом заявки Покупателя.

3.2. Заявка оформляется через сайт ${websiteUrl} или по контактным данным.

4. ЦЕНА И ПОРЯДОК ОПЛАТЫ

4.1. Цены на товары/услуги указаны на сайте и действительны на момент оформления заказа.

4.2. Оплата производится способами, указанными на сайте.

5. ДОСТАВКА

5.1. Доставка осуществляется по территории, указанной на сайте.

5.2. Сроки доставки согласовываются дополнительно.

6. КОНТАКТНАЯ ИНФОРМАЦИЯ

${companyName}
ИНН: ${inn}
${ogrn !== 'Не указан' ? `ОГРН: ${ogrn}` : ''}
Адрес: ${legalAddress}
Email: ${contactEmail}
${phone !== 'Не указан' ? `Телефон: ${phone}` : ''}

Дата размещения: ${currentDate}`;

    case 'cookie':
      return `ПОЛИТИКА ИСПОЛЬЗОВАНИЯ COOKIES

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая Политика использования cookies (далее — Политика) описывает, как ${companyName} (ИНН ${inn}) использует cookies на сайте ${websiteUrl}.

1.2. Продолжая использовать сайт, вы соглашаетесь с использованием cookies.

2. ЧТО ТАКОЕ COOKIES

2.1. Cookies — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении сайта.

2.2. Cookies помогают сайту запомнить информацию о вашем посещении.

3. ТИПЫ ИСПОЛЬЗУЕМЫХ COOKIES

3.1. Функциональные cookies — необходимы для работы сайта
3.2. Аналитические cookies — помогают понять, как посетители используют сайт
3.3. Рекламные cookies — используются для показа персонализированной рекламы

4. УПРАВЛЕНИЕ COOKIES

4.1. Вы можете управлять cookies через настройки браузера.

4.2. Отключение cookies может повлиять на функционирование сайта.

5. КОНТАКТНАЯ ИНФОРМАЦИЯ

По вопросам использования cookies обращайтесь:
Email: ${contactEmail}
Адрес: ${legalAddress}

Дата обновления: ${currentDate}`;

    case 'return':
      return `ПОЛИТИКА ВОЗВРАТА

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая Политика возврата регулирует порядок возврата товаров/услуг, приобретенных у ${companyName} (ИНН ${inn}).

1.2. Политика действует в соответствии с Законом РФ "О защите прав потребителей".

2. УСЛОВИЯ ВОЗВРАТА

2.1. Товар надлежащего качества может быть возвращен в течение 14 дней с момента покупки.

2.2. Товар должен сохранить товарный вид, потребительские свойства, ярлыки и упаковку.

3. ПОРЯДОК ВОЗВРАТА

3.1. Для возврата товара необходимо связаться с нами по контактным данным.

3.2. Возврат денежных средств осуществляется в течение 10 рабочих дней.

4. ИСКЛЮЧЕНИЯ

4.1. Не подлежат возврату:
- Цифровые товары после передачи покупателю
- Товары, изготовленные по индивидуальному заказу

5. КОНТАКТНАЯ ИНФОРМАЦИЯ

${companyName}
ИНН: ${inn}
Адрес: ${legalAddress}
Email: ${contactEmail}
${phone !== 'Не указан' ? `Телефон: ${phone}` : ''}

Дата вступления в силу: ${currentDate}`;

    default:
      return `Документ "${getDocumentTypeName(type)}" для ${companyName}

Настоящий документ создан ${currentDate} для ${companyName} (ИНН: ${inn}).

Контактная информация:
- Email: ${contactEmail}
- Адрес: ${legalAddress}
${phone !== 'Не указан' ? `- Телефон: ${phone}` : ''}`;
  }
}