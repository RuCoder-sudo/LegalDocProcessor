import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SUBSCRIPTION_LIMITS, CONTACT_INFO } from "@/lib/constants";
import { 
  Crown, 
  CheckCircle, 
  X, 
  Star,
  MessageCircle,
  Mail,
  Globe,
  Zap,
  Shield,
  Users,
  Phone
} from "lucide-react";

export default function Premium() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-premium/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-premium/10 p-4">
                <Crown className="h-12 w-12 text-premium" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Премиум возможности
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Раскройте полный потенциал платформы с неограниченными возможностями создания документов, 
              расширенными функциями и персональной поддержкой.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Сравнение тарифных планов
            </h2>
            <p className="text-xl text-muted-foreground">
              Выберите план, который подходит именно вам
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl text-gray-900 mb-2">Бесплатный</CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mb-2">0 ₽</div>
                  <CardDescription>Для начинающих</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-success">Включено:</h4>
                  <ul className="space-y-3">
                    {SUBSCRIPTION_LIMITS.free.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-muted-foreground">Ограничения:</h4>
                  <ul className="space-y-3">
                    {SUBSCRIPTION_LIMITS.free.restrictions.map((restriction, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{restriction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  asChild
                >
                  <Link href={isAuthenticated ? "/dashboard" : "/"}>
                    {isAuthenticated ? "Перейти в кабинет" : "Начать бесплатно"}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-premium relative overflow-hidden shadow-lg">
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-400 text-gray-900 font-semibold">
                  <Star className="w-3 h-3 mr-1" />
                  Рекомендуем
                </Badge>
              </div>
              
              <CardHeader className="premium-gradient text-white">
                <div className="text-center">
                  <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
                    <Crown className="h-6 w-6" />
                    Премиум
                  </CardTitle>
                  <div className="text-4xl font-bold mb-2">Договорная</div>
                  <CardDescription className="text-purple-100">
                    Индивидуальные условия
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-success">Все возможности:</h4>
                  <ul className="space-y-3">
                    {SUBSCRIPTION_LIMITS.premium.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-premium/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-premium" />
                    <span className="font-semibold text-premium">Эксклюзивные преимущества</span>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Персональный менеджер</li>
                    <li>• Консультации по законодательству</li>
                    <li>• Приоритет в обновлениях</li>
                    <li>• Индивидуальные шаблоны</li>
                  </ul>
                </div>

                <Button className="w-full premium-gradient text-white font-semibold">
                  <Crown className="mr-2 h-4 w-4" />
                  Связаться с разработчиком
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Features Details */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Почему выбирают премиум?
            </h2>
            <p className="text-xl text-muted-foreground">
              Профессиональные инструменты для серьезного бизнеса
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Zap className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>Безлимитные документы</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Создавайте неограниченное количество юридических документов без месячных лимитов
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <Shield className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle>Экспорт в любые форматы</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  PDF, DOC, HTML экспорт с возможностью редактирования и кастомизации
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>Персональная поддержка</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Прямая связь с разработчиком и юридическими консультантами
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Готовы перейти на премиум?
            </h2>
            <p className="text-xl text-muted-foreground">
              Свяжитесь с нашим разработчиком для обсуждения условий
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-premium/20 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Контакты для премиум-подписки</CardTitle>
                <CardDescription>
                  Мы обсудим ваши потребности и предложим индивидуальные условия
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Developer Contact */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="rounded-full bg-blue-500/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <i className="fas fa-code text-2xl text-blue-500"></i>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Разработчик</h3>
                      <p className="text-muted-foreground">РУКОДЕР - Разработка сайтов</p>
                    </div>

                    <div className="space-y-4">
                      <Button className="w-full" variant="outline" asChild>
                        <a 
                          href={`https://t.me/${CONTACT_INFO.developer.telegram.replace('@', '')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Telegram: {CONTACT_INFO.developer.telegram}
                        </a>
                      </Button>

                      <Button className="w-full" variant="outline" asChild>
                        <a href={`mailto:${CONTACT_INFO.developer.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          {CONTACT_INFO.developer.email}
                        </a>
                      </Button>

                      <Button className="w-full" variant="outline" asChild>
                        <a 
                          href={`https://${CONTACT_INFO.developer.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          {CONTACT_INFO.developer.website}
                        </a>
                      </Button>

                      <Button className="w-full" variant="outline" asChild>
                        <a href={`tel:${CONTACT_INFO.developer.phone.replace(/[^\d+]/g, '')}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          {CONTACT_INFO.developer.phone}
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Premium Benefits */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="rounded-full bg-premium/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Crown className="h-8 w-8 text-premium" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Что вы получите</h3>
                      <p className="text-muted-foreground">Индивидуальный подход к каждому клиенту</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm">Персональная настройка под ваш бизнес</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm">Консультации по юридическим вопросам</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm">Приоритетная техническая поддержка</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm">Гибкие условия оплаты</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Рабочие часы: {CONTACT_INFO.support.hours} ({CONTACT_INFO.support.timezone})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Обычно отвечаем в течение 2-4 часов в рабочее время
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
