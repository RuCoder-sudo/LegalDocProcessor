# 🚀 ИНСТРУКЦИЯ ПО РАЗВЕРТЫВАНИЮ НА VPS JINO.RU

## 📋 ТЕКУЩАЯ СИТУАЦИЯ

✅ **Что готово:**
- Домен `legalrfdocs.ru` привязан к VPS
- Проект полностью разработан и протестирован
- Создан администратор: логин `lizerded`, пароль `lizeR3056806`
- Обновлены контакты на РУКОДЕР

⚠️ **Существующие проекты на сервере:**
- `marketingmaster.space` → `/var/www/marketingmaster/` (GitHub: RuCoder-sudo/MarketingMaster)
- `rucoderweb.website` → `/var/www/rucoderweb/` (GitHub: RuCoder-sudo/telegram_web_tg_rucoder)

🎯 **Цель:** Развернуть `legalrfdocs.ru` без нарушения работы существующих сайтов

---

## 🗂 СТРУКТУРА ПРОЕКТОВ НА СЕРВЕРЕ

```
/var/www/
├── marketingmaster/          # marketingmaster.space
├── rucoderweb/              # rucoderweb.website  
└── legalrfdocs/             # legalrfdocs.ru (новый проект)
```

```
/etc/nginx/sites-available/
├── marketingmaster.space
├── rucoderweb.website
└── legalrfdocs.ru           # новый конфиг
```

---

## 🔧 ПОШАГОВОЕ РАЗВЕРТЫВАНИЕ

### Шаг 1: Подключение к серверу через MobaXterm
```bash
# Вы уже подключились, проверим структуру
ls -la /var/www/
ls -la /etc/nginx/sites-available/
```

### Шаг 2: Создание директории для нового проекта
```bash
# Создаем папку для проекта
sudo mkdir -p /var/www/legalrfdocs
sudo chown $USER:$USER /var/www/legalrfdocs
cd /var/www/legalrfdocs
```

### Шаг 3: Загрузка проекта
```bash
# Вариант 1: Через Git (если есть репозиторий)
git clone [ВАШ_РЕПОЗИТОРИЙ] .

# Вариант 2: Загрузка архива
# Скачайте проект с Replit как архив и загрузите через WinSCP/FileZilla
# Распакуйте в /var/www/legalrfdocs/
```

### Шаг 4: Установка зависимостей
```bash
cd /var/www/legalrfdocs

# Проверяем версию Node.js
node --version  # должно быть 18+ или 20+

# Если нужно обновить Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем зависимости
npm install

# Собираем проект для продакшена
npm run build
```

### Шаг 5: Настройка PostgreSQL
```bash
# Создаем базу данных
sudo -u postgres createdb legalrfdocs_db
sudo -u postgres createuser legalrfdocs_user

# Настраиваем права доступа
sudo -u postgres psql
```

В PostgreSQL выполните:
```sql
ALTER USER legalrfdocs_user WITH PASSWORD 'SecurePassword123';
GRANT ALL PRIVILEGES ON DATABASE legalrfdocs_db TO legalrfdocs_user;
\q
```

### Шаг 6: Создание .env файла
```bash
cd /var/www/legalrfdocs
nano .env
```

Содержимое .env:
```env
# База данных
DATABASE_URL=postgresql://legalrfdocs_user:SecurePassword123@localhost:5432/legalrfdocs_db

# Аутентификация Replit (временно отключаем)
SESSION_SECRET=your-super-secret-session-key-here
REPL_ID=disabled-for-vps
REPLIT_DOMAINS=legalrfdocs.ru
ISSUER_URL=https://replit.com/oidc

# Продакшн настройки
NODE_ENV=production
PORT=3001

# PostgreSQL детали
PGDATABASE=legalrfdocs_db
PGHOST=localhost
PGPASSWORD=SecurePassword123
PGPORT=5432
PGUSER=legalrfdocs_user
```

### Шаг 7: Применение миграций БД
```bash
# Применяем схему БД
npm run db:push

# Проверяем что БД создалась
sudo -u postgres psql -d legalrfdocs_db -c "\dt"
```

### Шаг 8: Создание администратора
```bash
# Подключаемся к БД и создаем админа
sudo -u postgres psql -d legalrfdocs_db
```

В PostgreSQL:
```sql
INSERT INTO users (id, email, role, first_name, last_name, password, login_type, created_at, updated_at) 
VALUES (
  'lizerded', 
  'lizerded@admin.local', 
  'admin', 
  'Админ', 
  'Системы', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'local', 
  NOW(), 
  NOW()
);
\q
```

### Шаг 9: Настройка PM2 для управления процессом
```bash
# Устанавливаем PM2 глобально (если не установлен)
sudo npm install -g pm2

# Создаем конфиг для PM2
nano ecosystem.config.js
```

Содержимое ecosystem.config.js:
```javascript
module.exports = {
  apps: [
    {
      name: 'legalrfdocs',
      script: 'server/index.js',
      cwd: '/var/www/legalrfdocs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

```bash
# Запускаем приложение через PM2
pm2 start ecosystem.config.js

# Проверяем статус
pm2 status

# Сохраняем конфигурацию
pm2 save
pm2 startup
```

### Шаг 10: Настройка Nginx
```bash
# Создаем конфиг для нового домена
sudo nano /etc/nginx/sites-available/legalrfdocs.ru
```

Содержимое конфига:
```nginx
server {
    listen 80;
    server_name legalrfdocs.ru www.legalrfdocs.ru;
    
    # Редирект на HTTPS (после получения SSL)
    # return 301 https://$server_name$request_uri;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Логи
    access_log /var/log/nginx/legalrfdocs_access.log;
    error_log /var/log/nginx/legalrfdocs_error.log;
}
```

```bash
# Активируем сайт
sudo ln -s /etc/nginx/sites-available/legalrfdocs.ru /etc/nginx/sites-enabled/

# Проверяем конфигурацию Nginx
sudo nginx -t

# Если все ОК, перезагружаем Nginx
sudo systemctl reload nginx
```

### Шаг 11: Получение SSL сертификата
```bash
# Устанавливаем Certbot (если не установлен)
sudo apt install certbot python3-certbot-nginx -y

# Получаем SSL сертификат
sudo certbot --nginx -d legalrfdocs.ru -d www.legalrfdocs.ru

# Проверяем автоматическое обновление
sudo certbot renew --dry-run
```

---

## ✅ ПРОВЕРКА РАБОТОСПОСОБНОСТИ

### 1. Проверка приложения
```bash
# Статус PM2
pm2 status

# Логи приложения
pm2 logs legalrfdocs

# Проверка порта
netstat -tlnp | grep :3001
```

### 2. Проверка Nginx
```bash
# Статус Nginx
sudo systemctl status nginx

# Логи Nginx
sudo tail -f /var/log/nginx/legalrfdocs_error.log
```

### 3. Проверка в браузере
- Откройте `https://legalrfdocs.ru`
- Проверьте главную страницу
- Попробуйте `/admin-login` с данными: `lizerded` / `lizeR3056806`

---

## 🔍 РЕШЕНИЕ ПРОБЛЕМ

### Проблема: "Test Page - Default Server"
Это означает, что Nginx отдает дефолтную страницу. Проверьте:

```bash
# Удалите дефолтный сайт
sudo rm /etc/nginx/sites-enabled/default

# Перезагрузите Nginx
sudo systemctl reload nginx
```

### Проблема: Порт уже занят
```bash
# Найдите процесс на порту 3001
sudo lsof -i :3001

# Если нужно, измените порт в .env и ecosystem.config.js
```

### Проблема: Ошибки БД
```bash
# Проверьте подключение к БД
sudo -u postgres psql -d legalrfdocs_db -c "SELECT version();"

# Проверьте логи приложения
pm2 logs legalrfdocs
```

---

## 📊 МОНИТОРИНГ И ОБСЛУЖИВАНИЕ

### Полезные команды
```bash
# Статус всех проектов
pm2 status

# Перезапуск проекта
pm2 restart legalrfdocs

# Просмотр логов
pm2 logs legalrfdocs --lines 100

# Мониторинг ресурсов
pm2 monit

# Резервная копия БД
pg_dump legalrfdocs_db > backup_$(date +%Y%m%d).sql
```

### Обновление проекта
```bash
cd /var/www/legalrfdocs

# Скачиваем обновления
git pull  # или загружаем новые файлы

# Устанавливаем новые зависимости
npm install

# Собираем проект
npm run build

# Применяем миграции БД (если есть)
npm run db:push

# Перезапускаем приложение
pm2 restart legalrfdocs
```

---

## 🎯 ИТОГОВАЯ СТРУКТУРА

После развертывания у вас будет:

- ✅ `marketingmaster.space` - работает как раньше
- ✅ `rucoderweb.website` - работает как раньше  
- ✅ `legalrfdocs.ru` - новый проект
- ✅ Все проекты изолированы и не мешают друг другу
- ✅ SSL сертификаты для всех доменов
- ✅ Автозапуск через PM2

---

## 📞 ПОДДЕРЖКА

**Если возникнут проблемы:**
- 📧 Email: rucoder.rf@yandex.ru
- 📱 Telegram: @RussCoder
- 🌐 Портфолио: рукодер.рф

**Готов помочь с развертыванием и настройкой!**