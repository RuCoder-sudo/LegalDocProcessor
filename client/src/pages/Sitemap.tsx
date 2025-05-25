import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/hooks/useAuth";

import { 
  Home, 
  FileText, 
  Crown, 
  Eye, 
  Newspaper, 
  Phone, 
  MessageSquare,
  HelpCircle,
  Shield,
  Scale,
  Settings,
  Users
} from "lucide-react";

const SITEMAP_SECTIONS = [
  {
    title: "Основные страницы",
    icon: <Home className="h-5 w-5" />,
    links: [
      { href: "/", title: "Главная страница", description: "Обзор сервиса и основные функции" },
      { href: "/generator", title: "Генератор документов", description: "Создание юридических документов" },
      { href: "/examples", title: "Примеры документов", description: "Образцы созданных документов" },
    ]
  },
  {
    title: "Юридические документы",
    icon: <FileText className="h-5 w-5" />,
    links: [
      { href: "/examples?type=privacy", title: "Политика конфиденциальности", description: "152-ФЗ совместимый документ" },
      { href: "/examples?type=terms", title: "Пользовательское соглашение", description: "Условия использования сайта" },
      { href: "/examples?type=consent", title: "Согласие на обработку ПД", description: "Форма согласия пользователя" },
      { href: "/examples?type=offer", title: "Публичная оферта", description: "Условия продажи товаров/услуг" },
      { href: "/examples?type=cookie", title: "Политика Cookie", description: "Информация об использовании cookie" },
      { href: "/examples?type=return", title: "Политика возврата", description: "Правила возврата товаров и средств" },
      { href: "/examples?type=charter", title: "Устав сайта", description: "Правила поведения и использования платформы" },
    ]
  },
  {
    title: "Информация и поддержка",
    icon: <HelpCircle className="h-5 w-5" />,
    links: [
      { href: "/help", title: "Справочный центр", description: "Часто задаваемые вопросы и руководства" },
      { href: "/news", title: "Новости и обновления", description: "Последние новости в сфере права" },
      { href: "/contacts", title: "Контакты", description: "Способы связи с нами" },
      { href: "/feedback", title: "Обратная связь", description: "Форма для предложений и отзывов" },
    ]
  },
  {
    title: "Правовая информация",
    icon: <Shield className="h-5 w-5" />,
    links: [
      { href: "/privacy", title: "Политика конфиденциальности", description: "Как мы обрабатываем ваши данные" },
      { href: "/terms", title: "Пользовательское соглашение", description: "Условия использования сервиса" },
      { href: "/important", title: "Отказ от ответственности", description: "Важная правовая информация" },
    ]
  }
];

export default function Sitemap() {
  const { user, isAuthenticated } = useAuth();

  const userSections = isAuthenticated ? [
    {
      title: "Личный кабинет",
      icon: <Users className="h-5 w-5" />,
      links: [
        { href: "/", title: "Мои документы", description: "Управление созданными документами" },
        { href: "/", title: "Настройки профиля", description: "Редактирование данных профиля" },
      ]
    }
  ] : [];

  const adminSections = user?.role === 'admin' ? [
    {
      title: "Администрирование",
      icon: <Settings className="h-5 w-5" />,
      links: [
        { href: "/admin", title: "Панель управления", description: "Управление системой" },
      ]
    }
  ] : [];

  const allSections = [...SITEMAP_SECTIONS, ...userSections, ...adminSections];

  return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-blue-500/10 p-4">
                <Scale className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Карта сайта
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Полный обзор всех страниц и разделов ЮрДок Генератора
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">7</div>
                <p className="text-sm text-muted-foreground">Типов документов</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">10+</div>
                <p className="text-sm text-muted-foreground">Типов документов</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <HelpCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">20+</div>
                <p className="text-sm text-muted-foreground">Вопросов в справке</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Newspaper className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">∞</div>
                <p className="text-sm text-muted-foreground">Правовых новостей</p>
              </CardContent>
            </Card>
          </div>

          {/* Sitemap Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {allSections.map((section, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2">
                      {section.icon}
                    </div>
                    {section.title}
                  </CardTitle>
                  <CardDescription>
                    {section.links.length} страниц{section.links.length === 1 ? 'а' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex items-start justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link 
                              href={link.href}
                              className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {link.title}
                            </Link>

                          </div>
                          <p className="text-sm text-muted-foreground">
                            {link.description}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={link.href}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Information */}
          <div className="mt-12">
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <Scale className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      О ЮрДок Генераторе
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                      Профессиональная платформа для автоматического создания юридических документов 
                      в соответствии с российским законодательством. Мы помогаем владельцам сайтов 
                      соблюдать требования 152-ФЗ и других правовых норм.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-800 dark:text-blue-200">
                          Поддержка: rucoder.rf@yandex.ru
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-800 dark:text-blue-200">
                          +7 (985) 985-53-97
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-6">Быстрые действия</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/generator">
                  <FileText className="mr-2 h-5 w-5" />
                  Создать документ
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/examples">
                  <Eye className="mr-2 h-5 w-5" />
                  Посмотреть примеры
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/help">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Получить помощь
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
}