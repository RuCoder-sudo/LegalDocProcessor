import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AuthUser as User, AdminStats } from "@/lib/types";
import { 
  Users, 
  FileText, 
  Crown, 
  TrendingUp, 
  Shield, 
  Settings,
  UserCheck,
  Calendar,
  Activity,
  Bell,
  MessageSquare,
  Search,
  Edit,
  Trash,
  Plus,
  Send
} from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notificationText, setNotificationText] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");

  // Проверяем права доступа
  if (!user || user.role !== 'admin') {
    // Попробуем получить токен и проверить авторизацию с ним напрямую
    const getToken = () => {
      const localToken = localStorage.getItem('auth-token');
      if (localToken) return localToken;
      
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth-token') return value;
      }
      return null;
    };
    
    const token = getToken();
    if (token) {
      console.log("Найден токен, проверяем права доступа к админке...");
      
      // Сделаем запрос с токеном, чтобы проверить авторизацию
      setTimeout(() => {
        fetch("/api/auth/user", {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        })
        .then(res => {
          if (!res.ok) throw new Error("Ошибка авторизации");
          return res.json();
        })
        .then(data => {
          if (data && data.role === 'admin') {
            console.log("Доступ подтвержден через токен, обновляем страницу");
            window.location.reload();
          }
        })
        .catch(e => console.error("Ошибка проверки токена:", e));
      }, 500);
    }
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Доступ запрещен</CardTitle>
            <CardDescription className="text-center">
              У вас нет прав для доступа к панели администратора
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button asChild className="w-full">
              <a href="/test-login">Войти как администратор</a>
            </Button>
            <div className="text-sm text-gray-500">
              Если вы уже вошли как администратор, попробуйте обновить страницу
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Загрузка данных
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Мутации
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Роль пользователя обновлена" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const sendNotification = useMutation({
    mutationFn: async (data: { title: string; message: string; userId?: string }) => {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to send notification');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Уведомление отправлено" });
      setNotificationTitle("");
      setNotificationText("");
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Панель администратора</h1>
          <p className="text-muted-foreground">Управление пользователями, контентом и настройками</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Премиум пользователи</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.premiumUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Документов создано</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.documentsCreated || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активность</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+12%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>
                  Управление ролями пользователей и их подписками
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Подписка</TableHead>
                      <TableHead>Документы</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{u.firstName} {u.lastName}</div>
                            <div className="text-sm text-muted-foreground">ID: {u.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.subscription === 'premium' ? 'default' : 'outline'}>
                            {u.subscription}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.documentsCreated || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={u.role}
                              onValueChange={(role) => updateUserRole.mutate({ userId: u.id, role })}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Отправка уведомлений</CardTitle>
                <CardDescription>
                  Отправляйте уведомления всем пользователям или отдельным группам
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notif-title">Заголовок уведомления</Label>
                  <Input
                    id="notif-title"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="Добро пожаловать!"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notif-text">Текст уведомления</Label>
                  <Textarea
                    id="notif-text"
                    value={notificationText}
                    onChange={(e) => setNotificationText(e.target.value)}
                    placeholder="Введите текст уведомления..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => sendNotification.mutate({
                      title: notificationTitle,
                      message: notificationText
                    })}
                    disabled={!notificationTitle || !notificationText}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Отправить всем
                  </Button>
                  <Button variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Премиум пользователям
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление контентом</CardTitle>
                <CardDescription>
                  Статьи, шаблоны документов и другой контент
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button className="h-24 flex flex-col gap-2">
                    <Plus className="w-6 h-6" />
                    Добавить статью
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <Edit className="w-6 h-6" />
                    Редактировать шаблоны
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2">
                    <FileText className="w-6 h-6" />
                    Управление примерами
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO настройки</CardTitle>
                <CardDescription>
                  Управление метатегами, sitemap и настройками поисковой оптимизации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Мета-заголовок сайта</Label>
                  <Input placeholder="ЮрДок Генератор - Создание юридических документов" />
                </div>
                <div className="space-y-2">
                  <Label>Мета-описание</Label>
                  <Textarea placeholder="Автоматическое создание юридических документов в соответствии с 152-ФЗ..." />
                </div>
                <div className="space-y-2">
                  <Label>Ключевые слова</Label>
                  <Input placeholder="юридические документы, 152-ФЗ, политика конфиденциальности" />
                </div>
                <Button>Сохранить SEO настройки</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Системные настройки</CardTitle>
                <CardDescription>
                  Telegram бот, реферальная программа и другие настройки
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Telegram уведомления</Label>
                      <p className="text-sm text-muted-foreground">Отправка уведомлений через Telegram бота</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>Telegram Bot Token</Label>
                    <Input placeholder="Введите токен бота" type="password" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Реферальная программа</Label>
                      <p className="text-sm text-muted-foreground">Включить систему рефералов</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>Бонус за реферала (%)</Label>
                    <Input placeholder="10" type="number" />
                  </div>
                </div>

                <Button>Сохранить настройки</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}