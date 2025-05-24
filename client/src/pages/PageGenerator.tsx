import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { 
  FileText, 
  Sparkles, 
  Eye, 
  Download, 
  Copy,
  CheckCircle,
  Crown,
  MessageSquare,
  HelpCircle,
  Gift
} from "lucide-react";

const pageFormSchema = z.object({
  pageType: z.enum(["faq", "offers", "support", "about"], {
    required_error: "Выберите тип страницы",
  }),
  siteName: z.string().min(2, "Название сайта должно содержать минимум 2 символа"),
  companyName: z.string().min(2, "Название компании должно содержать минимум 2 символа"),
  industry: z.string().min(2, "Укажите сферу деятельности"),
  contactEmail: z.string().email("Введите корректный email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  specialOffers: z.string().optional(),
  targetAudience: z.string().optional(),
});

type PageFormData = z.infer<typeof pageFormSchema>;

const PAGE_TYPES = {
  faq: {
    title: "Страница FAQ",
    description: "Часто задаваемые вопросы и ответы",
    icon: <HelpCircle className="h-5 w-5" />,
    color: "blue",
  },
  offers: {
    title: "Страница предложений",
    description: "Специальные предложения и акции",
    icon: <Gift className="h-5 w-5" />,
    color: "green",
  },
  support: {
    title: "Страница поддержки",
    description: "Техническая поддержка и помощь",
    icon: <MessageSquare className="h-5 w-5" />,
    color: "purple",
  },
  about: {
    title: "О компании",
    description: "Информация о компании и услугах",
    icon: <FileText className="h-5 w-5" />,
    color: "orange",
  },
};

export default function PageGenerator() {
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      pageType: "faq",
      siteName: "",
      companyName: "",
      industry: "",
      contactEmail: "",
      phone: "",
      address: "",
      specialOffers: "",
      targetAudience: "",
    },
  });

  const generatePageMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      const response = await fetch("/api/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка генерации страницы");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setIsGenerating(false);
      toast({
        title: "Страница создана!",
        description: "Контент успешно сгенерирован",
      });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast({
        title: "Ошибка генерации",
        description: error.message || "Попробуйте еще раз",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PageFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Для генерации страниц необходимо войти в аккаунт",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generatePageMutation.mutate(data);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Скопировано!",
      description: "Контент скопирован в буфер обмена",
    });
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType}-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-primary/10 p-4">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Генератор веб-страниц
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Создавайте профессиональные страницы для вашего сайта: FAQ, предложения, поддержка и о компании
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Форма генерации */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Настройки страницы
                </CardTitle>
                <CardDescription>
                  Заполните информацию для генерации контента
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Тип страницы */}
                    <FormField
                      control={form.control}
                      name="pageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тип страницы</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedType(value);
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите тип страницы" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PAGE_TYPES).map(([key, type]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    {type.icon}
                                    <div>
                                      <div className="font-medium">{type.title}</div>
                                      <div className="text-xs text-muted-foreground">{type.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название сайта</FormLabel>
                            <FormControl>
                              <Input placeholder="Мой сайт" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название компании</FormLabel>
                            <FormControl>
                              <Input placeholder="ООО Компания" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Сфера деятельности</FormLabel>
                          <FormControl>
                            <Input placeholder="IT-услуги, торговля, производство..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email для связи</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="info@company.ru" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Телефон (необязательно)</FormLabel>
                            <FormControl>
                              <Input placeholder="+7 (999) 123-45-67" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Адрес (необязательно)</FormLabel>
                          <FormControl>
                            <Input placeholder="г. Москва, ул. Примерная, д. 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedType === 'offers' && (
                      <FormField
                        control={form.control}
                        name="specialOffers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Специальные предложения</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Опишите ваши акции, скидки, специальные условия..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Целевая аудитория (необязательно)</FormLabel>
                          <FormControl>
                            <Input placeholder="Малый бизнес, частные лица, крупные компании..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Генерация...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Создать страницу
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Предварительный просмотр */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Предварительный просмотр
                </CardTitle>
                <CardDescription>
                  {generatedContent ? "Готовый контент страницы" : "Контент появится после генерации"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={copyToClipboard} variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Копировать
                      </Button>
                      <Button onClick={downloadContent} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Скачать HTML
                      </Button>
                    </div>
                    <Separator />
                    <ScrollArea className="h-[600px] w-full border rounded-lg p-4">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: generatedContent }}
                      />
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Заполните форму и нажмите "Создать страницу"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Примеры типов страниц */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">Типы страниц</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(PAGE_TYPES).map(([key, type]) => (
                <Card key={key} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className={`rounded-full bg-${type.color}-500/10 p-4 w-fit mx-auto mb-4`}>
                      {type.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{type.title}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}