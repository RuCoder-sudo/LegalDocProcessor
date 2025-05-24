import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  firstName?: string;
  lastName?: string;
}

export default function AuthForms() {
  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" });
  const [registerData, setRegisterData] = useState<RegisterData>({ 
    email: "", 
    password: "", 
    firstName: "", 
    lastName: "" 
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка входа");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Переходим в соответствующий раздел в зависимости от роли
      setTimeout(() => {
        if (data.user?.role === 'admin') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка входа",
        description: error.message || "Неверный email или пароль",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка регистрации");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Успешная регистрация",
        description: "Аккаунт создан! Добро пожаловать!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Переходим в личный кабинет после регистрации
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Попробуйте другой email",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Заполните все поля",
        description: "Email и пароль обязательны",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.password) {
      toast({
        title: "Заполните все поля",
        description: "Email и пароль обязательны",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(registerData);
  };

  return (
    <div className="flex items-center justify-center min-h-[600px] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Добро пожаловать</CardTitle>
          <CardDescription>
            Войдите в аккаунт или создайте новый
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Вход..." : "Войти"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstname">Имя</Label>
                    <Input
                      id="register-firstname"
                      placeholder="Иван"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-lastname">Фамилия</Label>
                    <Input
                      id="register-lastname"
                      placeholder="Иванов"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Создание..." : "Создать аккаунт"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}