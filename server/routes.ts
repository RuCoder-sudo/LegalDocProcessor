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

      // Больше нет лимитов, все функции доступны после регистрации

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

  // Обновление документа (доступно всем зарегистрированным пользователям)
  app.put("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      // Удалено ограничение для премиум пользователей

      const { id } = req.params;
      const updates = req.body;
      
      const document = await storage.updateUserDocument(parseInt(id), userId, updates);
      res.json(document);
    } catch (error) {
      console.error("Ошибка обновления документа:", error);
      res.status(500).json({ message: "Ошибка обновления документа" });
    }
  });

  // Генерация QR кода (доступно всем зарегистрированным пользователям)
  app.post("/api/documents/:id/qr", requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      // Удалено ограничение для премиум пользователей

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

  // Page generation endpoint
  app.post("/api/generate-page", async (req, res) => {
    const session = req.session as any;
    const userId = session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    try {
      const { pageType, siteName, companyName, industry, contactEmail, phone, address, specialOffers, targetAudience } = req.body;
      
      const content = generatePageContent(pageType, {
        siteName,
        companyName,
        industry,
        contactEmail,
        phone,
        address,
        specialOffers,
        targetAudience
      });

      res.json({ content });
    } catch (error) {
      console.error("Page generation error:", error);
      res.status(500).json({ message: "Ошибка генерации страницы" });
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
  const { companyName, inn, ogrn, legalAddress, websiteUrl, contactEmail, phone, industry, ownerType, isSmi, userCanPost } = formData;
  
  switch (type) {
    case 'privacy':
      return `ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта ${websiteUrl} (далее - "Сайт").

1.2. Владелец Сайта: ${companyName}
ИНН: ${inn}
${ogrn ? `ОГРН: ${ogrn}` : ''}
Юридический адрес: ${legalAddress}
Контактный email: ${contactEmail}
${phone ? `Телефон: ${phone}` : ''}

1.3. Настоящая Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ "О персональных данных".

2. СОСТАВ ПЕРСОНАЛЬНЫХ ДАННЫХ

2.1. Сайт собирает следующие персональные данные:
- Фамилия, имя, отчество
- Адрес электронной почты
- Номер телефона
- IP-адрес
- Данные о браузере и устройстве
- Файлы cookie

3. ЦЕЛИ ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ

3.1. Персональные данные обрабатываются в следующих целях:
- Предоставление услуг Сайта
- Связь с пользователями
- Улучшение качества услуг
- Соблюдение требований законодательства

4. ПРАВОВЫЕ ОСНОВАНИЯ ОБРАБОТКИ

4.1. Обработка персональных данных осуществляется на основании:
- Согласия субъекта персональных данных
- Необходимости исполнения договора
- Соблюдения правовых обязательств

5. ПРАВА СУБЪЕКТА ПЕРСОНАЛЬНЫХ ДАННЫХ

5.1. Вы имеете право:
- Получать информацию об обработке ваших данных
- Требовать уточнения, блокирования или уничтожения данных
- Отзывать согласие на обработку
- Обращаться в надзорные органы

Дата последнего обновления: ${new Date().toLocaleDateString('ru-RU')}`;

    case 'terms':
      return `ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящее Пользовательское соглашение (далее - "Соглашение") регулирует отношения между ${companyName} и пользователями сайта ${websiteUrl}.

1.2. Информация о владельце сайта:
Наименование: ${companyName}
ИНН: ${inn}
${ogrn ? `ОГРН: ${ogrn}` : ''}
Адрес: ${legalAddress}
Email: ${contactEmail}
${phone ? `Телефон: ${phone}` : ''}

2. ПРЕДМЕТ СОГЛАШЕНИЯ

2.1. Сайт предоставляет пользователям доступ к информационным ресурсам и услугам.

2.2. Все существующие на данный момент сервисы Сайта, а также любое их развитие и/или добавление новых являются предметом настоящего Соглашения.

3. ПРАВА И ОБЯЗАННОСТИ ПОЛЬЗОВАТЕЛЯ

3.1. Пользователь имеет право:
- Использовать сервисы Сайта в соответствии с их назначением
- Получать техническую поддержку
- Требовать соблюдения конфиденциальности

3.2. Пользователь обязуется:
- Соблюдать условия настоящего Соглашения
- Не нарушать работу Сайта
- Не размещать запрещенную информацию
- Уважать права других пользователей

4. ОТВЕТСТВЕННОСТЬ СТОРОН

4.1. Администрация не несет ответственности за перебои в работе Сайта.

4.2. Пользователь несет ответственность за достоверность предоставленной информации.

Дата вступления в силу: ${new Date().toLocaleDateString('ru-RU')}`;

    case 'consent':
      return `СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ

Я, нижеподписавшийся(аяся), в соответствии с требованиями статьи 9 Федерального закона от 27.07.2006 № 152-ФЗ "О персональных данных" подтверждаю свое согласие на обработку ${companyName} (ИНН: ${inn}, адрес: ${legalAddress}) моих персональных данных.

1. ПЕРЕЧЕНЬ ПЕРСОНАЛЬНЫХ ДАННЫХ

Даю согласие на обработку следующих персональных данных:
- Фамилия, имя, отчество
- Дата рождения
- Адрес электронной почты
- Номер контактного телефона
- Почтовый адрес
- Паспортные данные (при необходимости)

2. ЦЕЛИ ОБРАБОТКИ

Персональные данные обрабатываются в целях:
- Предоставления услуг через сайт ${websiteUrl}
- Информирования о новых услугах и предложениях
- Выполнения обязательств по заключенным договорам
- Соблюдения требований законодательства РФ

3. СПОСОБЫ ОБРАБОТКИ

Обработка персональных данных осуществляется с использованием средств автоматизации и без использования таких средств.

4. СРОК ДЕЙСТВИЯ СОГЛАСИЯ

Настоящее согласие действует до его отзыва путем направления письменного уведомления на адрес: ${contactEmail}

Дата предоставления согласия: ${new Date().toLocaleDateString('ru-RU')}`;

    case 'offer':
      return `ПУБЛИЧНАЯ ОФЕРТА

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая публичная оферта (далее - "Оферта") является официальным предложением ${companyName} о заключении договора на оказание услуг.

1.2. Данные исполнителя:
Наименование: ${companyName}
ИНН: ${inn}
${ogrn ? `ОГРН: ${ogrn}` : ''}
Юридический адрес: ${legalAddress}
Сайт: ${websiteUrl}
Email: ${contactEmail}
${phone ? `Телефон: ${phone}` : ''}

2. ПРЕДМЕТ ДОГОВОРА

2.1. Исполнитель оказывает Заказчику услуги в соответствии с условиями настоящей Оферты.

2.2. Перечень и стоимость услуг указаны на сайте ${websiteUrl}.

3. ПОРЯДОК ЗАКАЗА И ОПЛАТЫ

3.1. Заказ услуг осуществляется через сайт или по контактным данным.

3.2. Оплата производится в соответствии с выбранным способом оплаты.

3.3. Услуга считается оказанной после выполнения всех обязательств Исполнителя.

4. ПРАВА И ОБЯЗАННОСТИ СТОРОН

4.1. Исполнитель обязуется качественно оказать услуги в установленные сроки.

4.2. Заказчик обязуется своевременно оплатить услуги и предоставить необходимую информацию.

5. ВОЗВРАТ И ОБМЕН

5.1. Возврат денежных средств осуществляется в соответствии с законодательством РФ.

Дата публикации: ${new Date().toLocaleDateString('ru-RU')}`;

    case 'cookie':
      return `ПОЛИТИКА ИСПОЛЬЗОВАНИЯ ФАЙЛОВ COOKIE

1. ЧТО ТАКОЕ ФАЙЛЫ COOKIE

1.1. Файлы cookie - это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении сайта ${websiteUrl}.

1.2. Владелец сайта: ${companyName}
ИНН: ${inn}
Адрес: ${legalAddress}
Контакты: ${contactEmail}

2. ТИПЫ ИСПОЛЬЗУЕМЫХ COOKIE

2.1. Обязательные cookie - необходимы для функционирования сайта
2.2. Аналитические cookie - помогают понять, как пользователи взаимодействуют с сайтом
2.3. Функциональные cookie - запоминают ваши предпочтения
2.4. Рекламные cookie - используются для показа релевантной рекламы

3. ЦЕЛИ ИСПОЛЬЗОВАНИЯ

3.1. Cookie используются для:
- Обеспечения работы сайта
- Анализа посещаемости
- Персонализации контента
- Улучшения пользовательского опыта

4. УПРАВЛЕНИЕ COOKIE

4.1. Вы можете управлять cookie через настройки браузера.
4.2. Отключение cookie может повлиять на функциональность сайта.

5. ТРЕТЬИ СТОРОНЫ

5.1. Мы можем использовать сервисы третьих сторон, которые также устанавливают cookie.

Дата обновления: ${new Date().toLocaleDateString('ru-RU')}`;

    case 'return':
      return `ПОЛИТИКА ВОЗВРАТА

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая Политика возврата определяет условия возврата товаров/услуг, приобретенных у ${companyName}.

1.2. Контактная информация:
Наименование: ${companyName}
ИНН: ${inn}
Адрес: ${legalAddress}
Сайт: ${websiteUrl}
Email: ${contactEmail}
${phone ? `Телефон: ${phone}` : ''}

2. УСЛОВИЯ ВОЗВРАТА

2.1. Возврат товаров/услуг осуществляется в соответствии с Законом РФ "О защите прав потребителей".

2.2. Срок возврата составляет 14 дней с момента получения товара или оказания услуги.

3. ПОРЯДОК ВОЗВРАТА

3.1. Для инициации возврата обратитесь по адресу: ${contactEmail}

3.2. Укажите:
- Номер заказа
- Причину возврата
- Контактные данные

3.3. Возврат денежных средств осуществляется в течение 10 рабочих дней.

4. ИСКЛЮЧЕНИЯ

4.1. Возврату не подлежат:
- Цифровые товары после скачивания
- Персонализированные услуги
- Товары индивидуального изготовления

5. СПОСОБЫ ВОЗВРАТА

5.1. Возврат осуществляется тем же способом, которым была произведена оплата.

Дата вступления в силу: ${new Date().toLocaleDateString('ru-RU')}`;

    case 'charter':
      return `УСТАВ САЙТА ${websiteUrl.toUpperCase()}

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящий Устав определяет правила поведения и использования сайта ${websiteUrl}.

1.2. Владелец сайта:
${ownerType === 'individual' ? 'Физическое лицо' : 'Юридическое лицо'}: ${companyName}
ИНН: ${inn}
${ogrn ? `ОГРН: ${ogrn}` : ''}
Адрес: ${legalAddress}
${isSmi ? 'Сайт зарегистрирован как СМИ' : 'Сайт не является СМИ'}

2. ЦЕЛИ И ЗАДАЧИ САЙТА

2.1. Сайт создан для ${industry === 'automotive' ? 'предоставления услуг в автомобильной сфере' : 'информационных целей'}.

2.2. ${userCanPost ? 'Пользователи могут размещать информацию на сайте' : 'Размещение информации пользователями не предусмотрено'}.

3. ПРАВА ПОЛЬЗОВАТЕЛЕЙ

3.1. Пользователи имеют право:
- Получать информацию с сайта
- Использовать функционал сайта
- Обращаться в службу поддержки
- Требовать соблюдения конфиденциальности

4. ОБЯЗАННОСТИ ПОЛЬЗОВАТЕЛЕЙ

4.1. Пользователи обязуются:
- Соблюдать законодательство РФ
- Не нарушать права других пользователей
- Не размещать запрещенную информацию
- Уважать интеллектуальную собственность

5. ПРАВА АДМИНИСТРАЦИИ

5.1. Администрация имеет право:
- Модерировать контент
- Блокировать нарушителей
- Изменять функционал сайта
- Устанавливать правила использования

6. ОТВЕТСТВЕННОСТЬ

6.1. Пользователи несут ответственность за размещаемый контент.
6.2. Администрация не несет ответственности за действия пользователей.

7. ИЗМЕНЕНИЕ УСТАВА

7.1. Устав может быть изменен администрацией в одностороннем порядке.
7.2. Уведомление об изменениях размещается на сайте.

Дата принятия устава: ${new Date().toLocaleDateString('ru-RU')}
Контакты для связи: ${contactEmail}`;

    default:
      return `ЮРИДИЧЕСКИЙ ДОКУМЕНТ

Документ типа "${type}" находится в разработке.
Обратитесь в службу поддержки: ${contactEmail}`;
  }
}

function generatePageContent(pageType: string, data: any): string {
  const { siteName, companyName, industry, contactEmail, phone, address, specialOffers, targetAudience } = data;
  
  switch (pageType) {
    case 'faq':
      return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Часто задаваемые вопросы - ${siteName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f4f4f4; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .faq-item { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .question { background: #f8f9fa; padding: 15px; cursor: pointer; font-weight: bold; }
        .answer { padding: 15px; display: none; }
        .contact-info { background: #e8f4fd; padding: 20px; border-radius: 5px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Часто задаваемые вопросы</h1>
        <p><strong>${companyName}</strong> - ${industry}</p>
        
        <div class="faq-item">
            <div class="question" onclick="toggleAnswer(this)">Как связаться с поддержкой?</div>
            <div class="answer">Вы можете связаться с нами по email: ${contactEmail}${phone ? ` или по телефону: ${phone}` : ''}</div>
        </div>
        
        <div class="faq-item">
            <div class="question" onclick="toggleAnswer(this)">Какие услуги вы предоставляете?</div>
            <div class="answer">Мы специализируемся в сфере ${industry} и предоставляем качественные услуги для ${targetAudience || 'наших клиентов'}.</div>
        </div>
        
        <div class="faq-item">
            <div class="question" onclick="toggleAnswer(this)">Где вы находитесь?</div>
            <div class="answer">${address || 'Информация об адресе доступна по запросу через контактную форму.'}</div>
        </div>
        
        <div class="faq-item">
            <div class="question" onclick="toggleAnswer(this)">Как долго вы работаете на рынке?</div>
            <div class="answer">Наша компания имеет многолетний опыт работы в сфере ${industry} и постоянно развивается.</div>
        </div>
        
        <div class="contact-info">
            <h3>Контактная информация</h3>
            <p><strong>Email:</strong> ${contactEmail}</p>
            ${phone ? `<p><strong>Телефон:</strong> ${phone}</p>` : ''}
            ${address ? `<p><strong>Адрес:</strong> ${address}</p>` : ''}
        </div>
    </div>
    
    <script>
        function toggleAnswer(element) {
            const answer = element.nextElementSibling;
            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
        }
    </script>
</body>
</html>`;

    case 'offers':
      return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Специальные предложения - ${siteName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; font-size: 2.5em; }
        .offer-card { background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center; }
        .price { font-size: 3em; font-weight: bold; margin: 20px 0; }
        .features { text-align: left; margin: 20px 0; }
        .cta-button { background: #ff6b6b; color: white; padding: 15px 30px; border: none; border-radius: 25px; font-size: 1.2em; cursor: pointer; }
        .contact-section { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Специальные предложения</h1>
        <p style="text-align: center; font-size: 1.2em;"><strong>${companyName}</strong> - лучшие предложения в сфере ${industry}</p>
        
        <div class="offer-card">
            <h2>Ограниченное предложение!</h2>
            <div class="price">-50%</div>
            <p>${specialOffers || 'Специальная скидка на все наши услуги!'}</p>
            <button class="cta-button">Получить предложение</button>
        </div>
        
        <div class="offer-card" style="background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%);">
            <h2>Для новых клиентов</h2>
            <div class="features">
                <p>✅ Бесплатная консультация</p>
                <p>✅ Индивидуальный подход</p>
                <p>✅ Качественный сервис</p>
                <p>✅ Поддержка 24/7</p>
            </div>
            <button class="cta-button">Стать клиентом</button>
        </div>
        
        <div class="contact-section">
            <h3>Как воспользоваться предложением?</h3>
            <p>Свяжитесь с нами любым удобным способом:</p>
            <p><strong>📧 Email:</strong> ${contactEmail}</p>
            ${phone ? `<p><strong>📞 Телефон:</strong> ${phone}</p>` : ''}
            ${address ? `<p><strong>📍 Адрес:</strong> ${address}</p>` : ''}
            <p><em>*Предложение ограничено по времени</em></p>
        </div>
    </div>
</body>
</html>`;

    case 'support':
      return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Техническая поддержка - ${siteName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f1f3f4; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #1a73e8; text-align: center; margin-bottom: 30px; }
        .support-option { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #1a73e8; }
        .urgent { border-left-color: #ea4335; background: #fce8e6; }
        .contact-form { background: #e8f0fe; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .online { background: #34a853; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛠️ Техническая поддержка</h1>
        <p style="text-align: center;"><strong>${companyName}</strong> - мы всегда готовы помочь!</p>
        
        <div class="support-option urgent">
            <h3>🚨 Экстренная поддержка</h3>
            <p>Для критических проблем, требующих немедленного решения</p>
            <p><strong>Время ответа:</strong> до 30 минут</p>
            ${phone ? `<p><strong>Телефон:</strong> ${phone}</p>` : ''}
        </div>
        
        <div class="support-option">
            <h3>📧 Email поддержка</h3>
            <p><span class="status-indicator online"></span>Онлайн</p>
            <p><strong>Email:</strong> ${contactEmail}</p>
            <p><strong>Время ответа:</strong> до 2 часов в рабочее время</p>
        </div>
        
        <div class="support-option">
            <h3>📋 База знаний</h3>
            <p>Популярные решения и инструкции:</p>
            <ul>
                <li>Как настроить ${industry.toLowerCase()}</li>
                <li>Часто задаваемые вопросы</li>
                <li>Руководство пользователя</li>
                <li>Устранение неполадок</li>
            </ul>
        </div>
        
        <div class="contact-form">
            <h3>Отправить запрос в поддержку</h3>
            <p>Опишите вашу проблему, и мы свяжемся с вами в ближайшее время:</p>
            <p><strong>Email для обращений:</strong> ${contactEmail}</p>
            ${address ? `<p><strong>Офис:</strong> ${address}</p>` : ''}
            <p><em>Рабочие часы: Пн-Пт 9:00-18:00 МСК</em></p>
        </div>
    </div>
</body>
</html>`;

    case 'about':
      return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>О компании - ${siteName}</title>
    <style>
        body { font-family: 'Georgia', serif; line-height: 1.8; margin: 0; padding: 20px; background: #fafafa; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 40px; font-size: 2.5em; }
        .company-info { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin: 30px 0; }
        .values { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .value-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .team-section { background: #e8f4fd; padding: 30px; border-radius: 10px; margin: 30px 0; }
        .contact-footer { text-align: center; background: #34495e; color: white; padding: 20px; border-radius: 10px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>О компании ${companyName}</h1>
        
        <div class="company-info">
            <h2>Кто мы</h2>
            <p>Мы - команда профессионалов в сфере ${industry}, которая стремится предоставлять высококачественные услуги для ${targetAudience || 'наших клиентов'}. Наша миссия - делать ${industry.toLowerCase()} доступным и понятным для каждого.</p>
        </div>
        
        <div class="values">
            <div class="value-card">
                <h3>🎯 Качество</h3>
                <p>Мы никогда не идем на компромиссы в вопросах качества наших услуг</p>
            </div>
            <div class="value-card">
                <h3>⚡ Скорость</h3>
                <p>Быстрое реагирование и оперативное решение задач клиентов</p>
            </div>
            <div class="value-card">
                <h3>🤝 Надежность</h3>
                <p>Мы всегда выполняем взятые на себя обязательства</p>
            </div>
        </div>
        
        <div class="team-section">
            <h2>Наша команда</h2>
            <p>В нашей команде работают опытные специалисты с многолетним стажем в сфере ${industry}. Мы постоянно повышаем квалификацию и следим за новейшими тенденциями в отрасли.</p>
            <p>Каждый сотрудник ${companyName} разделяет наши ценности и стремится к достижению лучших результатов для клиентов.</p>
        </div>
        
        <h2>Почему выбирают нас?</h2>
        <ul style="font-size: 1.1em;">
            <li>Индивидуальный подход к каждому клиенту</li>
            <li>Прозрачность в работе и ценообразовании</li>
            <li>Современные методы и технологии</li>
            <li>Профессиональная поддержка на всех этапах</li>
            <li>Гарантия качества выполненных работ</li>
        </ul>
        
        <div class="contact-footer">
            <h3>Свяжитесь с нами</h3>
            <p><strong>Email:</strong> ${contactEmail}</p>
            ${phone ? `<p><strong>Телефон:</strong> ${phone}</p>` : ''}
            ${address ? `<p><strong>Адрес:</strong> ${address}</p>` : ''}
            <p><em>Мы всегда рады новым проектам и сотрудничеству!</em></p>
        </div>
    </div>
</body>
</html>`;

    default:
      return `<h1>Тип страницы "${pageType}" в разработке</h1>
               <p>Обратитесь в службу поддержки: ${contactEmail}</p>`;
  }
}