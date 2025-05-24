import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, AdminStats } from "@/lib/types";
import { 
  Users, 
  FileText, 
  Crown, 
  TrendingUp, 
  Shield, 
  Settings,
  UserCheck,
  Calendar,
  Activity
} from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Доступ запрещен
            </CardTitle>
            <CardDescription>
              У вас нет прав для доступа к админ-панели
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setRoleDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Роль обновлена",
        description: "Роль пользователя успешно изменена",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить роль пользователя",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (role: string) => {
    if (selectedUser) {
      updateRoleMutation.mutate({ userId: selectedUser.id, role });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      premium: "default", 
      user: "secondary"
    } as const;
    
    const labels = {
      admin: "Админ",
      premium: "Премиум",
      user: "Пользователь"
    };

    return (
      <Badge variant={variants[role as keyof typeof variants] || "secondary"}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  const getSubscriptionBadge = (subscription: string) => {
    return subscription === 'premium' ? (
      <Badge className="bg-premium text-white">
        <Crown className="w-3 h-3 mr-1" />
        Премиум
      </Badge>
    ) : (
      <Badge variant="outline">Бесплатный</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Админ-панель
            </h1>
            <p className="text-muted-foreground mt-1">
              Управление пользователями и мониторинг системы
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <UserCheck className="w-3 h-3 mr-1" />
            Администратор: {user.firstName} {user.lastName}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Всего пользователей</CardDescription>
              <CardTitle className="text-2xl">
                {statsLoading ? "..." : stats?.totalUsers || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-1 h-4 w-4" />
                <span>Зарегистрированных</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Премиум пользователи</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crown className="h-5 w-5 text-premium" />
                {statsLoading ? "..." : stats?.premiumUsers || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4" />
                <span>Активных подписок</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Создано документов</CardDescription>
              <CardTitle className="text-2xl">
                {statsLoading ? "..." : stats?.documentsCreated || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-1 h-4 w-4" />
                <span>Всего сгенерировано</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Конверсия в премиум</CardDescription>
              <CardTitle className="text-2xl">
                {statsLoading || !stats ? "..." : `${Math.round((stats.premiumUsers / stats.totalUsers) * 100)}%`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Activity className="mr-1 h-4 w-4" />
                <span>Показатель конверсии</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Управление пользователями
            </CardTitle>
            <CardDescription>
              Просмотр и редактирование информации о пользователях
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Подписка</TableHead>
                    <TableHead>Документов</TableHead>
                    <TableHead>Дата регистрации</TableHead>
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
                      <TableCell>{getRoleBadge(u.role)}</TableCell>
                      <TableCell>{getSubscriptionBadge(u.subscription)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{u.documentsCreated}</div>
                          {u.subscription === 'free' && (
                            <div className="text-xs text-muted-foreground">/ {u.documentsLimit}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(u.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog open={roleDialogOpen && selectedUser?.id === u.id} onOpenChange={(open) => {
                          setRoleDialogOpen(open);
                          if (!open) setSelectedUser(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUser(u)}
                            >
                              Изменить роль
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Изменить роль пользователя</DialogTitle>
                              <DialogDescription>
                                Изменение роли для {u.firstName} {u.lastName} ({u.email})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="role">Новая роль</Label>
                                <Select onValueChange={handleRoleChange} defaultValue={u.role}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Выберите роль" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">Пользователь</SelectItem>
                                    <SelectItem value="premium">Премиум</SelectItem>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                                <h4 className="font-medium mb-2">Описание ролей:</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                  <li>• <strong>Пользователь</strong> - базовый доступ</li>
                                  <li>• <strong>Премиум</strong> - расширенные возможности</li>
                                  <li>• <strong>Администратор</strong> - полный доступ</li>
                                </ul>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о системе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Версия:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Последнее обновление:</span>
                <span>{new Date().toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">База данных:</span>
                <span>PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус:</span>
                <Badge className="bg-green-500">Работает</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Экспорт статистики
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Просмотр логов
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Настройки системы
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
