import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl?: string;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: "Обновление законодательства о персональных данных",
    excerpt: "Новые требования к обработке персональных данных вступают в силу с 1 сентября 2023 года.",
    date: "15 мая 2025",
    category: "Законодательство",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 2,
    title: "Риски несоблюдения 152-ФЗ для бизнеса",
    excerpt: "Какие штрафы и санкции могут ожидать компании, не соблюдающие требования закона о персональных данных.",
    date: "10 мая 2025",
    category: "Безопасность",
    imageUrl: "https://images.unsplash.com/photo-1607968565043-35d440ae4a21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 3,
    title: "Как правильно составить политику конфиденциальности",
    excerpt: "Основные элементы, которые должны быть включены в политику конфиденциальности вашего сайта.",
    date: "5 мая 2025",
    category: "Руководство",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 4,
    title: "Международные стандарты защиты данных",
    excerpt: "Сравнение требований GDPR и российского законодательства в области защиты персональных данных.",
    date: "1 мая 2025",
    category: "Международное право",
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 5,
    title: "Новые функции на нашей платформе",
    excerpt: "Мы добавили возможность автоматической генерации дополнительных типов документов.",
    date: "28 апреля 2025",
    category: "Обновления",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
  },
];

const NewsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {NEWS_ITEMS.map((news) => (
            <div className="min-w-0 flex-[0_0_100%] md:flex-[0_0_33.33%] pl-4 first:pl-0" key={news.id}>
              <Card className="h-full flex flex-col">
                {news.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={news.imageUrl} 
                      alt={news.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {news.category}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {news.date}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{news.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  <CardDescription className="text-sm">
                    {news.excerpt}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="px-0 text-primary">
                    Читать далее
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-4 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NewsCarousel;