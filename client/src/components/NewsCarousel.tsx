import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl?: string;
}

// Фиктивные данные для демонстрации
const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "Обновление требований к политике конфиденциальности",
    excerpt: "Роскомнадзор выпустил новые рекомендации по оформлению документов для владельцев сайтов и интернет-сервисов.",
    date: "24 мая 2025",
    category: "Законодательство",
  },
  {
    id: 2,
    title: "Добавлены новые шаблоны для интернет-магазинов",
    excerpt: "Теперь доступны специализированные документы для различных категорий товаров с учетом особенностей продаж.",
    date: "19 мая 2025",
    category: "Обновления сервиса",
  },
  {
    id: 3,
    title: "Изменения в 152-ФЗ: что нужно знать владельцам сайтов",
    excerpt: "Новые поправки в закон о персональных данных вступают в силу с 1 июля 2025 года. Рассказываем о ключевых изменениях.",
    date: "15 мая 2025",
    category: "Законодательство",
  },
  {
    id: 4,
    title: "Запущен экспорт документов в формате HTML",
    excerpt: "Теперь вы можете экспортировать созданные документы в формате HTML для удобного размещения на сайте.",
    date: "10 мая 2025",
    category: "Новые функции",
  },
  {
    id: 5,
    title: "Штрафы за нарушение 152-ФЗ увеличены вдвое",
    excerpt: "Госдума приняла закон об увеличении штрафов за нарушение законодательства о персональных данных.",
    date: "5 мая 2025",
    category: "Законодательство",
  }
];

export default function NewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const itemsToShow = 3; // Показываем по 3 новости

  // Автоматическое переключение слайдов
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoplay) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex + 1 >= newsItems.length - (itemsToShow - 1) ? 0 : prevIndex + 1
        );
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay]);

  // Переключение на предыдущий слайд
  const handlePrev = () => {
    setAutoplay(false);
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? newsItems.length - itemsToShow : prevIndex - 1
    );
  };

  // Переключение на следующий слайд
  const handleNext = () => {
    setAutoplay(false);
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= newsItems.length - (itemsToShow - 1) ? 0 : prevIndex + 1
    );
  };

  // Получаем текущие элементы для отображения
  const visibleItems = newsItems.slice(currentIndex, currentIndex + itemsToShow);
  
  // Если недостаточно элементов в конце, дополняем с начала
  if (visibleItems.length < itemsToShow) {
    visibleItems.push(...newsItems.slice(0, itemsToShow - visibleItems.length));
  }

  return (
    <div className="relative">
      <div className="grid md:grid-cols-3 gap-6">
        {visibleItems.map((item, index) => (
          <Card key={`${item.id}-${index}`} className="hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                  {item.category}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.date}
                </div>
              </div>
              <CardTitle className="line-clamp-2 text-xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-3 text-sm">
                {item.excerpt}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0 h-auto font-semibold">
                Читать полностью
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8 gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {newsItems.slice(0, newsItems.length - (itemsToShow - 1)).map((_, idx) => (
          <Button
            key={idx}
            variant={idx === currentIndex ? "default" : "outline"}
            size="sm"
            className="w-2 h-2 p-0 rounded-full"
            onClick={() => {
              setAutoplay(false);
              setCurrentIndex(idx);
            }}
          />
        ))}
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}