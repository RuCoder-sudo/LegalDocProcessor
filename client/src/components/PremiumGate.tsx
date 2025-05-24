import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Star } from "lucide-react";
import { Link } from "wouter";

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
  showUpgrade?: boolean;
}

export default function PremiumGate({ 
  children, 
  feature, 
  description = "Эта функция доступна только для премиум-пользователей", 
  showUpgrade = true 
}: PremiumGateProps) {
  const { user, isAuthenticated } = useAuth();

  // Show content if user is premium or admin
  if (isAuthenticated && user && (user.subscription === 'premium' || user.role === 'admin')) {
    return <>{children}</>;
  }

  // Show premium gate
  return (
    <Card className="border-premium/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-premium/10 p-3">
            <Crown className="h-8 w-8 text-premium" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5 text-premium" />
          Премиум функция
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-premium/5 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-premium" />
            {feature}
          </h4>
          <p className="text-sm text-muted-foreground">
            Для доступа к этой функции необходимо перейти на премиум-план
          </p>
        </div>

        {showUpgrade && (
          <div className="space-y-3">
            <div className="text-center">
              <Badge variant="outline" className="text-premium border-premium">
                Премиум возможности
              </Badge>
            </div>
            
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-success w-4"></i>
                Безлимитное создание документов
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-success w-4"></i>
                Экспорт в PDF, DOC, HTML
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-success w-4"></i>
                Редактирование сгенерированного текста
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-success w-4"></i>
                Приоритетная поддержка
              </li>
            </ul>

            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="premium-gradient text-white">
                <Link href="/premium">
                  <Crown className="mr-2 h-4 w-4" />
                  Перейти на премиум
                </Link>
              </Button>
              
              <div className="text-center text-xs text-muted-foreground">
                Свяжитесь с{" "}
                <a 
                  href="https://t.me/RussCoder" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @RussCoder
                </a>
                {" "}для оформления
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
