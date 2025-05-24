import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CONTACT_INFO } from "@/lib/constants";
import { 
  MessageCircle, 
  Mail, 
  Globe, 
  Phone,
  Clock,
  Code,
  Headphones,
  Scale,
  MapPin,
  ExternalLink,
  AlertCircle
} from "lucide-react";

export default function Contacts() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 to-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-primary/10 p-4">
                <Phone className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Контакты
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Свяжитесь с нами для получения консультации или технической поддержки
            </p>
          </div>
        </div>
      </section>

      {/* Main Contacts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Developer Contact */}
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <Code className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Разработчик</CardTitle>
                    <CardDescription>{CONTACT_INFO.developer.name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Разработка сайтов, веб-приложений и автоматизация бизнеса
                </p>
                
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a 
                      href={`https://t.me/${CONTACT_INFO.developer.telegram.replace('@', '')}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {CONTACT_INFO.developer.telegram}
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </Button>

                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href={`mailto:${CONTACT_INFO.developer.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      {CONTACT_INFO.developer.email}
                    </a>
                  </Button>

                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a 
                      href={`https://${CONTACT_INFO.developer.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      {CONTACT_INFO.developer.website}
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </Button>

                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href={`tel:${CONTACT_INFO.developer.phone.replace(/[^\d+]/g, '')}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      {CONTACT_INFO.developer.phone}
                    </a>
                  </Button>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{CONTACT_INFO.support.hours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Support */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <Headphones className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl dark:text-white">Техподдержка</CardTitle>
                    <CardDescription>Помощь в использовании сервиса</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Решение технических вопросов и помощь в работе с платформой
                </p>
                
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a 
                      href={`https://wa.me/${CONTACT_INFO.developer.phone.replace(/[^\d]/g, '')}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-whatsapp mr-2 text-green-500"></i>
                      WhatsApp
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </Button>

                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a 
                      href={`https://t.me/${CONTACT_INFO.developer.telegram.replace('@', '')}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Telegram поддержка
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </Button>

                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href={`mailto:${CONTACT_INFO.developer.email}?subject=Техническая поддержка`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email поддержка
                    </a>
                  </Button>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-1">
                    <Clock className="h-3 w-3" />
                    Время ответа
                  </div>
                  <p className="text-xs text-green-600">
                    Обычно отвечаем в течение 2-4 часов в рабочее время
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Legal Consultation */}
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-3">
                    <Scale className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl dark:text-white">Юридические консультации</CardTitle>
                    <CardDescription>Правовая поддержка</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Консультации по вопросам соблюдения 152-ФЗ и правовым аспектам
                </p>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-crown text-purple-500"></i>
                    <span className="font-semibold text-purple-700">Только для премиум</span>
                  </div>
                  <p className="text-sm text-purple-600">
                    Юридические консультации доступны только для премиум-пользователей
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 w-4"></i>
                    <span>Консультации по 152-ФЗ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 w-4"></i>
                    <span>Проверка документов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 w-4"></i>
                    <span>Персональные рекомендации</span>
                  </div>
                </div>

                <Button className="w-full premium-gradient text-white" asChild>
                  <a href="/premium">
                    <i className="fas fa-crown mr-2"></i>
                    Перейти на премиум
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Business Information */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Информация о сервисе</CardTitle>
              <CardDescription>
                Подробная информация о ЮрДок Генератор и предоставляемых услугах
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">О платформе</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    ЮрДок Генератор — это профессиональная платформа для автоматического создания 
                    юридических документов в соответствии с российским законодательством. Мы помогаем 
                    владельцам сайтов соблюдать требования 152-ФЗ и других правовых норм.
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Основные услуги:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Создание политик конфиденциальности</li>
                      <li>• Генерация пользовательских соглашений</li>
                      <li>• Формы согласий на обработку ПД</li>
                      <li>• Публичные оферты</li>
                      <li>• Политики использования Cookie</li>
                      <li>• Правила возврата товаров</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Разработчик</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Code className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{CONTACT_INFO.developer.name}</p>
                        <p className="text-sm text-muted-foreground">Разработка веб-решений</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      Специализируемся на создании сайтов, веб-приложений и автоматизации 
                      бизнес-процессов. Опыт работы более 5 лет.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">React</Badge>
                      <Badge variant="secondary">Node.js</Badge>
                      <Badge variant="secondary">PostgreSQL</Badge>
                      <Badge variant="secondary">TypeScript</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Часто задаваемые вопросы</CardTitle>
              <CardDescription>
                Ответы на самые популярные вопросы о сервисе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Как получить премиум доступ?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Свяжитесь с {CONTACT_INFO.developer.telegram} в Telegram для обсуждения 
                      условий и стоимости премиум-плана.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Обновляются ли документы автоматически?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      В премиум-плане доступны уведомления об изменениях в законодательстве 
                      и рекомендации по обновлению документов.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Можно ли редактировать готовые документы?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Да, в премиум-плане доступно редактирование сгенерированных документов 
                      и экспорт в различные форматы.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Соответствуют ли документы актуальному законодательству?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Все шаблоны регулярно обновляются в соответствии с изменениями в 152-ФЗ 
                      и других нормативных актах.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Есть ли техническая поддержка?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Да, техническая поддержка доступна через Telegram, WhatsApp и email. 
                      Время ответа: 2-4 часа в рабочее время.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Нужна ли регистрация для просмотра примеров?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Нет, примеры документов доступны для просмотра без регистрации. 
                      Регистрация нужна только для создания персональных документов.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="text-center">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-800">Важная информация</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Документы, создаваемые на платформе, носят информационный характер. 
                    Для решения сложных правовых вопросов рекомендуется консультация с квалифицированным юристом.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Map Section (placeholder) */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Мы работаем удаленно</h2>
            <p className="text-muted-foreground mb-8">
              Наша команда работает в цифровом формате, что позволяет нам оперативно 
              решать задачи клиентов по всей России
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">География работы</h3>
                  <p className="text-sm text-muted-foreground">Вся территория РФ</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-green-500/10 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-1">Часовой пояс</h3>
                  <p className="text-sm text-muted-foreground">МСК (UTC+3)</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-blue-500/10 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold mb-1">Связь</h3>
                  <p className="text-sm text-muted-foreground">Telegram, Email, WhatsApp</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
