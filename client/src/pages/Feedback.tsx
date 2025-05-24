import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Star, ThumbsUp, Send } from "lucide-react";

export default function Feedback() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: "",
    experience: "",
    suggestions: "",
    usage: "",
    features: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Здесь можно добавить отправку на сервер
    toast({
      title: "Спасибо за обратную связь!",
      description: "Ваше мнение очень важно для нас. Мы обязательно его рассмотрим.",
    });
    
    // Очищаем форму
    setFormData({
      name: "",
      email: "",
      rating: "",
      experience: "",
      suggestions: "",
      usage: "",
      features: "",
      message: ""
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Обратная связь
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Помогите нам стать лучше! Ваше мнение и предложения очень важны для развития сервиса.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Опрос */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                    Опрос о качестве сервиса
                  </CardTitle>
                  <CardDescription>
                    Пожалуйста, ответьте на несколько вопросов о вашем опыте использования
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Личные данные */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Имя</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Ваше имя"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Оценка сервиса */}
                    <div>
                      <Label className="text-base font-medium">Как бы вы оценили наш сервис?</Label>
                      <RadioGroup 
                        value={formData.rating} 
                        onValueChange={(value) => setFormData({...formData, rating: value})}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="excellent" id="excellent" />
                          <Label htmlFor="excellent" className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            Отлично
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="good" id="good" />
                          <Label htmlFor="good">Хорошо</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="average" id="average" />
                          <Label htmlFor="average">Удовлетворительно</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="poor" id="poor" />
                          <Label htmlFor="poor">Плохо</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Опыт использования */}
                    <div>
                      <Label htmlFor="experience">Как долго вы пользуетесь нашим сервисом?</Label>
                      <Select value={formData.experience} onValueChange={(value) => setFormData({...formData, experience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите период" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first-time">Первый раз</SelectItem>
                          <SelectItem value="few-days">Несколько дней</SelectItem>
                          <SelectItem value="few-weeks">Несколько недель</SelectItem>
                          <SelectItem value="few-months">Несколько месяцев</SelectItem>
                          <SelectItem value="year-plus">Больше года</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Цель использования */}
                    <div>
                      <Label htmlFor="usage">Для чего вы используете наш сервис?</Label>
                      <Select value={formData.usage} onValueChange={(value) => setFormData({...formData, usage: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите цель" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Для бизнеса</SelectItem>
                          <SelectItem value="personal">Личное использование</SelectItem>
                          <SelectItem value="learning">Изучение/обучение</SelectItem>
                          <SelectItem value="freelance">Фриланс</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Нужные функции */}
                    <div>
                      <Label htmlFor="features">Какие функции вам наиболее важны?</Label>
                      <Select value={formData.features} onValueChange={(value) => setFormData({...formData, features: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите функцию" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="templates">Готовые шаблоны</SelectItem>
                          <SelectItem value="customization">Настройка документов</SelectItem>
                          <SelectItem value="export">Экспорт в разных форматах</SelectItem>
                          <SelectItem value="legal-updates">Обновления законодательства</SelectItem>
                          <SelectItem value="support">Техническая поддержка</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Предложения */}
                    <div>
                      <Label htmlFor="suggestions">Ваши предложения по улучшению</Label>
                      <Textarea
                        id="suggestions"
                        value={formData.suggestions}
                        onChange={(e) => setFormData({...formData, suggestions: e.target.value})}
                        placeholder="Что бы вы хотели улучшить или добавить?"
                        rows={3}
                      />
                    </div>

                    {/* Общий отзыв */}
                    <div>
                      <Label htmlFor="message">Дополнительные комментарии</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Расскажите подробнее о вашем опыте..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4 mr-2" />
                      Отправить отзыв
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Боковая панель */}
            <div className="space-y-6">
              {/* Быстрая связь */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Быстрая связь</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Email поддержки</Label>
                    <p className="text-sm text-muted-foreground">support@legalrfdocs.ru</p>
                  </div>
                  <div>
                    <Label className="font-medium">Телефон</Label>
                    <p className="text-sm text-muted-foreground">+7 (xxx) xxx-xx-xx</p>
                  </div>
                  <div>
                    <Label className="font-medium">Время работы</Label>
                    <p className="text-sm text-muted-foreground">Пн-Пт: 9:00 - 18:00</p>
                  </div>
                </CardContent>
              </Card>

              {/* Популярные вопросы */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Частые вопросы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Button variant="ghost" className="h-auto p-2 w-full justify-start text-left">
                      <ThumbsUp className="h-4 w-4 mr-2 text-blue-600" />
                      Как обновить подписку?
                    </Button>
                  </div>
                  <div>
                    <Button variant="ghost" className="h-auto p-2 w-full justify-start text-left">
                      <ThumbsUp className="h-4 w-4 mr-2 text-blue-600" />
                      Как скачать документ?
                    </Button>
                  </div>
                  <div>
                    <Button variant="ghost" className="h-auto p-2 w-full justify-start text-left">
                      <ThumbsUp className="h-4 w-4 mr-2 text-blue-600" />
                      Проблемы с регистрацией
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}