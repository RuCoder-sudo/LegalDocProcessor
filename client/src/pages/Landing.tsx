import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import DocumentWizard from "@/components/DocumentWizard";
import AuthForms from "@/components/AuthForms";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { 
  Scale, 
  Shield, 
  Wand2, 
  Download, 
  Rocket, 
  Play, 
  ArrowRight, 
  CheckCircle,
  Crown 
} from "lucide-react";

export default function Landing() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              <span className="gradient-text animate-gradient">Автоматическое создание юридических документов</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Профессиональная платформа для автоматического создания документов в соответствии с 152-ФЗ. 
              Политики конфиденциальности, пользовательские соглашения и другие обязательные документы для вашего сайта.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="px-8 py-4 text-lg font-semibold transition-all transform hover:scale-105"
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Начать создание
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <AuthForms />
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/examples">
                  <Play className="mr-2 h-5 w-5" />
                  Посмотреть примеры
                </Link>
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="transition-all hover:shadow-lg animate-slide-up border-success/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-2">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <CardTitle>Соответствие 152-ФЗ</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Все документы созданы с учетом актуальных требований российского законодательства
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg animate-slide-up border-primary/20" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Wand2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Умная генерация</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Автоматическое создание документов на основе специфики вашего бизнеса
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg animate-slide-up border-warning/20" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-warning/10 p-2">
                    <Download className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle>Множество форматов</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Экспорт в PDF, DOC, HTML для удобного размещения на сайте
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Document Types Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Типы документов
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Создавайте все необходимые юридические документы для полного соответствия требованиям законодательства
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(DOCUMENT_TYPES).map(([key, type]) => (
              <Card 
                key={key} 
                className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/20"
                onClick={() => setWizardOpen(true)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg bg-${type.color}-500/10 p-2 group-hover:scale-110 transition-transform`}>
                      <i className={`${type.icon} text-xl text-${type.color}-500`}></i>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center text-${type.color}-500 text-sm font-medium group-hover:translate-x-1 transition-transform`}>
                    <span>Создать документ</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Выберите свой план
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Начните бесплатно и переходите на премиум при необходимости
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2">
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl">Бесплатный</CardTitle>
                  <div className="text-4xl font-bold my-2">0 ₽</div>
                  <CardDescription>Для начинающих</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>До 3 документов в месяц</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Просмотр и копирование текста</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Базовые шаблоны документов</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Стандартная поддержка</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={() => setWizardOpen(true)}>
                  Начать бесплатно
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-premium relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-400 text-gray-900">Популярный</Badge>
              </div>
              
              <CardHeader className="premium-gradient text-white">
                <div className="text-center">
                  <CardTitle className="text-2xl">Премиум</CardTitle>
                  <div className="text-4xl font-bold my-2">Договорная</div>
                  <CardDescription className="text-purple-100">Свяжитесь с @RussCoder</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Безлимитное создание документов</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Экспорт в PDF, DOC, HTML</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Редактирование документов</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Приоритетная поддержка</span>
                  </li>
                </ul>
                <Button className="w-full premium-gradient text-white" asChild>
                  <Link href="/premium">
                    <Crown className="mr-2 h-4 w-4" />
                    Узнать больше
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Document Wizard */}
      <DocumentWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen}
        onSuccess={() => {
          // Redirect to documents page or show success message
        }}
      />
    </div>
  );
}
