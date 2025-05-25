import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Shield, 
  Zap, 
  Crown,
  Users,
  Download,
  QrCode,
  Settings,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Lightbulb,
  Target
} from "lucide-react";

const FAQ_ITEMS = [
  {
    category: "Начало работы",
    icon: <Lightbulb className="h-5 w-5" />,
    items: [
      {
        question: "Как зарегистрироваться в сервисе?",
        answer: "Нажмите кнопку 'Войти' в правом верхнем углу, затем выберите 'Регистрация'. Заполните форму с вашим email и паролем. После регистрации вы получите доступ ко всем функциям сервиса."
      },
      {
        question: "Сколько документов можно создать?",
        answer: "После регистрации вы можете создавать неограниченное количество документов."
      },
      {
        question: "Какие типы документов поддерживаются?",
        answer: "Мы поддерживаем: Политику конфиденциальности, Пользовательское соглашение, Согласие на обработку ПД, Публичную оферту, Политику Cookie, Политику возврата и Устав сайта."
      }
    ]
  },
  {
    category: "Создание документов",
    icon: <FileText className="h-5 w-5" />,
    items: [
      {
        question: "Как создать свой первый документ?",
        answer: "1. Войдите в личный кабинет\n2. Нажмите 'Создать документ'\n3. Выберите тип документа\n4. Заполните форму с данными компании\n5. Проверьте предварительный просмотр\n6. Сохраните документ"
      },
      {
        question: "Можно ли редактировать созданные документы?",
        answer: "Да! После регистрации вы можете редактировать документы неограниченное количество раз."
      },
      {
        question: "Как добавить логотип компании в документ?",
        answer: "Функция добавления логотипа доступна всем пользователям. В форме создания документа найдите раздел 'Брендинг' и загрузите ваш логотип."
      },
      {
        question: "Что такое расширенные шаблоны?",
        answer: "Расширенные шаблоны позволяют использовать более детализированные формы с дополнительными полями, такими как радио-кнопки для выбора типа владельца сайта, настройки прав пользователей и администрации."
      }
    ]
  },
  {
    category: "QR-коды и экспорт",
    icon: <QrCode className="h-5 w-5" />,
    items: [
      {
        question: "Как создать QR-код для документа?",
        answer: "QR-коды доступны всем пользователям. При создании документа отметьте опцию 'Создать QR-код'. Вы можете настроить данные для QR-кода и скачать его отдельно."
      },
      {
        question: "В каких форматах можно скачать документы?",
        answer: "После регистрации вы можете скачивать документы в форматах PDF, DOC и HTML."
      },
      {
        question: "Какие возможности экспорта доступны?",
        answer: "Все пользователи могут использовать любой доступный формат экспорта документов без ограничений."
      }
    ]
  },

  {
    category: "Техническая поддержка",
    icon: <Settings className="h-5 w-5" />,
    items: [
      {
        question: "Как связаться с поддержкой?",
        answer: "Email: rucoder.rf@yandex.ru\nTelegram: @RussCoder\nТелефон: +7 (985) 985-53-97\nФорма обратной связи на сайте\nВремя работы: Пн-Пт 9:00-18:00 МСК"
      },
      {
        question: "Как настроить Telegram уведомления?",
        answer: "В настройках профиля вы можете указать токен Telegram бота и ID канала для получения уведомлений о создании документов и других событиях."
      },
      {
        question: "Что делать если документ не генерируется?",
        answer: "1. Проверьте правильность заполнения всех обязательных полей\n2. Очистите кеш браузера\n3. Попробуйте выйти и снова войти в аккаунт\n4. Свяжитесь с поддержкой если проблема не решилась"
      }
    ]
  },
  {
    category: "Правовые вопросы",
    icon: <Shield className="h-5 w-5" />,
    items: [
      {
        question: "Соответствуют ли документы российскому законодательству?",
        answer: "Да, все наши шаблоны разработаны с учетом требований российского законодательства, включая 152-ФЗ 'О персональных данных' и другие нормативные акты."
      },
      {
        question: "Нужно ли дополнительно проверять документы у юриста?",
        answer: "Наши шаблоны покрывают стандартные случаи, но для специфических бизнес-процессов рекомендуем консультацию с юристом."
      },
      {
        question: "Как часто обновляются шаблоны?",
        answer: "Мы отслеживаем изменения в законодательстве и обновляем шаблоны по мере необходимости для всех пользователей."
      }
    ]
  }
];

const GUIDES = [
  {
    title: "Быстрый старт",
    description: "Создайте свой первый документ за 5 минут",
    icon: <Target className="h-6 w-6" />,
    steps: [
      "Зарегистрируйтесь или войдите в аккаунт",
      "Нажмите 'Создать документ' в личном кабинете", 
      "Выберите тип документа (например, Политика конфиденциальности)",
      "Заполните форму с данными вашей компании",
      "Проверьте предварительный просмотр",
      "Сохраните документ и скопируйте текст"
    ]
  },
  {
    title: "Настройка расширенных функций",
    description: "Максимально используйте возможности сервиса",
    icon: <Zap className="h-6 w-6" />,
    steps: [
      "В настройках профиля укажите данные для Telegram бота",
      "При создании документа включите генерацию QR-кода",
      "Используйте расширенные шаблоны с дополнительными опциями",
      "Настройте брендинг и добавьте логотип компании",
      "Экспортируйте документы в нужном формате",
      "Используйте различные форматы экспорта документов"
    ]
  },
  {
    title: "Работа с Уставом сайта",
    description: "Создание подробного устава для вашего веб-ресурса", 
    icon: <FileText className="h-6 w-6" />,
    steps: [
      "Выберите тип документа 'Устав сайта'",
      "Укажите тип владельца (физ. или юр. лицо)",
      "Определите является ли сайт СМИ",
      "Настройте права пользователей и администрации",
      "Выберите обязанности сторон из предложенных опций",
      "Укажите типы собираемых персональных данных"
    ]
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFAQ = FAQ_ITEMS.filter(category => {
    if (activeCategory !== "all" && category.category !== activeCategory) return false;
    if (!searchQuery) return true;
    return category.items.some(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
      <div>
        {/* Search */}
        <div className="bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Поиск по справке..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="faq" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="guides" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Руководства
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Контакты
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-8">
              {/* Category filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={activeCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                >
                  Все вопросы
                </Button>
                {FAQ_ITEMS.map((category) => (
                  <Button
                    key={category.category}
                    variant={activeCategory === category.category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.category)}
                    className="flex items-center gap-2"
                  >
                    {category.icon}
                    {category.category}
                  </Button>
                ))}
              </div>

              {/* FAQ Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredFAQ.map((category) => (
                  <Card key={category.category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {category.icon}
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {category.items.map((item, index) => (
                          <AccordionItem key={index} value={`${category.category}-${index}`}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground whitespace-pre-line">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent value="guides" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {GUIDES.map((guide, index) => (
                  <Card key={index} className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-lg bg-blue-500/10 p-2">
                          {guide.icon}
                        </div>
                        <Badge variant="secondary">Руководство</Badge>
                      </div>
                      <CardTitle>{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-3">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-3">
                            <div className="rounded-full bg-blue-500 text-white w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                              {stepIndex + 1}
                            </div>
                            <span className="text-sm text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Primary Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-6 w-6 text-blue-500" />
                      Основная поддержка
                    </CardTitle>
                    <CardDescription>
                      Быстрый ответ на ваши вопросы
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">rucoder.rf@yandex.ru</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Telegram</p>
                        <p className="text-sm text-muted-foreground">@RussCoder</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Время работы</p>
                        <p className="text-sm text-muted-foreground">Пн-Пт 9:00-18:00 МСК</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phone Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-6 w-6 text-green-500" />
                      Телефонная поддержка
                    </CardTitle>
                    <CardDescription>
                      Для срочных вопросов
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">+7 (985) 985-53-97</p>
                        <p className="text-sm text-muted-foreground">Звонки и WhatsApp</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>• Бесплатно для клиентов Ультра</p>
                      <p>• Приоритетная поддержка Премиум</p>
                      <p>• Базовая поддержка для всех</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Website */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-6 w-6 text-purple-500" />
                      Дополнительная информация
                    </CardTitle>
                    <CardDescription>
                      Больше материалов и новостей
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Сайт разработчика</p>
                        <p className="text-sm text-muted-foreground">рукодер.рф</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href="/feedback">Обратная связь</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href="/news">Новости и обновления</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Response Time Info */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-500/10 p-2">
                      <Clock className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Время ответа поддержки
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-blue-800 dark:text-blue-200">
                            <strong>Ультра:</strong> до 2 часов
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-yellow-500" />
                          <span className="text-blue-800 dark:text-blue-200">
                            <strong>Премиум:</strong> до 8 часов
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-gray-500" />
                          <span className="text-blue-800 dark:text-blue-200">
                            <strong>Бесплатный:</strong> до 24 часов
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}