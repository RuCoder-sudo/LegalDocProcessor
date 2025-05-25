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
        answer: "Мы поддерживаем создание политики конфиденциальности, пользовательского соглашения, согласия на обработку персональных данных, публичной оферты, политики Cookie и политики возврата."
      }
    ]
  },
  {
    category: "Создание документов",
    icon: <FileText className="h-5 w-5" />,
    items: [
      {
        question: "Как создать документ?",
        answer: "Перейдите в раздел 'Генератор документов', выберите тип документа, заполните форму с данными вашей компании и нажмите 'Создать документ'. Документ будет автоматически сгенерирован."
      },
      {
        question: "Можно ли редактировать созданные документы?",
        answer: "Да, вы можете редактировать любые созданные документы в личном кабинете. Перейдите в раздел 'Мои документы' и нажмите на нужный документ для редактирования."
      },
      {
        question: "В каких форматах можно скачать документы?",
        answer: "Документы доступны для скачивания в форматах PDF, DOCX и TXT. Выберите нужный формат при экспорте документа."
      }
    ]
  },
  {
    category: "Соответствие законодательству",
    icon: <Shield className="h-5 w-5" />,
    items: [
      {
        question: "Соответствуют ли документы российскому законодательству?",
        answer: "Да, все наши шаблоны разработаны с учетом требований российского законодательства, включая 152-ФЗ 'О персональных данных' и других актуальных нормативных актов."
      },
      {
        question: "Нужно ли дополнительно проверять документы у юриста?",
        answer: "Рекомендуем проконсультироваться с юристом для адаптации документов под специфику вашего бизнеса, особенно если у вас сложная бизнес-модель."
      }
    ]
  }
];

const HELP_CATEGORIES = [
  { id: "all", name: "Все", icon: <BookOpen className="h-4 w-4" /> },
  { id: "Начало работы", name: "Начало работы", icon: <Lightbulb className="h-4 w-4" /> },
  { id: "Создание документов", name: "Создание документов", icon: <FileText className="h-4 w-4" /> },
  { id: "Соответствие законодательству", name: "Законодательство", icon: <Shield className="h-4 w-4" /> }
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
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {HELP_CATEGORIES.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.icon}
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-6 w-6" />
                  Часто задаваемые вопросы
                </CardTitle>
                <CardDescription>
                  Найдите ответы на самые популярные вопросы о работе с сервисом
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFAQ.length > 0 ? (
                  <div className="space-y-6">
                    {filteredFAQ.map((category, categoryIndex) => (
                      <div key={categoryIndex}>
                        <div className="flex items-center gap-3 mb-4">
                          {category.icon}
                          <h3 className="text-lg font-semibold">{category.category}</h3>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          {category.items.map((item, itemIndex) => (
                            <AccordionItem key={itemIndex} value={`${categoryIndex}-${itemIndex}`}>
                              <AccordionTrigger className="text-left">
                                {item.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground">
                                {item.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ничего не найдено</h3>
                    <p className="text-muted-foreground">
                      Попробуйте изменить поисковый запрос или выберите другую категорию
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}