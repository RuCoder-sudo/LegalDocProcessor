import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, FileText, Download, Eye, Trash2, Crown, Zap } from "lucide-react";
import { useState } from "react";
import DocumentWizard from "@/components/DocumentWizard";
import DocumentViewer from "@/components/DocumentViewer";
import Layout from "@/components/Layout";

export default function Dashboard() {
  const { user } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const { data: documents = [], refetch } = useQuery({
    queryKey: ["/api/user/documents"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
            <p className="text-muted-foreground">Войдите в систему для доступа к личному кабинету</p>
          </div>
        </div>
      </Layout>
    );
  }

  const usagePercentage = user.documentsLimit > 0 
    ? (user.documentsCreated / user.documentsLimit) * 100 
    : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Добро пожаловать, {user.firstName || user.email}!
            </h1>
            <p className="text-muted-foreground">
              Управляйте своими документами и подпиской
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Подписка</CardTitle>
                {user.subscription === 'premium' ? <Crown className="h-4 w-4 text-yellow-500" /> : 
                 user.subscription === 'ultra' ? <Zap className="h-4 w-4 text-purple-500" /> : null}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {user.subscription === 'free' && 'Бесплатная'}
                  {user.subscription === 'premium' && 'Премиум'}
                  {user.subscription === 'ultra' && 'Ультра'}
                </div>
                <Badge variant={user.subscription === 'free' ? 'secondary' : 'default'} className="mt-2">
                  {user.subscription === 'free' && 'Базовый доступ'}
                  {user.subscription === 'premium' && 'Полный доступ'}
                  {user.subscription === 'ultra' && 'Максимальный доступ'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Документы</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.documentsCreated}
                  {user.documentsLimit > 0 && ` / ${user.documentsLimit}`}
                </div>
                {user.documentsLimit > 0 && (
                  <Progress value={usagePercentage} className="mt-2" />
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {user.documentsLimit > 0 
                    ? `Использовано ${Math.round(usagePercentage)}%`
                    : 'Безлимитно'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Действия</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setWizardOpen(true)}
                  className="w-full"
                  disabled={user.documentsLimit > 0 && user.documentsCreated >= user.documentsLimit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать документ
                </Button>
                {user.documentsLimit > 0 && user.documentsCreated >= user.documentsLimit && (
                  <p className="text-xs text-destructive mt-2">
                    Лимит документов исчерпан. Обновите подписку.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upgrade Banner for Free Users */}
          {user.subscription === 'free' && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
              <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Обновите до Премиум
                </CardTitle>
                <CardDescription className="text-yellow-700 dark:text-yellow-300">
                  Получите безлимитное создание документов, QR-коды, расширенные шаблоны и экспорт без водяных знаков
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  Обновить сейчас
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Мои документы</CardTitle>
              <CardDescription>
                Все созданные вами документы
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Нет документов</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте свой первый документ, чтобы начать работу
                  </p>
                  <Button onClick={() => setWizardOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать документ
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Просмотр
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Скачать
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Document Wizard */}
        <DocumentWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          onSuccess={() => {
            setWizardOpen(false);
            refetch();
          }}
        />
      </div>
    </Layout>
  );
}