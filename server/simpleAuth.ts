import bcrypt from "bcryptjs";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export function setupSimpleAuth(app: Express) {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // для разработки
      maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
  }));

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
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Генерируем уникальный ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Создаем пользователя
      const [newUser] = await db
        .insert(users)
        .values({
          id: userId,
          email,
          password: hashedPassword,
          firstName: firstName || null,
          lastName: lastName || null,
        })
        .returning();

      // Сохраняем в сессии
      // @ts-ignore
      req.session.userId = newUser.id;
      
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

        // @ts-ignore
        req.session.userId = adminUser.id;
        // @ts-ignore
        req.session.user = adminUser;
        
        console.log("Admin login - session set:", req.session);
        
        // Принудительно сохраняем сессию
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Ошибка сохранения сессии" });
          }
          console.log("Session saved successfully");
          return res.json({ 
            message: "Вход выполнен успешно", 
            user: adminUser 
          });
        });
        return; // Важно! Возвращаемся здесь
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

      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Неверный email или пароль" });
      }

      // Сохраняем в сессии
      // @ts-ignore
      req.session.userId = user.id;
      // @ts-ignore
      req.session.user = { ...user, password: undefined };
      
      // Возвращаем пользователя без пароля
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Ошибка при входе" });
    }
  });

  // Выход
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при выходе" });
      }
      res.json({ message: "Успешный выход" });
    });
  });

  // Получить текущего пользователя
  app.get("/api/auth/user", async (req, res) => {
    try {
      console.log("Session data:", req.session);
      // @ts-ignore
      const userId = req.session?.userId;
      
      if (!userId) {
        console.log("No userId in session");
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("Found userId:", userId);

      // Проверяем админа
      if (userId === "admin_main") {
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
        console.log("Returning admin user");
        return res.json(adminUser);
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(401).json({ message: "Пользователь не найден" });
      }

      // Возвращаем пользователя без пароля
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    // @ts-ignore
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }

    // Проверяем админа
    if (userId === "admin_main") {
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
      // @ts-ignore
      req.user = adminUser;
      return next();
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    // @ts-ignore
    req.user = { ...user, password: undefined };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Ошибка авторизации" });
  }
};