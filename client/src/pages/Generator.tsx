import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Star, Zap } from "lucide-react";
import { DOCUMENT_TYPES } from "@/lib/constants";
import DocumentWizard from "@/components/DocumentWizard";
import Layout from "@/components/Layout";

export default function Generator() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleCreateDocument = (type: string) => {
    setSelectedType(type);
    setWizardOpen(true);
  };

  const advantages = [
    {
      icon: CheckCircle,
      title: "100% соответствие закону",
      description: "Все документы создаются с учетом последних изменений в 152-ФЗ и требований Роскомнадзора"
    },
    {
      icon: Zap,
      title: "Экономия времени", 
      description: "Создание документа занимает 5-10 минут вместо нескольких дней работы с юристом"
    },
    {
      icon: Star,
      title: "Готовые к использованию",
      description: "Документы сразу готовы для размещения на сайте в форматах PDF, DOC, HTML"
    },
    {
      icon: CheckCircle,
      title: "Проверено экспертами",
      description: "Шаблоны разработаны практикующими юристами с опытом работы в IT-сфере"
    },
    {
      icon: Star,
      title: "Премиум возможности",
      description: "Безлимитное создание, редактирование, экспорт документов и персональная поддержка"
    },
    {
      icon: Zap,
      title: "Постоянные обновления",
      description: "Мы следим за изменениями в законодательстве и обновляем шаблоны автоматически"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Hero Section */}
        <section className="pt-8 pb-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-6">
              Генератор документов
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Создавайте все необходимые юридические документы для полного соответствия требованиям законодательства
            </p>
          </div>
        </section>

        {/* Document Types Grid */}
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Доступные типы документов
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(DOCUMENT_TYPES).map(([key, type]) => (
                <Card key={key} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border bg-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-primary/10`}>
                        <i className={`${type.icon} text-xl text-primary`}></i>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Юридический документ
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-card-foreground">{type.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {type.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Button 
                      onClick={() => handleCreateDocument(key)}
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      variant="outline"
                    >
                      Создать документ
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              Преимущества нашей платформы
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              Почему ведущие компании выбирают нас для создания юридических документов
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <Card key={index} className="text-center border-border bg-card">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg text-card-foreground">{advantage.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{advantage.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Готовы создать свой первый документ?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Присоединяйтесь к тысячам компаний, которые уже используют нашу платформу
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => document.querySelector('[data-scroll-target]')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Начать создание
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Document Wizard */}
        <DocumentWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          onSuccess={() => {
            setWizardOpen(false);
            setSelectedType(null);
          }}
        />
      </div>
  );
}