# Полное руководство по установке и управлению LegalRFDocs

## 🚀 Быстрая установка на legalrfdocs.ru

### Системные требования
- Node.js 20+ 
- PostgreSQL 14+
- 2GB RAM минимум
- 10GB дискового пространства

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Установка PM2 для управления процессами
sudo npm install -g pm2
```

### 2. Настройка базы данных

```bash
# Переключение на пользователя postgres
sudo -u postgres psql

# Создание базы данных и пользователя
CREATE DATABASE legalrfdocs;
CREATE USER legalapp WITH PASSWORD 'ваш_безопасный_пароль';
GRANT ALL PRIVILEGES ON DATABASE legalrfdocs TO legalapp;
\q
```

### 3. Клонирование и настройка проекта

```bash
# Клонирование проекта
git clone your-repo-url /var/www/legalrfdocs
cd /var/www/legalrfdocs

# Установка зависимостей
npm install

# Создание файла окружения
cp .env.example .env
```

### 4. Настройка переменных окружения (.env)

```env
# База данных
DATABASE_URL=postgresql://legalapp:ваш_пароль@localhost:5432/legalrfdocs

# Сессии
SESSION_SECRET=ваш_очень_длинный_случайный_ключ_минимум_32_символа

# Домен
DOMAIN=legalrfdocs.ru
NODE_ENV=production

# Email настройки (опционально)
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=admin@legalrfdocs.ru
SMTP_PASS=пароль_от_почты

# Telegram настройки (опционально)
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHANNEL_ID=@ваш_канал
```

### 5. Инициализация базы данных

```bash
# Применение миграций
npm run db:push

# Создание админа (выполнить в psql)
sudo -u postgres psql legalrfdocs -c "
INSERT INTO users (id, email, password, first_name, last_name, role, subscription, documents_created, documents_limit) 
VALUES ('admin_main', 'admin@legalrfdocs.ru', 'admin_password_change_me', 'Админ', 'Системы', 'admin', 'premium', 0, -1);
"
```

### 6. Сборка проекта

```bash
# Сборка фронтенда
npm run build

# Проверка работы
npm run preview
```

### 7. Настройка PM2

```bash
# Создание конфигурации PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'legalrfdocs',
    script: 'server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Создание папки для логов
mkdir -p logs

# Запуск приложения
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Настройка Nginx

```bash
# Установка Nginx
sudo apt install nginx -y

# Создание конфигурации сайта
sudo tee /etc/nginx/sites-available/legalrfdocs.ru << 'EOF'
server {
    listen 80;
    server_name legalrfdocs.ru www.legalrfdocs.ru;

    location / {
        proxy_pass http://localhost:3000;
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
EOF

# Активация сайта
sudo ln -s /etc/nginx/sites-available/legalrfdocs.ru /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
sudo certbot --nginx -d legalrfdocs.ru -d www.legalrfdocs.ru

# Автообновление сертификата
sudo crontab -e
# Добавить строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🛠 Управление системой

### Основные команды PM2

```bash
# Статус приложения
pm2 status

# Перезапуск
pm2 restart legalrfdocs

# Остановка
pm2 stop legalrfdocs

# Просмотр логов
pm2 logs legalrfdocs

# Мониторинг в реальном времени
pm2 monit
```

### Обновление кода

```bash
cd /var/www/legalrfdocs

# Получение обновлений
git pull origin main

# Установка новых зависимостей
npm install

# Применение миграций базы данных
npm run db:push

# Сборка проекта
npm run build

# Перезапуск приложения
pm2 restart legalrfdocs
```

### Бэкап базы данных

```bash
# Создание бэкапа
sudo -u postgres pg_dump legalrfdocs > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
sudo -u postgres psql legalrfdocs < backup_file.sql
```

## 📝 Структура проекта и функции

### Основные директории

```
/var/www/legalrfdocs/
├── client/                 # Фронтенд React
│   ├── src/
│   │   ├── components/     # Компоненты UI
│   │   ├── pages/         # Страницы приложения
│   │   ├── hooks/         # React хуки
│   │   └── lib/           # Утилиты и константы
├── server/                # Бэкенд Express
│   ├── auth.ts           # Система аутентификации
│   ├── routes.ts         # API маршруты
│   ├── storage.ts        # Работа с БД
│   └── index.ts          # Точка входа
├── shared/               # Общие типы и схемы
│   └── schema.ts         # Схема базы данных
└── ecosystem.config.js   # Конфигурация PM2
```

### Ключевые функции

#### 1. Создание документов (`/api/documents`)
- **Расположение**: `server/newRoutes.ts` строки 174-255
- **Функция**: Генерация юридических документов всех типов
- **Лимиты**: Бесплатно - 3 док, Премиум - 100, Админ - безлимит

#### 2. Управление пользователями (`/api/admin/users`)
- **Расположение**: `server/newRoutes.ts` строки 395-460
- **Функция**: CRUD операции с пользователями
- **Доступ**: Только для администраторов

#### 3. Система уведомлений (`/api/notifications`)
- **Расположение**: `server/newRoutes.ts` строки 430-450
- **Функция**: Уведомления для пользователей
- **Типы**: legal_update, reminder, info

#### 4. Шаблоны документов (`/api/templates`)
- **Расположение**: `server/newRoutes.ts` строки 160-172
- **Функция**: Управление шаблонами документов
- **Форматы**: Все типы юридических документов

## 🔧 Настройка компонентов

### Изменение типов документов

**Файл**: `client/src/lib/constants.ts`

```typescript
export const DOCUMENT_TYPES = {
  privacy: {
    name: "Политика конфиденциальности",
    description: "152-ФЗ совместимый документ",
    icon: "fas fa-user-shield",
    color: "primary",
  },
  // Добавить новый тип:
  newtype: {
    name: "Новый тип документа",
    description: "Описание нового типа",
    icon: "fas fa-file",
    color: "success",
  }
}
```

**Также обновить**: `server/newRoutes.ts` функция `generateDocumentContent()`

### Настройка лимитов пользователей

**Файл**: `server/newRoutes.ts` строки 243-251

```typescript
// Устанавливаем лимиты в зависимости от подписки
let limit;
if (user?.role === 'admin') {
  limit = -1; // Безлимитно для админов
} else if (user?.subscription === 'premium') {
  limit = 100; // 100 документов для премиум
} else {
  limit = 3; // 3 документа для бесплатных пользователей
}
```

### Добавление новых отраслей

**Файл**: `client/src/lib/constants.ts`

```typescript
export const INDUSTRIES = [
  { value: "retail", label: "Розничная торговля" },
  { value: "services", label: "Услуги" },
  // Добавить новую отрасль:
  { value: "newfield", label: "Новая отрасль" },
]
```

## 🔐 Настройка админ-панели

### Telegram уведомления

**Настройки**: Админ-панель → Настройки → Telegram

- **Токен бота**: Получить у @BotFather
- **ID канала**: ID группы/канала для уведомлений
- **Поддержка**: Ссылка на Telegram поддержки

### Email настройки

**Файл**: `.env` + Админ-панель

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=admin@legalrfdocs.ru
SMTP_PASS=пароль_от_почты
```

### Создание нового администратора

```sql
INSERT INTO users (id, email, password, first_name, last_name, role, subscription) 
VALUES ('admin_id', 'email@example.com', 'пароль', 'Имя', 'Фамилия', 'admin', 'premium');
```

## 📊 Мониторинг и логи

### Просмотр логов

```bash
# Логи приложения
pm2 logs legalrfdocs

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Логи PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Мониторинг ресурсов

```bash
# Использование системы
htop

# Статус сервисов
sudo systemctl status nginx
sudo systemctl status postgresql

# Дисковое пространство
df -h
```

## 🚨 Устранение неполадок

### Приложение не запускается

1. Проверить переменные окружения в `.env`
2. Проверить подключение к базе данных
3. Убедиться что порт 3000 свободен
4. Проверить логи: `pm2 logs legalrfdocs`

### Ошибки базы данных

1. Проверить статус PostgreSQL: `sudo systemctl status postgresql`
2. Проверить подключение: `psql -h localhost -U legalapp -d legalrfdocs`
3. Применить миграции: `npm run db:push`

### Проблемы с SSL

1. Проверить сертификат: `sudo certbot certificates`
2. Обновить сертификат: `sudo certbot renew`
3. Перезапустить Nginx: `sudo systemctl reload nginx`

## 📞 Поддержка

- **Email**: rucoder.rf@yandex.ru
- **Telegram**: @RussCoder
- **Сайт разработчика**: рукодер.рф

## 📋 Чек-лист готовности к переносу

- [ ] Сервер настроен и обновлен
- [ ] PostgreSQL установлен и настроен
- [ ] Домен legalrfdocs.ru направлен на сервер
- [ ] SSL сертификат установлен
- [ ] Переменные окружения настроены
- [ ] База данных инициализирована
- [ ] Админ пользователь создан
- [ ] PM2 настроен для автозапуска
- [ ] Nginx настроен и работает
- [ ] Бэкапы настроены
- [ ] Мониторинг настроен

✅ **Система готова к эксплуатации на legalrfdocs.ru**