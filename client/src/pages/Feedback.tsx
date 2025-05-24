import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  Award
} from "lucide-react";

export default function Feedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(0);

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
      const response = await apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ ...data, rating }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Спасибо за обратную связь!",
        description: "Ваше сообщение получено и будет рассмотрено в ближайшее время.",
      });
      form.reset();
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка отправки",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FeedbackFormData) => {
    submitFeedback.mutate(data);
  };

  const feedbackType = form.watch("type");
  const isAnonymous = form.watch("isAnonymous");

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-blue-500/10 p-4">
                <MessageSquare className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Обратная связь
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Поделитесь своими мыслями, предложениями или вопросами. Мы ценим ваше мнение!
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-sm text-muted-foreground">Пользователей</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">95%</div>
                <p className="text-sm text-muted-foreground">Довольных клиентов</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">24ч</div>
                <p className="text-sm text-muted-foreground">Ответ поддержки</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">567</div>
                <p className="text-sm text-muted-foreground">Отзывов</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feedback Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                    Форма обратной связи
                  </CardTitle>
                  <CardDescription>
                    Расскажите нам о своем опыте использования сервиса
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      {/* Feedback Type */}
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
                                {Object.entries(FEEDBACK_TYPES).map(([key, type]) => (
                                  <div key={key} className="flex items-center space-x-2">
                                    <RadioGroupItem value={key} id={key} />
                                    <label
                                      htmlFor={key}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <i className={`${type.icon} text-${type.color}-500`}></i>
                                      {type.name}
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category */}
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
                                className="grid grid-cols-2 gap-4"
                              >
                                {Object.entries(FEEDBACK_CATEGORIES).map(([key, category]) => (
                                  <div key={key} className="flex items-center space-x-2">
                                    <RadioGroupItem value={key} id={`cat-${key}`} />
                                    <label
                                      htmlFor={`cat-${key}`}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <i className={`${category.icon} text-gray-500`}></i>
                                      {category.name}
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Rating */}
                      <div className="space-y-2">
                        <FormLabel>Оценка сервиса (необязательно)</FormLabel>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                          {rating > 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              {rating} из 5 звезд
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Тема</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Краткое описание темы..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Message */}
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Сообщение</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Подробно опишите ваше обращение..."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email for anonymous users */}
                      {(!user || isAnonymous) && (
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Email для ответа {isAnonymous ? "(необязательно)" : ""}
                              </FormLabel>
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
                      )}

                      {/* Anonymous checkbox */}
                      {user && (
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
                                <p className="text-sm text-muted-foreground">
                                  Ваше имя не будет видно администраторам
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      )}

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
                            Отправить обращение
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with tips and info */}
            <div className="space-y-6">
              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 Советы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-500/10 p-1">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Будьте конкретны</p>
                      <p className="text-xs text-muted-foreground">
                        Чем детальнее описание, тем быстрее мы сможем помочь
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <Heart className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Поделитесь идеями</p>
                      <p className="text-xs text-muted-foreground">
                        Мы всегда открыты для новых предложений
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-yellow-500/10 p-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Сообщайте о проблемах</p>
                      <p className="text-xs text-muted-foreground">
                        Помогите нам сделать сервис лучше
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact alternatives */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📞 Другие способы связи</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Telegram</Badge>
                    <span className="text-sm">@RussCoder</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Email</Badge>
                    <span className="text-sm">rucoder.rf@yandex.ru</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Телефон</Badge>
                    <span className="text-sm">+7 (985) 985-53-97</span>
                  </div>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    Время работы поддержки: Пн-Пт 9:00-18:00 МСК
                  </p>
                </CardContent>
              </Card>

              {/* FAQ link */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <HelpCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-semibold mb-2">Часто задаваемые вопросы</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Возможно, ответ на ваш вопрос уже есть в разделе помощи
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/help">Перейти в справку</a>
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