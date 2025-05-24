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