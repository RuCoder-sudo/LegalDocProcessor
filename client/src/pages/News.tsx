import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { BlogPost } from "@/lib/types";
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Newspaper,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  TrendingUp
} from "lucide-react";

export default function News() {
  const [match, params] = useRoute("/news/:slug");
  const slug = params?.slug;
  
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  // Mock news data for demonstration
  const mockNews = [
    {
      id: 1,
      title: "Изменения в 152-ФЗ с 2025 года",
      slug: "changes-152-fz-2025",
      excerpt: "Вступают в силу новые требования к обработке персональных данных. Обязательное уведомление об инцидентах безопасности теперь должно производиться в течение 24 часов.",
      content: "",
      category: "legal_news",
      tags: ["152-ФЗ", "персональные данные", "2025"],
      publishedAt: "2024-12-15T10:00:00Z",
      createdAt: "2024-12-15T10:00:00Z"
    },
    {
      id: 2,
      title: "Новая судебная практика по Cookie",
      slug: "cookie-court-practice",
      excerpt: "Верховный суд разъяснил требования к уведомлениям об использовании файлов cookie на сайтах. Теперь согласие должно быть явным и информированным.",
      content: "",
      category: "legal_news",
      tags: ["cookie", "судебная практика", "согласие"],
      publishedAt: "2024-12-10T14:30:00Z",
      createdAt: "2024-12-10T14:30:00Z"
    },
    {
      id: 3,
      title: "Увеличение штрафов за нарушения",
      slug: "increased-fines-violations",
      excerpt: "Роскомнадзор объявил о повышении штрафов за нарушение требований к обработке персональных данных. Для юридических лиц штрафы увеличены до 6 млн рублей.",
      content: "",
      category: "legal_news",
      tags: ["штрафы", "Роскомнадзор", "нарушения"],
      publishedAt: "2024-12-05T09:15:00Z",
      createdAt: "2024-12-05T09:15:00Z"
    },
    {
      id: 4,
      title: "Как правильно составить политику конфиденциальности",
      slug: "how-to-write-privacy-policy",
      excerpt: "Пошаговое руководство по созданию политики конфиденциальности, соответствующей требованиям 152-ФЗ. Основные разделы и обязательные пункты.",
      content: "",
      category: "guides",
      tags: ["руководство", "политика конфиденциальности", "152-ФЗ"],
      publishedAt: "2024-11-28T16:45:00Z",
      createdAt: "2024-11-28T16:45:00Z"
    },
    {
      id: 5,
      title: "Часто задаваемые вопросы о 152-ФЗ",
      slug: "faq-152-fz",
      excerpt: "Ответы на самые популярные вопросы о федеральном законе о персональных данных. Кто должен соблюдать, какие данные подпадают под закон, как получить согласие.",
      content: "",
      category: "faq",
      tags: ["FAQ", "152-ФЗ", "вопросы"],
      publishedAt: "2024-11-20T11:20:00Z",
      createdAt: "2024-11-20T11:20:00Z"
    },
    {
      id: 6,
      title: "Обновление шаблонов документов",
      slug: "template-updates",
      excerpt: "В систему добавлены новые шаблоны документов для криптовалютных проектов и финтех-компаний. Обновлены существующие шаблоны в соответствии с последними изменениями.",
      content: "",
      category: "updates",
      tags: ["обновления", "шаблоны", "финтех"],
      publishedAt: "2024-11-15T13:00:00Z",
      createdAt: "2024-11-15T13:00:00Z"
    }
  ];

  const newsToShow = posts.length > 0 ? posts : mockNews;

  const getCategoryInfo = (category: string) => {
    return NEWS_CATEGORIES[category as keyof typeof NEWS_CATEGORIES] || NEWS_CATEGORIES.legal_news;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      legal_news: AlertTriangle,
      guides: BookOpen,
      updates: TrendingUp,
      faq: HelpCircle,
    };
    return icons[category as keyof typeof icons] || AlertTriangle;
  };

  // If slug is provided, show individual article
  if (slug) {
    const article = newsToShow.find(post => post.slug === slug);
    
    if (!article) {
      return (
        <div className="min-h-screen bg-background">
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">Статья не найдена</h1>
              <p className="text-muted-foreground mb-8">Запрашиваемая статья не существует или была удалена.</p>
              <Button asChild>
                <Link href="/news">Вернуться к новостям</Link>
              </Button>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" className="mb-6" asChild>
              <Link href="/news">← Вернуться к новостям</Link>
            </Button>
            
            <article>
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge>{getCategoryInfo(article.category).name}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(article.publishedAt || article.createdAt)}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-4">{article.title}</h1>
                <p className="text-xl text-muted-foreground">{article.excerpt}</p>
              </header>
              
              <div className="prose max-w-none">
                <p>Полный текст статьи будет доступен после подключения к системе управления контентом.</p>
                <p>Пока что отображается краткое описание: {article.excerpt}</p>
              </div>
              
              {article.tags && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4">Теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>
      </div>
    );
  }

  const groupedNews = newsToShow.reduce((acc, post) => {
    const category = post.category || 'legal_news';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(post);
    return acc;
  }, {} as Record<string, typeof newsToShow>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 to-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-primary/10 p-4">
                <Newspaper className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Правовые новости
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Следите за изменениями в законодательстве и обновляйте свои документы своевременно
            </p>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {newsToShow.length > 0 && (
            <Card className="mb-12 border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Главная новость
                    </Badge>
                    <CardTitle className="text-2xl md:text-3xl">{newsToShow[0].title}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {newsToShow[0].excerpt}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(newsToShow[0].publishedAt || newsToShow[0].createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {newsToShow[0].tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button asChild>
                  <Link href={`/news/${newsToShow[0].slug}`}>
                    Читать полностью
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* News by Category */}
          <div className="space-y-12">
            {Object.entries(groupedNews).map(([category, categoryPosts]) => {
              const categoryInfo = getCategoryInfo(category);
              const IconComponent = getCategoryIcon(category);
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`rounded-lg bg-${categoryInfo.color}-500/10 p-2`}>
                      <IconComponent className={`h-6 w-6 text-${categoryInfo.color}-500`} />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{categoryInfo.name}</h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryPosts.slice(category === (newsToShow[0]?.category || 'legal_news') ? 1 : 0).map((post) => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-${categoryInfo.color}-700 border-${categoryInfo.color}-200 bg-${categoryInfo.color}-50`}
                            >
                              {categoryInfo.name}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg line-clamp-2">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-3">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{post.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            <Button variant="ghost" size="sm" className="p-0 h-auto" asChild>
                              <Link href={`/news/${post.slug}`}>
                                Читать полностью
                                <ArrowRight className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Подписка на новости</CardTitle>
              <CardDescription>
                Получайте уведомления о важных изменениях в законодательстве
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <i className="fas fa-crown text-premium text-xl"></i>
                  <span className="font-semibold">Премиум функция</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Email-уведомления о правовых новостях доступны для премиум-пользователей
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link href="/premium">
                      Перейти на премиум
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://t.me/RussCoder" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-telegram mr-2"></i>
                      Связаться с @RussCoder
                    </a>
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Премиум-пользователи получают персональные уведомления об изменениях, 
                влияющих на их документы
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}