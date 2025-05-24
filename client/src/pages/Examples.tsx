import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import PremiumGate from "@/components/PremiumGate";
import { useAuth } from "@/hooks/useAuth";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { DocumentTemplate } from "@/lib/types";
import { 
  Eye, 
  Copy, 
  Download, 
  FileText, 
  Building2, 
  GraduationCap, 
  Stethoscope,
  Crown
} from "lucide-react";

export default function Examples() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState("privacy");
  const [copiedContent, setCopiedContent] = useState("");

  // Get type from URL params if available
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const typeFromUrl = urlParams.get('type');
  
  useEffect(() => {
    if (typeFromUrl && DOCUMENT_TYPES[typeFromUrl as keyof typeof DOCUMENT_TYPES]) {
      setSelectedType(typeFromUrl);
    }
  }, [typeFromUrl]);

  const { data: templates = [], isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const { data: exampleData } = useQuery({
    queryKey: ["/api/templates", selectedType, "example"],
    enabled: !!selectedType,
  });

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedContent(content);
    setTimeout(() => setCopiedContent(""), 2000);
  };

  const getExampleContent = (type: string) => {
    const examples = {
      privacy: {
        title: "Политика конфиденциальности",
        industry: "Интернет-магазин",
        content: `ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ

1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Настоящая Политика конфиденциальности (далее — Политика) действует в отношении информации, которую ООО "Пример Интернет-Магазин" (ИНН 1234567890) (далее — Оператор) может получить о Пользователе во время использования сайта example-shop.ru.

1.2. Использование сайта означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки его персональных данных.

2. ПЕРСОНАЛЬНЫЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЕЙ

2.1. В рамках настоящей Политики под персональными данными понимается:
- Персональные данные, которые Пользователь предоставляет о себе самостоятельно при регистрации или оформлении заказа
- Данные об IP-адресе, информация из cookies, данные о браузере
- Статистическая информация о действиях пользователя на сайте

3. ЦЕЛИ СБОРА ПЕРСОНАЛЬНЫХ ДАННЫХ

Оператор собирает и использует персональные данные в следующих целях:
- Обработка заказов и доставка товаров
- Предоставление клиентской поддержки
- Информирование о новых товарах и акциях
- Улучшение качества сервиса

4. ОБРАБОТКА ПЕРСОНАЛЬНЫХ ДАННЫХ

4.1. Обработка персональных данных пользователя осуществляется в соответствии с законодательством Российской Федерации.

4.2. Оператор обрабатывает персональные данные пользователя в случае:
- Заполнения пользователем форм на сайте
- Оформления заказа на товары или услуги
- Регистрации на сайте или подписки на рассылку

5. КОНТАКТНАЯ ИНФОРМАЦИЯ

По вопросам обработки персональных данных обращайтесь:
Email: privacy@example-shop.ru
Адрес: г. Москва, ул. Примерная, д. 1, офис 101

Дата вступления в силу: ${new Date().toLocaleDateString('ru-RU')}`
      },
      terms: {
        title: "Пользовательское соглашение",
        industry: "Образовательная платформа",
        content: `ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ

1. ТЕРМИНЫ И ОПРЕДЕЛЕНИЯ

Сайт — интернет-ресурс, расположенный по адресу education-platform.ru, принадлежащий ООО "Образовательная Платформа".

2. ПРЕДМЕТ СОГЛАШЕНИЯ

2.1. Администрация предоставляет Пользователю право использования Сайта следующими способами:
- Просмотр и изучение образовательных материалов
- Участие в онлайн-курсах и вебинарах
- Получение сертификатов о прохождении курсов
- Использование интерактивных инструментов обучения

3. ПРАВА И ОБЯЗАННОСТИ ПОЛЬЗОВАТЕЛЯ

3.1. Пользователь имеет право:
- Получать доступ к образовательному контенту
- Задавать вопросы преподавателям
- Получать техническую поддержку
- Получать сертификаты о прохождении курсов

3.2. Пользователь обязуется:
- Соблюдать условия настоящего Соглашения
- Не нарушать авторские права на материалы
- Не передавать свои учетные данные третьим лицам

4. ОТВЕТСТВЕННОСТЬ СТОРОН

4.1. Администрация не несет ответственности за временные технические сбои и перерывы в работе сайта.

4.2. Пользователь несет ответственность за сохранность своих данных для доступа на сайт.

5. КОНТАКТНАЯ ИНФОРМАЦИЯ

ООО "Образовательная Платформа"
ИНН: 0987654321
Адрес: г. Санкт-Петербург, ул. Учебная, д. 5
Email: info@education-platform.ru`
      },
      consent: {
        title: "Согласие на обработку персональных данных",
        industry: "Медицинский центр",
        content: `СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ

Я, _____________________, даю согласие ООО "Медицинский Центр Здоровье" на обработку моих персональных данных.

ПЕРЕЧЕНЬ ПЕРСОНАЛЬНЫХ ДАННЫХ:
- Фамилия, имя, отчество
- Дата рождения
- Паспортные данные
- Адрес регистрации и фактического проживания
- Контактный телефон, email
- Медицинская информация
- Данные полиса ОМС/ДМС

ЦЕЛИ ОБРАБОТКИ:
- Предоставление медицинских услуг
- Ведение медицинской документации
- Информирование о медицинских услугах
- Исполнение договорных обязательств
- Соблюдение требований законодательства

СОГЛАСИЕ РАСПРОСТРАНЯЕТСЯ НА СЛЕДУЮЩИЕ ДЕЙСТВИЯ:
- Сбор, запись, систематизация, накопление, хранение
- Уточнение (обновление, изменение), извлечение, использование
- Передача (распространение, предоставление, доступ)
- Обезличивание, блокирование, удаление, уничтожение

Согласие действует до его отзыва субъектом персональных данных.

Дата: ___________        Подпись: ___________`
      }
    };

    return examples[type as keyof typeof examples] || examples.privacy;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 to-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Примеры документов
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Изучите готовые примеры юридических документов, созданные нашим генератором
            </p>
          </div>
        </div>
      </section>

      {/* Document Examples */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedType} onValueChange={setSelectedType} className="space-y-8">
            {/* Tabs Navigation */}
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {Object.entries(DOCUMENT_TYPES).map(([key, type]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    <i className={`${type.icon} mr-1`}></i>
                    <span className="hidden sm:inline">{type.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            {Object.entries(DOCUMENT_TYPES).map(([key, type]) => (
              <TabsContent key={key} value={key}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg bg-${type.color}-500/10 p-2`}>
                          <i className={`${type.icon} text-xl text-${type.color}-500`}></i>
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{type.name}</CardTitle>
                          <CardDescription>
                            Пример для {getExampleContent(key).industry}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Eye className="w-3 h-3 mr-1" />
                          Пример
                        </Badge>
                        <Badge variant="outline">
                          {getExampleContent(key).industry}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Document Preview */}
                    <div className="border rounded-lg">
                      <div className="border-b bg-muted/50 px-4 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Предварительный просмотр</span>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyText(getExampleContent(key).content)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              {copiedContent === getExampleContent(key).content ? "Скопировано!" : "Копировать"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-96 p-6">
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                            {getExampleContent(key).content}
                          </pre>
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Полный просмотр
                      </Button>
                      
                      {user?.subscription === 'premium' || user?.role === 'admin' ? (
                        <>
                          <Button>
                            <Download className="mr-2 h-4 w-4" />
                            Скачать PDF
                          </Button>
                          <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Скачать DOC
                          </Button>
                        </>
                      ) : (
                        <PremiumGate
                          feature="Экспорт документов"
                          description="Скачивание в PDF/DOC доступно только для премиум-пользователей"
                          showUpgrade={false}
                        >
                          <Button disabled>
                            <Download className="mr-2 h-4 w-4" />
                            Скачать PDF
                          </Button>
                        </PremiumGate>
                      )}
                    </div>

                    <Separator />

                    {/* Document Info */}
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">Тип документа</h4>
                        <p className="text-muted-foreground">{type.name}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Отрасль</h4>
                        <p className="text-muted-foreground">{getExampleContent(key).industry}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Соответствие</h4>
                        <p className="text-muted-foreground">152-ФЗ, актуальное законодательство РФ</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Industry Examples */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Отраслевые решения
            </h2>
            <p className="text-xl text-muted-foreground">
              Специализированные шаблоны для разных сфер деятельности
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>E-commerce</CardTitle>
                    <CardDescription>Интернет-магазины</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Политика возврата товаров</li>
                  <li>• Условия доставки</li>
                  <li>• Обработка платежных данных</li>
                  <li>• Защита покупателей</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <GraduationCap className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Образование</CardTitle>
                    <CardDescription>Онлайн-курсы</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Условия обучения</li>
                  <li>• Сертификация</li>
                  <li>• Авторские права на контент</li>
                  <li>• Доступ к материалам</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-500/10 p-2">
                    <Stethoscope className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <CardTitle>Медицина</CardTitle>
                    <CardDescription>Медицинские услуги</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Согласие на лечение</li>
                  <li>• Медицинская тайна</li>
                  <li>• Обработка биометрии</li>
                  <li>• Телемедицина</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Готовы создать свой документ?</CardTitle>
              <CardDescription>
                Используйте наш генератор для создания персонализированных юридических документов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="/api/login">
                    <FileText className="mr-2 h-5 w-5" />
                    Создать документ
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/premium">
                    <Crown className="mr-2 h-5 w-5" />
                    Узнать о премиум
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Все документы соответствуют актуальному законодательству РФ
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
