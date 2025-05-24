import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SUBSCRIPTION_PLANS, CONTACT_INFO } from "@/lib/constants";
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
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-primary/10 p-4">
                <Crown className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Тарифные планы
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Выберите план, который подходит именно вам. От базовых возможностей до премиум функций с персональной поддержкой.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Free Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl mb-2">Бесплатный</CardTitle>
                  <div className="text-4xl font-bold mb-2">₽0</div>
                  <CardDescription>навсегда</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">3 документа в месяц</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Базовые шаблоны</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Экспорт в PDF</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Email поддержка</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/auth">Начать бесплатно</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-primary shadow-xl relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">Популярный</Badge>
              </div>
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl mb-2">Премиум</CardTitle>
                  <div className="text-4xl font-bold mb-2">₽1,990</div>
                  <CardDescription>в месяц</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Безлимитные документы</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Расширенные шаблоны</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Пользовательские поля</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">QR-код генерация</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Чат-бот интеграция</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Приоритетная поддержка</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/contacts">Выбрать Премиум</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Ultra Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl mb-2">Ультра</CardTitle>
                  <div className="text-4xl font-bold mb-2">₽4,990</div>
                  <CardDescription>в месяц</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Все функции Премиум</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Персональный менеджер</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Консультации по законодательству</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Приоритет в обновлениях</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Индивидуальные шаблоны</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Связаться с юристом</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/contacts">Связаться с нами</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">Связаться с нами</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Telegram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`https://t.me/${CONTACT_INFO.developer.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    {CONTACT_INFO.developer.telegram}
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:${CONTACT_INFO.developer.email}`}>
                    {CONTACT_INFO.developer.email}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}