import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import DocumentWizard from "@/components/DocumentWizard";
import AuthForms from "@/components/AuthForms";
import NewsCarousel from "@/components/NewsCarousel";
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
  Crown,
  FileText,
  Award,
  Clock,
  Users,
  ThumbsUp
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
      
      {/* Преимущества регистрации - новая секция */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Преимущества после регистрации
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Все функции бесплатно доступны сразу после простой регистрации
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <FileText className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">Безлимитное создание</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Создавайте неограниченное количество документов для всех ваших проектов
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <Download className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-lg">Экспорт документов</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Скачивайте документы в PDF, DOC и HTML форматах для удобного использования
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-3">
                    <Wand2 className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Редактирование</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Вносите изменения в ваши документы в любое время по мере необходимости
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/10 p-3">
                    <Shield className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-lg">Юридическая защита</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Документы соответствуют всем требованиям законодательства РФ, включая 152-ФЗ
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-500/10 p-3">
                    <ArrowRight className="h-6 w-6 text-red-500" />
                  </div>
                  <CardTitle className="text-lg">QR-коды</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Генерируйте QR-коды для ваших документов для быстрого доступа
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-500/10 p-3">
                    <CheckCircle className="h-6 w-6 text-indigo-500" />
                  </div>
                  <CardTitle className="text-lg">Расширенные шаблоны</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Доступ к продвинутым шаблонам с учетом специфики вашего бизнеса
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                  Зарегистрироваться и начать
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <AuthForms />
              </DialogContent>
            </Dialog>
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
      
      {/* Новости Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Новости и обновления</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Будьте в курсе изменений законодательства и обновлений нашего сервиса
            </p>
          </div>

          <NewsCarousel />
          
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg">
              Смотреть все новости
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Преимущества нашей платформы
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Почему ведущие компании выбирают нас для создания юридических документов
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <Shield className="h-8 w-8 text-blue-500" />
                  </div>
                  <CardTitle className="text-lg">100% соответствие закону</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Все документы создаются с учетом последних изменений в 152-ФЗ и требований Роскомнадзора
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <Wand2 className="h-8 w-8 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">Экономия времени</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Создание документа занимает 5-10 минут вместо нескольких дней работы с юристом
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-3">
                    <Download className="h-8 w-8 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Готовые к использованию</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Документы сразу готовы для размещения на сайте в форматах PDF, DOC, HTML
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/10 p-3">
                    <CheckCircle className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-lg">Проверено экспертами</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Шаблоны разработаны практикующими юристами с опытом работы в IT-сфере
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-red-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-500/10 p-3">
                    <Crown className="h-8 w-8 text-red-500" />
                  </div>
                  <CardTitle className="text-lg">Премиум возможности</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Безлимитное создание, редактирование, экспорт документов и персональная поддержка
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-500/10 p-3">
                    <ArrowRight className="h-8 w-8 text-indigo-500" />
                  </div>
                  <CardTitle className="text-lg">Постоянные обновления</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Мы следим за изменениями в законодательстве и обновляем шаблоны автоматически
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Начните создавать документы прямо сейчас
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Зарегистрируйтесь и получите доступ ко всем функциям бесплатно
            </p>
          </div>
          
          <div className="flex justify-center mt-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="px-10 py-6 text-lg font-semibold transition-all transform hover:scale-105"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Зарегистрироваться и начать
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <AuthForms />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-500/10 p-4 mb-4">
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Безопасно и надежно</h3>
              <p className="text-muted-foreground">Ваши данные защищены в соответствии с требованиями 152-ФЗ</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-green-500/10 p-4 mb-4">
                <Wand2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Быстро и просто</h3>
              <p className="text-muted-foreground">Простой процесс создания документов без лишних сложностей</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-purple-500/10 p-4 mb-4">
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Соответствие закону</h3>
              <p className="text-muted-foreground">Все документы полностью соответствуют требованиям законодательства</p>
            </div>
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
