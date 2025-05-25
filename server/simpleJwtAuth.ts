import type { Express, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Простое JWT-подобное решение для разработки
function createToken(userData: any): string {
  const payload = JSON.stringify(userData);
  return Buffer.from(payload).toString('base64');
}

function verifyToken(token: string): any {
  try {
    const payload = Buffer.from(token, 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function setupJwtAuth(app: Express) {
  // Регистрация
  app.post("/api/register", async (req, res) => {
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

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Генерируем уникальный ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Создаем пользователя
      const newUsers = await db
        .insert(users)
        .values({
          id: userId,
          email,
          password: hashedPassword,
          firstName: firstName || null,
          lastName: lastName || null,
          role: 'user',
          subscription: 'free',
          documentsCreated: 0,
          documentsLimit: 2
        })
        .returning();
      
      const newUser = newUsers[0];

      // Создаем токен
      const token = createToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      });

      // Устанавливаем cookie
      res.cookie('auth-token', token, {
        httpOnly: false,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
        sameSite: 'lax'
      });
      
      // Возвращаем пользователя без пароля
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Ошибка при регистрации" });
    }
  });

  // Вход
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email и пароль обязательны" });
      }

      // Проверяем админа
      if (email === "rucoder.rf@yandex.ru" && password === "lizeR3056806") {
        const adminUser = {
          id: "admin_main",
          email: "rucoder.rf@yandex.ru",
          firstName: "Admin",
          lastName: "User",
          role: "admin" as const,
          subscription: "premium" as const,
          documentsCreated: 0,
          documentsLimit: -1
        };

        // Создаем токен для админа
        const token = createToken({
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role
        });

        res.cookie('auth-token', token, {
          httpOnly: false,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: 'lax'
        });
        
        console.log("Admin login successful, token set");
        return res.json({ 
          message: "Вход выполнен успешно", 
          user: adminUser 
        });
      }

      // Находим пользователя
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      const user = userResults[0];

      if (!user) {
        return res.status(401).json({ message: "Неверный email или пароль" });
      }

      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Неверный email или пароль" });
      }

      // Создаем токен
      const token = createToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      res.cookie('auth-token', token, {
        httpOnly: false,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });
      
      // Возвращаем пользователя без пароля
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        message: "Вход выполнен успешно",
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Ошибка при входе" });
    }
  });

  // Выход
  app.post("/api/logout", (req, res) => {
    // Очищаем cookie с правильными параметрами, чтобы браузер точно удалил куки
    res.clearCookie('auth-token', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });
    
    console.log("Logout request processed - clearing auth token");
    
    // Отправляем ответ с флагом для клиента, чтобы он удалил токен из localStorage
    res.json({ 
      message: "Успешный выход", 
      success: true,
      clearToken: true 
    });
  });

  // Получить текущего пользователя
  app.get("/api/auth/user", async (req, res) => {
    try {
      // Пробуем получить токен из cookie или заголовков
      let token = req.cookies['auth-token'];
      
      if (!token) {
        // Пробуем получить из заголовка Authorization
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      
      console.log("Auth check - Cookie token:", req.cookies['auth-token'] ? "present" : "missing");
      console.log("Auth check - Auth header:", req.headers.authorization ? "present" : "missing");
      console.log("Auth check - Final token:", token ? "present" : "missing");
      
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tokenData = verifyToken(token);
      if (!tokenData) {
        return res.status(401).json({ message: "Invalid token" });
      }

      console.log("Token data:", tokenData);

      // Если это админ
      if (tokenData.id === "admin_main" && tokenData.role === "admin") {
        console.log("Admin user authenticated via token");
        return res.json({
          id: "admin_main",
          email: "rucoder.rf@yandex.ru",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          subscription: "premium",
          documentsCreated: 0,
          documentsLimit: -1
        });
      }

      // Получаем пользователя из БД
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.id, tokenData.id))
        .limit(1);

      const user = userResults[0];
      if (!user) {
        return res.status(401).json({ message: "Пользователь не найден" });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });
}

export const requireJwtAuth: RequestHandler = async (req, res, next) => {
  try {
    // Пробуем получить токен из cookie или заголовков
    let token = req.cookies['auth-token'];
    
    if (!token) {
      // Пробуем получить из заголовка Authorization
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    console.log("JWT Auth check - Cookie token:", req.cookies['auth-token'] ? "present" : "missing");
    console.log("JWT Auth check - Auth header:", req.headers.authorization ? "present" : "missing");
    console.log("JWT Auth check - Final token:", token ? "present" : "missing");
    
    if (!token) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }

    const tokenData = verifyToken(token);
    if (!tokenData) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Проверяем админа
    if (tokenData.id === "admin_main") {
      (req as any).user = {
        id: "admin_main",
        email: "rucoder.rf@yandex.ru",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        subscription: "premium",
        documentsCreated: 0,
        documentsLimit: -1
      };
      return next();
    }

    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, tokenData.id))
      .limit(1);

    const user = userResults[0];
    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    (req as any).user = { ...user, password: undefined };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Ошибка авторизации" });
  }
};