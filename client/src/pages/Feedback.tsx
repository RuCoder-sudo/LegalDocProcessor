import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { feedbackFormSchema, type FeedbackFormData } from "@shared/schema";
import { FEEDBACK_TYPES, FEEDBACK_CATEGORIES } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { 
  MessageSquare, 
  Star, 
  Send, 
  Heart,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  Users,
  TrendingUp,
  Zap,
  Award,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Meh,
  Frown
} from "lucide-react";

export default function Feedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(0);
  const [satisfaction, setSatisfaction] = useState<string>("");
  const [usability, setUsability] = useState<string>("");
  const [recommend, setRecommend] = useState<string>("");
  const [features, setFeatures] = useState<string[]>([]);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      type: "suggestion",
      category: "general",
      title: "",
      description: "",
      priority: "medium",
      email: user?.email || "",
      allowContact: true
    }
  });

  const submitFeedback = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          rating,
          satisfaction,
          usability,
          recommend,
          features
        })
      });
      
      if (!response.ok) {
        throw new Error("Ошибка отправки отзыва");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Отзыв отправлен!",
        description: "Спасибо за ваш отзыв. Мы обязательно его рассмотрим."
      });
      
      form.reset();
      setRating(0);
      setSatisfaction("");
      setUsability("");
      setRecommend("");
      setFeatures([]);
      
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить отзыв",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedback.mutate(data);
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleFeatureToggle = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const getSatisfactionIcon = (value: string) => {
    switch (value) {
      case "very_satisfied": return <Smile className="h-5 w-5 text-green-500" />;
      case "satisfied": return <Smile className="h-5 w-5 text-blue-500" />;
      case "neutral": return <Meh className="h-5 w-5 text-yellow-500" />;
      case "dissatisfied": return <Frown className="h-5 w-5 text-orange-500" />;
      case "very_dissatisfied": return <Frown className="h-5 w-5 text-red-500" />;
      default: return <Meh className="h-5 w-5 text-gray-400" />;
    }
  };

  const progressValue = Math.round(
    ((rating > 0 ? 1 : 0) + 
     (satisfaction ? 1 : 0) + 
     (usability ? 1 : 0) + 
     (recommend ? 1 : 0) + 
     (form.watch("title") ? 1 : 0) + 
     (form.watch("description") ? 1 : 0)) / 6 * 100
  );

  // Список возможных улучшений
  const improvementFeatures = [
    "Больше типов документов",
    "Улучшенный дизайн",
    "Мобильное приложение",
    "API для интеграции",
    "Автосохранение",
    "Совместная работа",
    "Цены на тарифы",
    "QR-код генерация",
    "Архив документов",
    "Уведомления"
  ];

  return (
    <div className="pt-8 pb-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Основная форма отзыва */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-500/10 p-4">
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <CardTitle className="text-2xl">Ваш отзыв важен для нас</CardTitle>
              <CardDescription>
                Помогите нам улучшить сервис, поделившись своим мнением
              </CardDescription>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Прогресс заполнения</span>
                  <span className="text-sm font-medium">{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Оценка сервиса */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Общая оценка сервиса</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          className={`p-1 rounded-full transition-all duration-200 ${
                            star <= rating
                              ? "text-yellow-400 scale-110"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                        >
                          <Star className="h-8 w-8 fill-current" />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-center text-sm text-muted-foreground">
                        {rating === 1 ? "Очень плохо" :
                         rating === 2 ? "Плохо" :
                         rating === 3 ? "Нормально" :
                         rating === 4 ? "Хорошо" : "Отлично"}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Тип отзыва */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип обращения</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            {Object.entries(FEEDBACK_TYPES).map(([key, value]) => (
                              <div key={key} className="flex items-center space-x-2">
                                <RadioGroupItem value={key} id={key} />
                                <label htmlFor={key} className="text-sm font-medium cursor-pointer">
                                  {value}
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Заголовок */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Заголовок</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Кратко опишите вашу проблему или предложение" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Описание */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подробное описание</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Расскажите подробнее о вашем опыте использования сервиса..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Приоритет */}
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Приоритет</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="low" id="low" />
                              <label htmlFor="low" className="text-sm cursor-pointer">Низкий</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="medium" id="medium" />
                              <label htmlFor="medium" className="text-sm cursor-pointer">Средний</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="high" id="high" />
                              <label htmlFor="high" className="text-sm cursor-pointer">Высокий</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email для связи */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email для связи</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your@email.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Согласие на контакт */}
                  <FormField
                    control={form.control}
                    name="allowContact"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            Разрешить связаться со мной по этому обращению
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitFeedback.isPending}
                  >
                    {submitFeedback.isPending ? (
                      "Отправляем..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Отправить отзыв
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Дополнительные вопросы */}
          <div className="space-y-6">
            
            {/* Удовлетворенность */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Удовлетворенность сервисом
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Насколько вы довольны нашим сервисом?
                    </label>
                    <RadioGroup value={satisfaction} onValueChange={setSatisfaction}>
                      {[
                        { value: "very_satisfied", label: "Очень доволен" },
                        { value: "satisfied", label: "Доволен" },
                        { value: "neutral", label: "Нейтрально" },
                        { value: "dissatisfied", label: "Недоволен" },
                        { value: "very_dissatisfied", label: "Очень недоволен" }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <label htmlFor={option.value} className="text-sm cursor-pointer flex items-center gap-2">
                            {getSatisfactionIcon(option.value)}
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Удобство использования */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Удобство использования
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Насколько легко пользоваться нашим сервисом?
                  </label>
                  <RadioGroup value={usability} onValueChange={setUsability}>
                    {[
                      { value: "very_easy", label: "Очень легко" },
                      { value: "easy", label: "Легко" },
                      { value: "neutral", label: "Нормально" },
                      { value: "difficult", label: "Сложно" },
                      { value: "very_difficult", label: "Очень сложно" }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`usability-${option.value}`} />
                        <label htmlFor={`usability-${option.value}`} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Рекомендации */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Рекомендации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Будете ли вы рекомендовать наш сервис друзьям?
                  </label>
                  <RadioGroup value={recommend} onValueChange={setRecommend}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="definitely" id="definitely" />
                      <label htmlFor="definitely" className="text-sm cursor-pointer flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        Определенно да
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="probably" id="probably" />
                      <label htmlFor="probably" className="text-sm cursor-pointer">
                        Скорее да
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maybe" id="maybe" />
                      <label htmlFor="maybe" className="text-sm cursor-pointer">
                        Возможно
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="probably_not" id="probably_not" />
                      <label htmlFor="probably_not" className="text-sm cursor-pointer">
                        Скорее нет
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="definitely_not" id="definitely_not" />
                      <label htmlFor="definitely_not" className="text-sm cursor-pointer flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        Определенно нет
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Пожелания по улучшению */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Идеи улучшений
                </CardTitle>
                <CardDescription>
                  Выберите функции, которые хотели бы видеть в сервисе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {improvementFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`feature-${feature}`}
                        checked={features.includes(feature)}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <label 
                        htmlFor={`feature-${feature}`} 
                        className="text-sm cursor-pointer"
                      >
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}