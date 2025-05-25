import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DOCUMENT_TYPES, INDUSTRIES } from "@/lib/constants";
import { DocumentFormData } from "@/lib/types";
import { documentFormSchema } from "@shared/schema";
import { ArrowLeft, ArrowRight, Check, Download, Eye, Sparkles, Copy, Crown, QrCode, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  USER_RIGHTS_OPTIONS, 
  ADMIN_RIGHTS_OPTIONS, 
  USER_OBLIGATIONS_OPTIONS, 
  ADMIN_OBLIGATIONS_OPTIONS,
  DATA_TYPES_OPTIONS 
} from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PremiumGate from "@/components/PremiumGate";

interface DocumentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (document: any) => void;
}

export default function DocumentWizard({ open, onOpenChange, onSuccess }: DocumentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [createdDocument, setCreatedDocument] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAdvancedTemplate, setUseAdvancedTemplate] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // All features are now available to all registered users
  const isPremiumUser = true;

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      type: "privacy",
      ownerType: "legal",
      companyName: "",
      websiteUrl: "",
      contactEmail: "",
      phone: "",
      industry: "",
      inn: "",
      ogrn: "",
      legalAddress: "",
      registrar: "",
      hostingProvider: "",
      isSmi: false,
      userCanPost: false,
      agreementStart: "any_use",
      agreementDuration: "indefinite",
      canAdminChange: true,
      notifyChanges: "yes",
      userRights: [],
      adminRights: [],
      userObligations: [],
      adminObligations: [],
      dataTypes: [],
      generateQr: false,
      qrData: "",
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      console.log('Sending document data:', data);
      
      // Получаем token из localStorage или из cookie
      const token = localStorage.getItem('auth-token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];
      
      console.log('Using auth token:', token ? 'token exists' : 'no token');
      
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : '',
        },
        credentials: 'include', // Важно для работы с cookies
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Document creation error:', error);
        throw new Error(error.message || 'Ошибка создания документа');
      }
      return response.json();
    },
    onSuccess: (document) => {
      setIsGenerating(false);
      setCreatedDocument(document);
      setCurrentStep(3);
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Документ создан!",
        description: "Ваш документ успешно сгенерирован и готов к использованию.",
      });
      onSuccess?.(document);
    },
    onError: (error: any) => {
      setIsGenerating(false);
      if (error.message.includes("LIMIT_REACHED")) {
        toast({
          title: "Лимит документов исчерпан",
          description: "Перейдите на премиум-план для безлимитного создания документов.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ошибка создания документа",
          description: error.message || "Произошла ошибка при создании документа",
          variant: "destructive",
        });
      }
    },
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedType) {
        toast({
          title: "Выберите тип документа",
          description: "Необходимо выбрать тип документа для продолжения",
          variant: "destructive",
        });
        return;
      }
      form.setValue("type", selectedType as any);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Проверяем авторизацию для бесплатных пользователей
      if (!isAuthenticated) {
        toast({
          title: "Требуется регистрация",
          description: "Для создания документов необходимо зарегистрироваться",
          variant: "destructive",
        });
        return;
      }
      
      form.handleSubmit((data) => {
        setIsGenerating(true);
        createDocumentMutation.mutate(data);
      })();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedType("");
    setCreatedDocument(null);
    setIsGenerating(false);
    form.reset();
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const progress = (currentStep / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Создание документа
          </DialogTitle>
          <div className="flex items-center space-x-4 mt-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm text-muted-foreground">Шаг {currentStep} из 3</span>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {/* Step 1: Document Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Выберите тип документа</h3>
                <p className="text-muted-foreground">Выберите тип юридического документа, который вы хотите создать</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(DOCUMENT_TYPES).map(([key, type]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedType === key ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedType(key)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <i className={`${type.icon} text-xl text-${type.color}-500`}></i>
                        <div>
                          <CardTitle className="text-lg">{type.name}</CardTitle>
                          <CardDescription>{type.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Company Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Информация о компании</h3>
                <p className="text-muted-foreground">Заполните данные вашей компании для генерации документа</p>
              </div>

              <form className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 border rounded-lg p-4 mb-4 col-span-2">
                  <Label className="text-base font-medium">Владелец сайта:</Label>
                  <RadioGroup 
                    value={form.getValues().ownerType} 
                    onValueChange={(value) => {
                      form.setValue("ownerType", value as "individual" | "legal");
                      form.trigger("ownerType");
                    }}
                    className="flex flex-row gap-8 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="ownerType-individual" />
                      <Label htmlFor="ownerType-individual">Физ. лицо</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="legal" id="ownerType-legal" />
                      <Label htmlFor="ownerType-legal">Юр. лицо или ИП</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {form.getValues().ownerType === "individual" ? "ФИО *" : "Название компании *"}
                  </Label>
                  <Input
                    id="companyName"
                    placeholder={form.getValues().ownerType === "individual" ? "Иванов Иван Иванович" : "ООО 'Ваша компания'"}
                    {...form.register("companyName")}
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-sm text-destructive">{form.formState.errors.companyName.message}</p>
                  )}
                </div>

                {form.getValues().ownerType === "legal" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="inn">ИНН *</Label>
                      <Input
                        id="inn"
                        placeholder="1234567890"
                        {...form.register("inn")}
                      />
                      {form.formState.errors.inn && (
                        <p className="text-sm text-destructive">{form.formState.errors.inn.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogrn">ОГРН</Label>
                      <Input
                        id="ogrn"
                        placeholder="1234567890123"
                        {...form.register("ogrn")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="legalAddress">Юридический адрес</Label>
                      <Input
                        id="legalAddress"
                        placeholder="г. Москва, ул. Примерная, д. 1"
                        {...form.register("legalAddress")}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">URL сайта *</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://example.com"
                    {...form.register("websiteUrl")}
                  />
                  {form.formState.errors.websiteUrl && (
                    <p className="text-sm text-destructive">{form.formState.errors.websiteUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email для связи *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="info@example.com"
                    {...form.register("contactEmail")}
                  />
                  {form.formState.errors.contactEmail && (
                    <p className="text-sm text-destructive">{form.formState.errors.contactEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    placeholder="+7 (999) 999-99-99"
                    {...form.register("phone")}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="legalAddress">Юридический адрес *</Label>
                  <Textarea
                    id="legalAddress"
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    {...form.register("legalAddress")}
                  />
                  {form.formState.errors.legalAddress && (
                    <p className="text-sm text-destructive">{form.formState.errors.legalAddress.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrar">Регистратор домена</Label>
                  <Input
                    id="registrar"
                    placeholder="REG.RU, Timeweb, др."
                    {...form.register("registrar")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hostingProvider">Хостинг-провайдер</Label>
                  <Input
                    id="hostingProvider"
                    placeholder="Timeweb, Beget, др."
                    {...form.register("hostingProvider")}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="industry">Отрасль</Label>
                  <Select onValueChange={(value) => form.setValue("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите отрасль" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2 space-y-4 border rounded-lg p-4 mt-4">
                  <Label className="text-base font-medium">Является ли Ваш сайт Средством Массовой Информации (СМИ)?</Label>
                  <RadioGroup 
                    value={form.getValues().isSmi ? "true" : "false"} 
                    onValueChange={(value) => {
                      form.setValue("isSmi", value === "true");
                      form.trigger("isSmi");
                    }}
                    className="flex flex-row gap-8 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="isSmi-no" />
                      <Label htmlFor="isSmi-no">Нет</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="isSmi-yes" />
                      <Label htmlFor="isSmi-yes">Да</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="col-span-2 space-y-4 border rounded-lg p-4">
                  <Label className="text-base font-medium">Размещает ли пользователь какую-либо информацию на Вашем сайте?</Label>
                  <RadioGroup 
                    value={form.getValues().userCanPost ? "true" : "false"} 
                    onValueChange={(value) => {
                      form.setValue("userCanPost", value === "true");
                      form.trigger("userCanPost");
                    }}
                    className="flex flex-row gap-8 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="userCanPost-no" />
                      <Label htmlFor="userCanPost-no">Нет</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="userCanPost-yes" />
                      <Label htmlFor="userCanPost-yes">Да</Label>
                    </div>
                  </RadioGroup>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Document Generation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {isGenerating || createDocumentMutation.isPending ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Создание документа...</h3>
                  <p className="text-muted-foreground">Пожалуйста, подождите, документ генерируется</p>
                </div>
              ) : createdDocument ? (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-success/10 p-3">
                      <Check className="h-8 w-8 text-success" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Документ готов!</h3>
                    <p className="text-muted-foreground">
                      Ваш документ "{createdDocument.name}" успешно создан и готов к использованию
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-left">{createdDocument.name}</CardTitle>
                          <CardDescription className="text-left">
                            Создан {new Date(createdDocument.createdAt).toLocaleDateString('ru-RU')}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {DOCUMENT_TYPES[createdDocument.type as keyof typeof DOCUMENT_TYPES]?.name}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              navigator.clipboard.writeText(createdDocument.generatedContent || '');
                              toast({
                                title: "Скопировано!",
                                description: "Содержимое документа скопировано в буфер обмена",
                              });
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Копировать текст
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={() => {
                              toast({
                                title: "Премиум функция",
                                description: "Скачивание PDF доступно в премиум тарифе. Обновитесь для полного доступа!",
                                variant: "destructive",
                              });
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Скачать PDF
                          </Button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Crown className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium mb-1">Премиум возможности:</p>
                              <ul className="space-y-1 text-xs">
                                <li>• Редактирование созданных документов</li>
                                <li>• Экспорт в PDF, DOC, TXT форматы</li>
                                <li>• Безлимитное создание документов</li>
                                <li>• Расширенные шаблоны для разных отраслей</li>
                                <li>• Приоритетная поддержка</li>
                                <li>• API доступ для интеграции</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1 || isGenerating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>

          <div className="flex gap-2">
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={isGenerating}
                className={currentStep === 2 ? "bg-success hover:bg-success/90" : ""}
              >
                {currentStep === 2 ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Создать документ
                  </>
                ) : (
                  <>
                    Далее
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleClose}>
                Закрыть
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
