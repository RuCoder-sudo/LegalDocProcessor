import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function TestLogin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const testAdminLogin = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/test/login-admin", {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Ошибка тестового входа");
      }
      const data = await response.json();
      
      // Принудительно устанавливаем cookie и localStorage
      if (data.token) {
        // Установка в cookie
        document.cookie = `auth-token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        
        // Сохраняем токен в localStorage для использования в заголовках
        localStorage.setItem('auth-token', data.token);
        
        console.log("Admin token set in both cookie and localStorage:", data.token);
        
        // Переопределяем fetch чтобы автоматически добавлять токен
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
          const newOptions = {...options};
          newOptions.headers = newOptions.headers || {};
          
          // Добавляем заголовок авторизации
          if (typeof newOptions.headers === 'object') {
            // @ts-ignore - игнорируем ошибки типизации
            newOptions.headers['Authorization'] = `Bearer ${data.token}`;
          }
          
          return originalFetch(url, newOptions);
        };
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Тестовый вход выполнен!",
        description: "Админ вошел в систему, токен установлен"
      });
      
      // Обновляем кэш запросов для обновления состояния авторизации
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Проверяем авторизацию перед переходом в админку
      setTimeout(() => {
        fetch("/api/auth/user", {
          headers: {
            "Authorization": `Bearer ${data.token}`
          },
          credentials: "include"
        })
        .then(res => res.json())
        .then(userData => {
          console.log("Успешная проверка авторизации:", userData);
          
          if (userData && userData.role === "admin") {
            console.log("Права администратора подтверждены, переходим в админ-панель");
            window.location.href = "/admin";
          } else {
            toast({
              title: "Внимание",
              description: "Переход в админ-панель...",
              variant: "default"
            });
            window.location.href = "/admin";
          }
        })
        .catch(err => {
          console.error("Ошибка при проверке авторизации:", err);
          // Всё равно пробуем перейти в админку
          window.location.href = "/admin";
        });
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const regularLogin = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: "rucoder.rf@yandex.ru",
          password: "lizeR3056806"
        })
      });
      if (!response.ok) {
        throw new Error("Ошибка входа");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Вход выполнен!",
        description: "Добро пожаловать в систему"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/admin";
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Тестирование входа</CardTitle>
          <CardDescription>
            Тестовая страница для проверки системы авторизации
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => testAdminLogin.mutate()}
            disabled={testAdminLogin.isPending}
            className="w-full"
            variant="outline"
          >
            {testAdminLogin.isPending ? "Тест..." : "Тестовый вход админа"}
          </Button>
          
          <Button 
            onClick={() => regularLogin.mutate()}
            disabled={regularLogin.isPending}
            className="w-full"
          >
            {regularLogin.isPending ? "Вход..." : "Обычный вход админа"}
          </Button>
          
          <div className="text-center">
            <a href="/admin" className="text-sm text-blue-600 hover:underline">
              Перейти в админку
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}