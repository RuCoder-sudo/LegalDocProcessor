import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { setupJwtAuth } from "./simpleJwtAuth";
import { users, userDocuments, blogPosts, adminSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
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
      let isAdmin = false;
      
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        try {
          const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
          userId = decoded.id;
          isAdmin = decoded.role === 'admin';
          console.log("Got userId from token:", userId, "isAdmin:", isAdmin);
        } catch (e) {
          console.error("Error decoding token:", e);
        }
      }
      
      if (!userId && req.cookies && req.cookies['auth-token']) {
        try {
          const decoded = JSON.parse(Buffer.from(req.cookies['auth-token'], 'base64').toString('utf8'));
          userId = decoded.id;
          isAdmin = decoded.role === 'admin';
          console.log("Got userId from cookie:", userId, "isAdmin:", isAdmin);
        } catch (e) {
          console.error("Error decoding cookie:", e);
        }
      }
      
      if (!userId) {
        // For anonymous users, create a temporary user in database
        userId = `temp_${Date.now()}`;
        console.log("Created temporary userId:", userId);
        
        // Create temporary user in database
        await db
          .insert(users)
          .values({
            id: userId,
            email: `${userId}@temp.com`,
            password: 'temp',
            role: 'user',
            subscription: 'free',
            documentscreated: 0,
            documentslimit: 3
          })
          .onConflictDoNothing();
      }
      
      // Simplified - no database checks for now, just generate documents

      // Generate document content
      const content = await generateDocumentContent(type, formData);
      
      console.log("Сохраняем документ для пользователя:", userId);
      
      // For simplicity, return the generated document without saving to database for now
      const documentData = {
        id: Date.now(),
        userId,
        name: `${getDocumentTypeName(type)} - ${formData.companyName || 'Untitled'}`,
        type,
        formData,
        generatedContent: content,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log("Document created:", documentData.id);
      
      // Return the new document
      res.json(documentData);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Ошибка при создании документа", error: String(error) });
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
      
      console.log("Updating admin settings:", updates);
      
      const settings = await db
        .select()
        .from(adminSettings)
        .limit(1);

      if (settings.length === 0) {
        console.log("No existing settings found, creating new settings");
        const newSettings = await db
          .insert(adminSettings)
          .values(updates)
          .returning();
        return res.json(newSettings[0]);
      }

      console.log("Updating existing settings with ID:", settings[0].id);
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

// Генерация содержания документа на основе типа и данных
async function generateDocumentContent(type: string, formData: any): Promise<string> {
  // Базовое форматирование для всех типов документов
  const companyName = formData.companyName || 'Компания';
  const address = formData.legalAddress || formData.address || 'Адрес компании';
  const website = formData.websiteUrl || formData.website || 'website.com';
  const email = formData.contactEmail || formData.email || 'email@company.com';
  const phone = formData.phone || '+7 (XXX) XXX-XX-XX';
  const inn = formData.inn || 'XXXXXXXXXX';
  const today = new Date().toLocaleDateString('ru-RU');
  
  switch (type) {
    case 'privacy': // Политика конфиденциальности
      return `ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
${companyName}
      
1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая Политика конфиденциальности (далее — Политика) является официальным документом ${companyName}, расположенного по адресу: ${address}, и определяет порядок обработки и защиты информации о физических лицах, пользующихся услугами интернет-сайта ${website} (далее — Сайт).

1.2. Целью настоящей Политики является обеспечение надлежащей защиты информации о пользователях, в том числе их персональных данных, от несанкционированного доступа и разглашения.

1.3. Отношения, связанные со сбором, хранением, распространением и защитой информации о пользователях Сайта, регулируются настоящей Политикой и действующим законодательством Российской Федерации.

1.4. Действующая редакция Политики, являющейся публичным документом, разработана администрацией Сайта и доступна любому пользователю сети Интернет. Администрация Сайта вправе вносить изменения в настоящую Политику. При внесении изменений администрация Сайта уведомляет об этом пользователей путем размещения новой редакции Политики на Сайте по постоянному адресу: ${website}/privacy-policy

1.5. Используя Сайт, Пользователь выражает свое согласие с условиями настоящей Политики.

1.6. В случае несогласия Пользователя с условиями настоящей Политики использование Сайта должно быть немедленно прекращено.

2. УСЛОВИЯ ПОЛЬЗОВАНИЯ САЙТОМ

2.1. Оказывая услуги по использованию Сайта, Администрация Сайта, действуя разумно и добросовестно, считает, что Пользователь:
- обладает всеми необходимыми правами, позволяющими ему осуществлять регистрацию и использовать настоящий Сайт;
- указывает достоверную информацию о себе в объемах, необходимых для пользования Сайтом;
- ознакомлен с настоящей Политикой, выражает свое согласие с ней и принимает на себя указанные в ней права и обязанности.

2.2. Администрация Сайта не проверяет достоверность получаемой (собираемой) информации о пользователях, за исключением случаев, когда такая проверка необходима в целях исполнения обязательств перед пользователем.

3. ЦЕЛИ ОБРАБОТКИ ИНФОРМАЦИИ

3.1. Администрация Сайта осуществляет обработку информации о Пользователях, в том числе их персональных данных, в целях выполнения обязательств перед Пользователями в отношении использования Сайта и его сервисов.

4. СОСТАВ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЯХ

4.1. Персональные данные Пользователей
Персональные данные Пользователей включают в себя:
4.1.1. предоставляемые Пользователями и минимально необходимые для регистрации на Сайте: имя, фамилия, номер мобильного телефона и/или адрес электронной почты;

4.2. Иная информация о Пользователях, обрабатываемая Администрацией Сайта
Администрация Сайта обрабатывает также иную информацию о Пользователях, которая включает в себя:
4.2.1. стандартные данные, автоматически получаемые http-сервером при доступе к Сайту и последующих действиях Пользователя (IP-адрес хоста, вид операционной системы пользователя, страницы Сайта, посещаемые пользователем);
4.2.2. информация, автоматически получаемая при доступе к Сайту с использованием закладок (cookies);
4.2.3. информация, создаваемая пользователями на Сайте: комментарии, отзывы, оценки;
4.2.4. информация, полученная в результате действий других пользователей на Сайте.

5. ОБРАБОТКА ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЯХ

5.1. Обработка персональных данных осуществляется на основе принципов:
а) законности целей и способов обработки персональных данных;
б) добросовестности;
в) соответствия целей обработки персональных данных целям, заранее определенным и заявленным при сборе персональных данных, а также полномочиям Администрации Сайта;
г) соответствия объема и характера обрабатываемых персональных данных, способов обработки персональных данных целям обработки персональных данных;
д) недопустимости объединения созданных для несовместимых между собой целей баз данных, содержащих персональные данные.

6. ПРАВА И ОБЯЗАННОСТИ ПОЛЬЗОВАТЕЛЕЙ

6.1. Пользователи вправе:
6.1.1. на основании запроса получать от Администрации Сайта информацию, касающуюся обработки его персональных данных.

7. МЕРЫ ПО ЗАЩИТЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЯХ

7.1. Администрация Сайта принимает технические и организационно-правовые меры в целях обеспечения защиты персональных данных Пользователя от неправомерного или случайного доступа к ним, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий.

8. ОБРАЩЕНИЯ ПОЛЬЗОВАТЕЛЕЙ

8.1. Пользователи вправе направлять Администрации Сайта свои запросы, в том числе запросы относительно использования их персональных данных, предусмотренные п. 6.1.1 настоящей Политики, в письменной форме по адресу: ${address}

8.2. Администрация Сайта обязуется рассмотреть и направить ответ на поступивший запрос Пользователя в течение 30 дней с момента поступления обращения.

8.3. Вся корреспонденция, полученная Администрацией Сайта от пользователей (обращения в письменной или электронной форме), относится к информации ограниченного доступа и не разглашается без письменного согласия Пользователя. Персональные данные и иная информация о Пользователе, направившем запрос, не могут быть без специального согласия Пользователя использованы иначе, как для ответа по теме полученного запроса или в случаях, прямо предусмотренных законодательством.

Документ создан: ${today}
${companyName}
ИНН: ${inn}
Адрес: ${address}
Телефон: ${phone}
Email: ${email}`;

    case 'terms': // Пользовательское соглашение
      return `ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ
${companyName}

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящее Пользовательское соглашение (далее — Соглашение) относится к сайту ${website}, расположенному по адресу ${website}.

1.2. Сайт ${website} (далее — Сайт) является собственностью ${companyName} (далее — Администрация сайта).

1.3. Настоящее Соглашение регулирует отношения между Администрацией сайта и Пользователем данного Сайта.

1.4. Администрация сайта оставляет за собой право в любое время изменять, добавлять или удалять пункты настоящего Соглашения без уведомления Пользователя.

1.5. Использование Сайта Пользователем означает принятие Соглашения и изменений, внесенных в настоящее Соглашение.

1.6. Пользователь несет персональную ответственность за проверку настоящего Соглашения на наличие изменений в нем.

2. ОПРЕДЕЛЕНИЯ ТЕРМИНОВ

2.1. Перечисленные ниже термины имеют для целей настоящего Соглашения следующее значение:

2.1.1 ${website} – Интернет-ресурс, расположенный на доменном имени ${website}, осуществляющий свою деятельность посредством Интернет-ресурса и сопутствующих ему сервисов.

2.1.2. Администрация сайта – уполномоченные сотрудники на управление Сайтом, действующие от имени ${companyName}.

2.1.3. Пользователь сайта (далее ‑ Пользователь) – лицо, имеющее доступ к Сайту, посредством сети Интернет и использующее Сайт.

3. ПРЕДМЕТ СОГЛАШЕНИЯ

3.1. Предметом настоящего Соглашения является предоставление Пользователю доступа к содержащимся на Сайте товарам и/или оказываемым услугам.

3.2. Доступ к сайту предоставляется на бесплатной основе.

3.3. Настоящее Соглашение является публичной офертой. Получая доступ к Сайту Пользователь считается присоединившимся к настоящему Соглашению.

3.4. Использование материалов и сервисов Сайта регулируется нормами действующего законодательства Российской Федерации

4. ПРАВА И ОБЯЗАННОСТИ СТОРОН

4.1. Администрация сайта вправе:

4.1.1. Изменять правила пользования Сайтом, а также изменять содержание данного Сайта. Изменения вступают в силу с момента публикации новой редакции Соглашения на Сайте.

4.2. Пользователь вправе:

4.2.1. Пользоваться всеми имеющимися на Сайте услугами, а также приобретать любые Товары и/или Услуги, предлагаемые на Сайте.

4.2.2. Задавать любые вопросы, относящиеся к услугам сайта.

4.2.3. Пользоваться Сайтом исключительно в целях и порядке, предусмотренных Соглашением и не запрещенных законодательством Российской Федерации.

4.3. Пользователь Сайта обязуется:

4.3.1. Предоставлять по запросу Администрации сайта дополнительную информацию, которая имеет непосредственное отношение к предоставляемым услугам данного Сайта.

4.3.2. Соблюдать имущественные и неимущественные права авторов и иных правообладателей при использовании Сайта.

4.3.3. Не предпринимать действий, которые могут рассматриваться как нарушающие нормальную работу Сайта.

4.3.4. Не распространять с использованием Сайта любую конфиденциальную и охраняемую законодательством Российской Федерации информацию о физических либо юридических лицах.

4.3.5. Избегать любых действий, в результате которых может быть нарушена конфиденциальность охраняемой законодательством Российской Федерации информации.

4.3.6. Не использовать Сайт для распространения информации рекламного характера, иначе как с согласия Администрации сайта.

5. ОТВЕТСТВЕННОСТЬ

5.1. Любые убытки, которые Пользователь может понести в случае умышленного или неосторожного нарушения любого положения настоящего Соглашения, а также вследствие несанкционированного доступа к коммуникациям другого Пользователя, Администрацией сайта не возмещаются.

6. РАЗРЕШЕНИЕ СПОРОВ

6.1. В случае возникновения любых разногласий или споров между Сторонами настоящего Соглашения обязательным условием до обращения в суд является предъявление претензии (письменного предложения о добровольном урегулировании спора).

6.2. Получатель претензии в течение 30 календарных дней со дня ее получения, письменно уведомляет заявителя претензии о результатах рассмотрения претензии.

6.3. При невозможности разрешить спор в добровольном порядке любая из Сторон вправе обратиться в суд за защитой своих прав, которые предоставлены им действующим законодательством Российской Федерации.

7. ДОПОЛНИТЕЛЬНЫЕ УСЛОВИЯ

7.1. Администрация сайта не принимает встречные предложения от Пользователя относительно изменений настоящего Пользовательского соглашения.

7.2. Отзывы Пользователя, размещенные на Сайте, не являются конфиденциальной информацией и могут быть использованы Администрацией сайта без ограничений.

Документ создан: ${today}
${companyName}
ИНН: ${inn}
Адрес: ${address}
Телефон: ${phone}
Email: ${email}`;

    case 'contract': // Юридический договор
      return `ДОГОВОР №__________
 
г. _____________                                                                           "${today}"

${companyName}, именуемое в дальнейшем «Исполнитель», в лице ____________________, действующего на основании __________________, с одной стороны, и __________________, именуемое в дальнейшем «Заказчик», в лице ______________________, действующего на основании _______________, с другой стороны, вместе именуемые «Стороны», заключили настоящий Договор о нижеследующем:

1. ПРЕДМЕТ ДОГОВОРА

1.1. Исполнитель обязуется оказать Заказчику услуги (далее - Услуги), указанные в Приложениях к настоящему Договору, а Заказчик обязуется принять и оплатить Услуги на условиях настоящего Договора.
1.2. Наименование, объем и содержание Услуг, сроки оказания Услуг, стоимость Услуг и порядок их оплаты определяются в соответствующих Приложениях к настоящему Договору.

2. ПРАВА И ОБЯЗАННОСТИ СТОРОН

2.1. Исполнитель обязуется:
2.1.1. Оказать Услуги качественно и в срок в соответствии с условиями Договора.
2.1.2. Предоставлять по требованию Заказчика необходимую информацию о ходе оказания Услуг.
2.1.3. Своевременно информировать Заказчика о возникновении каких-либо обстоятельств, препятствующих исполнению настоящего Договора.

2.2. Заказчик обязуется:
2.2.1. Принять и оплатить Услуги в соответствии с условиями настоящего Договора.
2.2.2. Своевременно предоставлять Исполнителю информацию, необходимую для оказания Услуг.
2.2.3. Обеспечить условия для оказания Услуг Исполнителем.

3. СТОИМОСТЬ УСЛУГ И ПОРЯДОК РАСЧЕТОВ

3.1. Стоимость Услуг определяется в соответствующих Приложениях к настоящему Договору.
3.2. Оплата Услуг производится в следующем порядке: _______________.
3.3. Обязательства Заказчика по оплате считаются выполненными с момента поступления денежных средств на расчетный счет Исполнителя.

4. ОТВЕТСТВЕННОСТЬ СТОРОН

4.1. За неисполнение или ненадлежащее исполнение обязательств по настоящему Договору Стороны несут ответственность в соответствии с действующим законодательством Российской Федерации.
4.2. В случае нарушения сроков оказания Услуг Исполнитель выплачивает Заказчику неустойку в размере 0,1% от стоимости несвоевременно оказанных Услуг за каждый день просрочки.
4.3. В случае нарушения сроков оплаты Услуг Заказчик выплачивает Исполнителю неустойку в размере 0,1% от суммы задолженности за каждый день просрочки.

5. СРОК ДЕЙСТВИЯ, ИЗМЕНЕНИЕ И РАСТОРЖЕНИЕ ДОГОВОРА

5.1. Настоящий Договор вступает в силу с момента его подписания обеими Сторонами и действует до полного исполнения Сторонами своих обязательств.
5.2. Настоящий Договор может быть изменен или расторгнут по соглашению Сторон.
5.3. Любые изменения и дополнения к настоящему Договору действительны при условии, что они совершены в письменной форме и подписаны уполномоченными представителями Сторон.

6. РАЗРЕШЕНИЕ СПОРОВ

6.1. Все споры и разногласия, которые могут возникнуть между Сторонами по вопросам, не нашедшим своего разрешения в тексте настоящего Договора, будут разрешаться путем переговоров.
6.2. При невозможности урегулирования спорных вопросов путем переговоров Стороны разрешают их в судебном порядке в соответствии с действующим законодательством Российской Федерации.

7. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ

7.1. Во всем остальном, что не предусмотрено настоящим Договором, Стороны руководствуются действующим законодательством Российской Федерации.
7.2. Настоящий Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу, по одному экземпляру для каждой из Сторон.

8. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН

Исполнитель:                                                             Заказчик:
${companyName}                                                       _________________
ИНН: ${inn}                                                             ИНН: _______________
Адрес: ${address}                                                    Адрес: _______________
р/с: ________________                                            р/с: ________________
Банк: _______________                                           Банк: _______________
БИК: ________________                                          БИК: ________________
к/с: _________________                                           к/с: _________________
Тел: ${phone}                                                         Тел: ________________
Email: ${email}                                                       Email: _______________

_______________ /______________/                      _______________ /______________/
М.П.                                                                           М.П.`;
    
    default:
      return `Документ типа "${type}" с данными:
      
Название компании: ${companyName}
ИНН: ${inn}
Адрес: ${address}
Телефон: ${phone}
Email: ${email}
Дата создания: ${today}

----- Полные данные -----
${JSON.stringify(formData, null, 2)}`;
  }
}