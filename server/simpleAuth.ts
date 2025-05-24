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
      // @ts-ignore
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Возвращаем пользователя без пароля
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(401).json({ message: "Unauthorized" });
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

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    // @ts-ignore
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Ошибка авторизации" });
  }
};