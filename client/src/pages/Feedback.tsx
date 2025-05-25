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
import Layout from "@/components/Layout";

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
      category: "functionality",
      isAnonymous: false,
      email: user?.email || "",
    },
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
          features: features.join(", ")
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка отправки");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Спасибо за отзыв!",
        description: "Ваше мнение поможет нам стать лучше",
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
        title: "Ошибка отправки",
        description: error.message || "Попробуйте еще раз",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedback.mutate(data);
  };

  const handleFeatureToggle = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const satisfactionOptions = [
    { value: "very_happy", label: "Очень доволен", icon: <Smile className="h-6 w-6 text-green-500" /> },
    { value: "happy", label: "Доволен", icon: <ThumbsUp className="h-6 w-6 text-blue-500" /> },
    { value: "neutral", label: "Нейтрально", icon: <Meh className="h-6 w-6 text-yellow-500" /> },
    { value: "unhappy", label: "Недоволен", icon: <ThumbsDown className="h-6 w-6 text-orange-500" /> },
    { value: "very_unhappy", label: "Очень недоволен", icon: <Frown className="h-6 w-6 text-red-500" /> },
  ];

  const featureList = [
    "Генератор документов",
    "Премиум функции", 
    "Дизайн интерфейса",
    "Скорость работы",
    "Мобильная версия",
    "Техподдержка",
    "Цены на тарифы",
    "QR-код генерация",
    "Архив документов",
    "Уведомления"
  ];

  return (
    <Layout>
      <div className="pt-8 pb-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Форма обратной связи */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Отправить отзыв
                </CardTitle>
                <CardDescription>
                  Поделитесь своими мыслями и предложениями
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Основная оценка */}
                    <div className="space-y-3">
                      <FormLabel>Общая оценка сервиса</FormLabel>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-8 w-8 cursor-pointer transition-colors ${
                              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Ваша оценка: {rating} из 5
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

                    {/* Категория */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Категория</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 gap-3"
                            >
                              {Object.entries(FEEDBACK_CATEGORIES).map(([key, value]) => (
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

                    {/* Сообщение */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ваше сообщение</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Расскажите подробнее о вашем опыте использования сервиса..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email для ответа (необязательно)</FormLabel>
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

                    {/* Анонимность */}
                    <FormField
                      control={form.control}
                      name="isAnonymous"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Отправить анонимно</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Ваши контактные данные не будут сохранены
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={submitFeedback.isPending}>
                      {submitFeedback.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Отправляем...
                        </>
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

            {/* Дополнительные опросы */}
            <div className="space-y-6">
              
              {/* Опрос удовлетворенности */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Насколько вы довольны?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {satisfactionOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          satisfaction === option.value 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => setSatisfaction(option.value)}
                      >
                        {option.icon}
                        <span className="font-medium">{option.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Опрос удобства */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Удобство использования
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm mb-3">Насколько легко пользоваться сервисом?</p>
                    <RadioGroup value={usability} onValueChange={setUsability}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="very_easy" id="very_easy" />
                        <label htmlFor="very_easy" className="text-sm cursor-pointer">Очень легко</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="easy" id="easy" />
                        <label htmlFor="easy" className="text-sm cursor-pointer">Легко</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="normal" />
                        <label htmlFor="normal" className="text-sm cursor-pointer">Нормально</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="difficult" id="difficult" />
                        <label htmlFor="difficult" className="text-sm cursor-pointer">Сложно</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="very_difficult" id="very_difficult" />
                        <label htmlFor="very_difficult" className="text-sm cursor-pointer">Очень сложно</label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Рекомендации */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Рекомендации
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">Порекомендуете ли вы наш сервис друзьям?</p>
                  <RadioGroup value={recommend} onValueChange={setRecommend}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="definitely" id="definitely" />
                      <label htmlFor="definitely" className="text-sm cursor-pointer">Определенно да</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="probably" id="probably" />
                      <label htmlFor="probably" className="text-sm cursor-pointer">Скорее да</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maybe" id="maybe" />
                      <label htmlFor="maybe" className="text-sm cursor-pointer">Возможно</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="probably_not" id="probably_not" />
                      <label htmlFor="probably_not" className="text-sm cursor-pointer">Скорее нет</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="definitely_not" id="definitely_not" />
                      <label htmlFor="definitely_not" className="text-sm cursor-pointer">Определенно нет</label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Какие функции нравятся */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    Что вам нравится?
                  </CardTitle>
                  <CardDescription>
                    Выберите функции, которые вам больше всего нравятся
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {featureList.map((feature) => (
                      <div
                        key={feature}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                          features.includes(feature)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => handleFeatureToggle(feature)}
                      >
                        <Checkbox
                          checked={features.includes(feature)}
                          onChange={() => {}}
                        />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {features.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">
                        Выбрано: {features.length} из {featureList.length}
                      </p>
                      <Progress value={(features.length / featureList.length) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Контактная информация */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Другие способы связи</h3>
                <p className="text-muted-foreground mb-4">
                  Если у вас срочный вопрос, свяжитесь с нами напрямую
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <span>📧 rucoder.rf@yandex.ru</span>
                  <span>📞 +7 (985) 985-53-97</span>
                  <span>💬 Telegram: @rucoder</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
}