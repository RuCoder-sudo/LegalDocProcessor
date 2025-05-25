import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import DocumentWizard from "@/components/DocumentWizard";
import PremiumGate from "@/components/PremiumGate";
import { DOCUMENT_TYPES, SUBSCRIPTION_PLANS } from "@/lib/constants";
import { UserDocument, Notification } from "@/lib/types";
import { 
  Plus, 
  FileText, 
  Crown, 
  Bell, 
  Download, 
  Eye, 
  Calendar,
  TrendingUp,
  AlertCircle 
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);

  const { data: documents = [], isLoading: documentsLoading } = useQuery<UserDocument[]>({
    queryKey: ["/api/documents"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const unreadNotifications = notifications.filter(n => !n.isRead);
  // All users have full access
  const isFreePlan = false;
  const documentsUsed = user?.documentsCreated || 0;
  const documentsLimit = 999;
  const usagePercentage = 0;

  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Добро пожаловать, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Управляйте своими документами и следите за обновлениями
            </p>
          </div>
          <div className="flex gap-3">
            {unreadNotifications.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Уведомления ({unreadNotifications.length})
                </Link>
              </Button>
            )}
            <Button onClick={() => setWizardOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать документ
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Всего документов</CardDescription>
                  <CardTitle className="text-2xl">{documents.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    <span>Создано документов</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Статус подписки</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {user?.subscription === 'premium' ? (
                      <>
                        <Crown className="h-5 w-5 text-premium" />
                        Премиум
                      </>
                    ) : (
                      'Бесплатный'
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user?.subscription === 'free' && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/premium">Перейти на премиум</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Уведомления</CardDescription>
                  <CardTitle className="text-2xl">{unreadNotifications.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Bell className="mr-1 h-4 w-4" />
                    <span>Непрочитанных</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Limit for Free Users */}
            {isFreePlan && (
              <Card className="border-warning/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      Лимит документов
                    </CardTitle>
                    <Badge variant="outline">{documentsUsed} из {documentsLimit}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={usagePercentage} className="mb-4" />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {documentsLimit - documentsUsed} документов осталось в этом месяце
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/premium">Увеличить лимит</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Последние документы</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/documents">Все документы</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="h-10 w-10 bg-muted rounded-lg"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{doc.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                              <Badge variant="secondary" className="text-xs">
                                {DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES]?.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user?.subscription === 'premium' ? (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" disabled>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Документов пока нет</h3>
                    <p className="text-muted-foreground mb-4">
                      Создайте свой первый юридический документ
                    </p>
                    <Button onClick={() => setWizardOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Создать документ
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="ghost"
                  onClick={() => setWizardOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Создать документ
                </Button>
                <Button className="w-full justify-start" variant="ghost" asChild>
                  <Link href="/examples">
                    <Eye className="mr-2 h-4 w-4" />
                    Посмотреть примеры
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="ghost" asChild>
                  <Link href="/news">
                    <Bell className="mr-2 h-4 w-4" />
                    Правовые новости
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Info */}
            <Card className={user?.subscription === 'premium' ? 'border-premium/20' : 'border-warning/20'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {user?.subscription === 'premium' ? (
                    <>
                      <Crown className="h-5 w-5 text-premium" />
                      Премиум план
                    </>
                  ) : (
                    'Бесплатный план'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user?.subscription === 'premium' ? (
                  <div className="space-y-3">
                    <ul className="text-sm space-y-2">
                      {SUBSCRIPTION_PLANS.premium.features.slice(0, 3).map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <i className="fas fa-check text-success w-4"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Separator />
                    <p className="text-xs text-muted-foreground">
                      Спасибо за использование премиум-плана!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ul className="text-sm space-y-2">
                      {SUBSCRIPTION_PLANS.free.features.slice(0, 3).map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <i className="fas fa-check text-success w-4"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Separator />
                    <Button className="w-full premium-gradient text-white" asChild>
                      <Link href="/premium">
                        <Crown className="mr-2 h-4 w-4" />
                        Перейти на премиум
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premium Features Preview */}
            {user?.subscription === 'free' && (
              <PremiumGate 
                feature="Расширенные возможности"
                description="Откройте полный потенциал платформы"
                showUpgrade={false}
              >
                <div></div>
              </PremiumGate>
            )}
          </div>
        </div>
      </div>

      {/* Document Wizard */}
      <DocumentWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen}
        onSuccess={() => {
          // Document created successfully
        }}
      />
    </div>
  );
}
