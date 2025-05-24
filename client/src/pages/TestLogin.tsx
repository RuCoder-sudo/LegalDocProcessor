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
      
      // Принудительно устанавливаем cookie
      if (data.token) {
        document.cookie = `auth-token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        console.log("Token manually set:", data.token);
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Тестовый вход выполнен!",
        description: "Админ вошел в систему, токен установлен"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Подождем немного перед переходом
      setTimeout(() => {
        window.location.href = "/admin";
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