import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Создает профиль админа
function createAdminProfile() {
  return {
    id: "admin_main",
    email: "rucoder.rf@yandex.ru",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    subscription: "premium",
    documentsCreated: 0,
    documentsLimit: -1
  };
}

// Декодирование токена из base64
function decodeToken(token: string) {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
  } catch (e) {
    console.error("Ошибка декодирования токена:", e);
    return null;
  }
}

// Проверка аутентификации
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Проверка заголовка Authorization
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("Найден токен в заголовке Authorization");
    }

    // 2. Проверка cookie, если токен не найден в заголовке
    if (!token && req.cookies && req.cookies['auth-token']) {
      token = req.cookies['auth-token'];
      console.log("Найден токен в cookie");
    }

    // 3. Проверка session (старый метод)
    const userId = (req as any).session?.userId;
    if (!token && userId) {
      console.log("Найден userId в сессии:", userId);

      // Проверка на админа в сессии
      if (userId === "admin_main") {
        (req as any).user = createAdminProfile();
        return next();
      }

      // Получение обычного пользователя
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResults.length > 0) {
        const user = userResults[0];
        (req as any).user = { ...user, password: undefined };
        return next();
      }
    }

    // Если токен не найден вообще, отправляем ошибку
    if (!token) {
      console.log("Токен не найден ни в одном из источников");
      return res.status(401).json({ message: "Необходима авторизация" });
    }

    // Декодирование и проверка токена
    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Недействительный токен" });
    }

    console.log("Декодированный токен:", decoded);

    // Проверка на админа
    if (decoded.id === "admin_main" && decoded.role === "admin") {
      console.log("Админ авторизован через токен");
      (req as any).user = createAdminProfile();
      return next();
    }

    // Проверка обычного пользователя по токену
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (userResults.length > 0) {
      const user = userResults[0];
      (req as any).user = { ...user, password: undefined };
      return next();
    }

    // Пользователь не найден
    return res.status(401).json({ message: "Пользователь не найден" });
  } catch (error) {
    console.error("Ошибка в middleware аутентификации:", error);
    return res.status(500).json({ message: "Ошибка сервера при аутентификации" });
  }
}

// Проверка прав администратора
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    return res.status(401).json({ message: "Необходима авторизация" });
  }

  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ message: "Доступ запрещен. Требуются права администратора." });
  }

  next();
}