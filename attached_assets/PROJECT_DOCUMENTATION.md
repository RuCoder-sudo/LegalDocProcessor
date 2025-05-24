# 📚 ПОЛНАЯ ДОКУМЕНТАЦИЯ ПРОЕКТА "ЮрДок Генератор"

## 🚀 ОПИСАНИЕ ПРОЕКТА

**ЮрДок Генератор** - это профессиональная веб-платформа для автоматического создания юридических документов в соответствии с российским законодательством. Проект разработан для помощи владельцам сайтов в соблюдении требований 152-ФЗ и других правовых норм.

### 🎯 Основная цель
Упростить процесс создания обязательных юридических документов для сайтов и обеспечить их соответствие актуальному законодательству РФ.

### 🌟 Ключевые особенности
- ✅ **6 типов документов**: Политика конфиденциальности, Пользовательское соглашение, Согласие на ПД, Публичная оферта, Правила пользования, Cookie policy
- ✅ **Соответствие 152-ФЗ**: Полное соблюдение требований российского законодательства
- ✅ **Пошаговый мастер**: Интуитивный интерфейс создания документов
- ✅ **Валидация данных**: Проверка ИНН, ОГРН и других реквизитов
- ✅ **Экспорт в форматы**: PDF, DOC, HTML
- ✅ **Отраслевые шаблоны**: Специализированные решения для разных сфер
- ✅ **Правовой блог**: Актуальная информация о законодательстве
- ✅ **Админ-панель**: Полное управление платформой

## 🛠 ТЕХНИЧЕСКИЙ СТЕК

### Frontend (Клиентская часть)
- **React 18.2** - Основная библиотека UI
- **TypeScript 5.0** - Типизированный JavaScript
- **Tailwind CSS 3.3** - CSS-фреймворк для стилизации
- **Shadcn UI** - Компонентная библиотека
- **Wouter** - Легковесный роутер
- **TanStack Query v5** - Управление состоянием и кэширование
- **React Hook Form** - Управление формами
- **Zod** - Валидация схем данных
- **Framer Motion** - Анимации (планируется)
- **Lucide React** - Иконки
- **Font Awesome 6.4** - Дополнительные иконки
- **date-fns** - Работа с датами

### Backend (Серверная часть)
- **Express.js 4.18** - Веб-фреймворк
- **TypeScript** - Типизированный JavaScript
- **PostgreSQL 14+** - Реляционная база данных
- **Drizzle ORM** - ORM для работы с БД
- **Passport.js** - Аутентификация
- **OpenID Connect** - Протокол аутентификации
- **Express Session** - Управление сессиями
- **Bcrypt** - Хеширование паролей
- **Zod** - Валидация данных
- **Puppeteer** - Генерация PDF (планируется)
- **Nodemailer** - Отправка email (планируется)

### Инфраструктура
- **Replit** - Хостинг и среда разработки
- **Vite 4.4** - Сборщик и dev-сервер
- **PostCSS** - Обработка CSS
- **ESBuild** - Транспиляция TypeScript

### Дополнительные инструменты
- **Drizzle Kit** - Миграции БД
- **Connect-PG-Simple** - Хранение сессий в PostgreSQL
- **Memoizee** - Кэширование функций

## 📁 СТРУКТУРА ПРОЕКТА

```
├── client/                    # Frontend приложение
│   ├── src/
│   │   ├── components/        # React компоненты
│   │   │   ├── ui/           # Базовые UI компоненты (Shadcn)
│   │   │   ├── Layout.tsx    # Основной лэйаут
│   │   │   ├── Sidebar.tsx   # Боковая панель
│   │   │   ├── ProgressIndicator.tsx # Индикатор прогресса
│   │   │   └── WizardForm.tsx # Форма мастера
│   │   ├── hooks/            # React хуки
│   │   │   ├── useAuth.ts    # Хук аутентификации
│   │   │   └── use-toast.ts  # Хук уведомлений
│   │   ├── lib/              # Утилиты и конфигурация
│   │   │   ├── constants.ts  # Константы приложения
│   │   │   ├── queryClient.ts # Конфигурация React Query
│   │   │   ├── types.ts      # TypeScript типы
│   │   │   └── utils.ts      # Вспомогательные функции
│   │   ├── pages/            # Страницы приложения
│   │   │   ├── Landing.tsx   # Главная страница
│   │   │   ├── Home.tsx      # Личный кабинет
│   │   │   ├── DocumentWizard.tsx # Мастер создания
│   │   │   ├── Blog.tsx      # Страница блога
│   │   │   ├── Admin.tsx     # Админ-панель
│   │   │   └── not-found.tsx # 404 страница
│   │   ├── App.tsx           # Корневой компонент
│   │   ├── main.tsx          # Точка входа
│   │   └── index.css         # Основные стили
│   └── index.html            # HTML шаблон
├── server/                   # Backend приложение
│   ├── db.ts                # Конфигурация БД
│   ├── storage.ts           # Слой доступа к данным
│   ├── routes.ts            # API маршруты
│   ├── replitAuth.ts        # Настройка аутентификации
│   ├── vite.ts              # Интеграция с Vite
│   └── index.ts             # Точка входа сервера
├── shared/                  # Общий код
│   └── schema.ts            # Схемы БД и валидации
├── package.json             # Зависимости проекта
├── drizzle.config.ts        # Конфигурация Drizzle ORM
├── tailwind.config.ts       # Конфигурация Tailwind CSS
├── tsconfig.json            # Конфигурация TypeScript
├── vite.config.ts           # Конфигурация Vite
└── README.md                # Краткое описание
```

## 🗄 СХЕМА БАЗЫ ДАННЫХ

### Таблицы

#### `users` - Пользователи системы
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,              -- ID пользователя из Replit
  email VARCHAR UNIQUE,                -- Email адрес
  first_name VARCHAR,                  -- Имя
  last_name VARCHAR,                   -- Фамилия
  profile_image_url VARCHAR,           -- URL аватара
  role VARCHAR DEFAULT 'user',         -- Роль: user, admin, premium
  created_at TIMESTAMP DEFAULT NOW(), -- Дата создания
  updated_at TIMESTAMP DEFAULT NOW()  -- Дата обновления
);
```

#### `sessions` - Сессии пользователей (обязательно для Replit Auth)
```sql
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,             -- ID сессии
  sess JSONB NOT NULL,                -- Данные сессии
  expire TIMESTAMP NOT NULL           -- Время истечения
);
```

#### `document_templates` - Шаблоны документов
```sql
CREATE TABLE document_templates (
  id SERIAL PRIMARY KEY,              -- Уникальный ID
  name VARCHAR NOT NULL,              -- Название шаблона
  type VARCHAR NOT NULL,              -- Тип документа
  industry VARCHAR,                   -- Отрасль
  content TEXT NOT NULL,              -- Содержимое шаблона
  fields JSONB NOT NULL,              -- Поля для заполнения
  is_active BOOLEAN DEFAULT TRUE,     -- Активен ли шаблон
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `user_documents` - Документы пользователей
```sql
CREATE TABLE user_documents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  template_id INTEGER REFERENCES document_templates(id),
  name VARCHAR NOT NULL,              -- Название документа
  type VARCHAR NOT NULL,              -- Тип документа
  form_data JSONB NOT NULL,           -- Данные формы
  generated_content TEXT,             -- Сгенерированный контент
  status VARCHAR DEFAULT 'draft',     -- draft, completed, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `document_exports` - История экспорта
```sql
CREATE TABLE document_exports (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES user_documents(id),
  format VARCHAR NOT NULL,            -- pdf, doc, html
  exported_at TIMESTAMP DEFAULT NOW()
);
```

#### `notifications` - Уведомления
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  title VARCHAR NOT NULL,             -- Заголовок
  message TEXT NOT NULL,              -- Текст уведомления
  type VARCHAR NOT NULL,              -- legal_update, reminder, info
  is_read BOOLEAN DEFAULT FALSE,      -- Прочитано ли
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `blog_posts` - Статьи блога
```sql
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,             -- Заголовок статьи
  slug VARCHAR NOT NULL UNIQUE,       -- URL slug
  excerpt TEXT NOT NULL,              -- Краткое описание
  content TEXT NOT NULL,              -- Содержимое статьи
  category VARCHAR NOT NULL,          -- legal_news, guides, faq
  tags TEXT[],                        -- Теги
  author_id VARCHAR REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE, -- Опубликована ли
  published_at TIMESTAMP,             -- Дата публикации
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 СИСТЕМА АУТЕНТИФИКАЦИИ

### Используемая технология
Проект использует **Replit Auth** - систему аутентификации на основе OpenID Connect.

### Процесс аутентификации
1. Пользователь нажимает "Войти" на главной странице
2. Перенаправление на `/api/login`
3. Переход к Replit OAuth
4. После успешной авторизации возврат на `/api/callback`
5. Создание/обновление пользователя в БД
6. Установка сессии и перенаправление в личный кабинет

### Роли пользователей
- **user** - Обычный пользователь (по умолчанию)
- **premium** - Премиум пользователь с расширенными возможностями
- **admin** - Администратор с полным доступом

### Переменные окружения для аутентификации
```env
SESSION_SECRET=your-session-secret-key
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.com
ISSUER_URL=https://replit.com/oidc
```

## 🔧 УСТАНОВКА И РАЗВЕРТЫВАНИЕ

### Требования к системе
- **Node.js** 20.x или выше
- **PostgreSQL** 14.x или выше
- **npm** или **yarn**

### Локальная разработка

#### 1. Клонирование и установка
```bash
# Если у вас есть репозиторий
git clone <repository-url>
cd legal-docs-generator

# Установка зависимостей
npm install
```

#### 2. Настройка переменных окружения
Создайте файл `.env` в корне проекта:
```env
# База данных
DATABASE_URL=postgresql://username:password@localhost:5432/legal_docs

# Аутентификация
SESSION_SECRET=your-very-secret-session-key
REPL_ID=your-repl-id
REPLIT_DOMAINS=localhost:5000,your-domain.com
ISSUER_URL=https://replit.com/oidc

# Дополнительные настройки
NODE_ENV=development
PORT=5000
```

#### 3. Настройка базы данных
```bash
# Применение миграций
npm run db:push

# Или создание миграций
npm run db:generate
npm run db:migrate
```

#### 4. Запуск проекта
```bash
# Режим разработки
npm run dev

# Проект будет доступен на http://localhost:5000
```

### Развертывание на Replit (текущий хостинг)

#### Автоматическое развертывание
1. Проект уже настроен для работы на Replit
2. База данных PostgreSQL создается автоматически
3. Переменные окружения настраиваются автоматически
4. Домен: `your-repl-name.replit.app`

#### Настройка пользовательского домена
1. В настройках Repl добавить Custom Domain
2. Настроить DNS записи у регистратора:
   ```
   Type: CNAME
   Name: your-subdomain (или @)
   Value: your-repl-name.replit.app
   ```
3. Обновить переменную `REPLIT_DOMAINS`

### Развертывание на VPS/VDS

#### 1. Подготовка сервера
```bash
# Обновление системы (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Установка PM2 для управления процессами
sudo npm install -g pm2
```

#### 2. Настройка PostgreSQL
```bash
# Создание пользователя и БД
sudo -u postgres psql
CREATE USER legal_user WITH PASSWORD 'secure_password';
CREATE DATABASE legal_docs OWNER legal_user;
GRANT ALL PRIVILEGES ON DATABASE legal_docs TO legal_user;
\q
```

#### 3. Загрузка и настройка проекта
```bash
# Клонирование
git clone <your-repo-url> /var/www/legal-docs
cd /var/www/legal-docs

# Установка зависимостей
npm install

# Создание production .env
cp .env.example .env
nano .env
```

#### 4. Сборка и запуск
```bash
# Сборка проекта
npm run build

# Применение миграций
npm run db:push

# Запуск с PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Настройка Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 6. SSL сертификат
```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d your-domain.com
```

## 👤 АДМИНИСТРИРОВАНИЕ

### Доступ к админ-панели
1. **URL**: `/admin`
2. **Требования**: Роль `admin` в базе данных
3. **Функции**:
   - Управление пользователями
   - Модерация документов
   - Просмотр статистики
   - Системные настройки

### Готовый администратор
**Уже создан тестовый администратор:**
- **Логин ID:** `lizerded`
- **Email:** `lizerded@admin.local`
- **Роль:** `admin`

### Создание дополнительных администраторов
```sql
-- Через PostgreSQL
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Или создание нового админа
INSERT INTO users (id, email, role) VALUES ('admin-id', 'admin@example.com', 'admin');
```

### Управление базой данных
```bash
# Подключение к БД
psql $DATABASE_URL

# Резервное копирование
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Восстановление
psql $DATABASE_URL < backup_20241225.sql

# Просмотр таблиц
\dt

# Проверка пользователей
SELECT id, email, role, created_at FROM users;
```

### Мониторинг и логи
```bash
# Логи приложения (PM2)
pm2 logs legal-docs

# Состояние процессов
pm2 status

# Перезапуск
pm2 restart legal-docs

# Мониторинг ресурсов
pm2 monit
```

## 📊 ФУНКЦИОНАЛЬНЫЕ ВОЗМОЖНОСТИ

### Для пользователей
1. **Создание документов**
   - Пошаговый мастер
   - Валидация данных в реальном времени
   - Предварительный просмотр
   - Сохранение черновиков

2. **Управление документами**
   - Личный кабинет
   - История создания
   - Редактирование существующих
   - Экспорт в разные форматы

3. **Информационный блог**
   - Актуальные статьи о законодательстве
   - Поиск и фильтрация
   - Категории: новости, руководства, FAQ

### Для администраторов
1. **Управление пользователями**
   - Просмотр всех пользователей
   - Изменение ролей
   - Статистика активности

2. **Модерация контента**
   - Просмотр всех документов
   - Управление шаблонами
   - Модерация статей блога

3. **Аналитика**
   - Статистика использования
   - Популярные документы
   - Активность пользователей

## 🔧 API ENDPOINTS

### Аутентификация
- `GET /api/login` - Начало процесса авторизации
- `GET /api/callback` - Обработка OAuth callback
- `GET /api/logout` - Выход из системы
- `GET /api/auth/user` - Получение данных пользователя

### Шаблоны документов
- `GET /api/templates` - Список всех шаблонов
- `GET /api/templates/:id` - Получение шаблона
- `GET /api/templates/type/:type` - Шаблоны по типу

### Пользовательские документы
- `GET /api/documents` - Документы пользователя
- `GET /api/documents/:id` - Конкретный документ
- `POST /api/documents` - Создание документа
- `PUT /api/documents/:id` - Обновление документа
- `DELETE /api/documents/:id` - Удаление документа

### Экспорт
- `POST /api/documents/:id/export` - Экспорт документа

### Уведомления
- `GET /api/notifications` - Уведомления пользователя
- `POST /api/notifications/:id/read` - Пометить как прочитанное
- `POST /api/notifications/read-all` - Пометить все как прочитанные

### Валидация
- `POST /api/validate/inn` - Валидация ИНН

## 🚀 ПЛАНЫ РАЗВИТИЯ

### Ближайшие обновления
1. **PDF генерация** - Интеграция Puppeteer для создания PDF
2. **Email уведомления** - Настройка SMTP для рассылок
3. **Расширенная аналитика** - Графики и детальная статистика
4. **API для разработчиков** - REST API для интеграций

### Долгосрочные планы
1. **Мобильное приложение** - React Native версия
2. **AI интеграция** - Умная генерация контента
3. **Белый лейбл** - Решение для агентств
4. **Международная версия** - Поддержка других юрисдикций

---

**Версия документации:** 2.0  
**Дата обновления:** Декабрь 2024  
**Авторы:** Команда ЮрДок Генератор