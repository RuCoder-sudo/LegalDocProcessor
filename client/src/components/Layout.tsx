import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import type { AuthUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import ScrollToTop from "@/components/ScrollToTop";
import { Menu, X, Scale, Crown, User, LogOut, Settings, Bell, Sun, Moon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const navigation = [
    { name: "Главная", href: "/", icon: "fas fa-home" },
    { name: "Документы", href: "/documents", icon: "fas fa-file-alt", authRequired: true },
    { name: "Примеры", href: "/examples", icon: "fas fa-eye" },
    { name: "Тарифы", href: "/premium", icon: "fas fa-crown" },
    { name: "Новости", href: "/news", icon: "fas fa-newspaper" },
    { name: "Контакты", href: "/contacts", icon: "fas fa-phone" },
  ];

  const filteredNavigation = navigation.filter(
    item => !item.authRequired || isAuthenticated
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-primary animate-bounce-subtle" />
              <span className="text-xl font-bold logo-title">ЮрДок Генератор</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                    location === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {/* Переключатель темы для всех пользователей */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
                title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>

              {isLoading ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {user?.subscription === 'premium' && (
                        <Crown className="absolute -top-1 -right-1 h-4 w-4 text-premium" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <Badge variant={user?.subscription === 'premium' ? 'default' : 'secondary'} className="w-fit">
                          {user?.subscription === 'premium' ? 'Премиум' : 'Бесплатный'}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Личный кабинет
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        Уведомления
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Админ-панель
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild className="animate-pulse-glow">
                    <Link href="/login">
                      <User className="mr-2 h-4 w-4" />
                      Войти
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    location === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
              {/* About Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center mb-4">
                  <Scale className="h-6 w-6 text-primary mr-2" />
                  <span className="text-xl font-bold">ЮрДок Генератор</span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Профессиональная платформа для автоматического создания юридических документов в соответствии с российским законодательством. 
                  Мы помогаем владельцам сайтов соблюдать требования 152-ФЗ и других правовых норм.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p><i className="fas fa-check-circle text-success mr-2"></i>Соответствие 152-ФЗ</p>
                  <p><i className="fas fa-check-circle text-success mr-2"></i>Актуальные шаблоны</p>
                  <p><i className="fas fa-check-circle text-success mr-2"></i>Экспорт в разные форматы</p>
                  <p><i className="fas fa-check-circle text-success mr-2"></i>Профессиональная поддержка</p>
                </div>
              </div>

              {/* Services Menu */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Услуги</h3>
                <ul className="space-y-3 text-gray-300">
                  <li><Link href="/examples?type=privacy" className="hover:text-primary transition-colors text-sm"><i className="fas fa-user-shield mr-2"></i>Политика конфиденциальности</Link></li>
                  <li><Link href="/examples?type=terms" className="hover:text-primary transition-colors text-sm"><i className="fas fa-handshake mr-2"></i>Пользовательское соглашение</Link></li>
                  <li><Link href="/examples?type=consent" className="hover:text-primary transition-colors text-sm"><i className="fas fa-check-circle mr-2"></i>Согласие на обработку ПД</Link></li>
                  <li><Link href="/examples?type=offer" className="hover:text-primary transition-colors text-sm"><i className="fas fa-file-contract mr-2"></i>Публичная оферта</Link></li>
                  <li><Link href="/examples?type=cookie" className="hover:text-primary transition-colors text-sm"><i className="fas fa-cookie-bite mr-2"></i>Политика Cookie</Link></li>
                  <li><Link href="/examples?type=return" className="hover:text-primary transition-colors text-sm"><i className="fas fa-undo-alt mr-2"></i>Политика возврата</Link></li>
                </ul>
              </div>

              {/* Information Menu */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Информация</h3>
                <ul className="space-y-3 text-gray-300">
                  <li><Link href="/premium" className="hover:text-primary transition-colors text-sm"><i className="fas fa-crown mr-2"></i>Тарифы</Link></li>
                  <li><Link href="/examples" className="hover:text-primary transition-colors text-sm"><i className="fas fa-eye mr-2"></i>Примеры документов</Link></li>
                  <li><Link href="/news" className="hover:text-primary transition-colors text-sm"><i className="fas fa-newspaper mr-2"></i>Правовые новости</Link></li>
                  <li><Link href="/contacts" className="hover:text-primary transition-colors text-sm"><i className="fas fa-phone mr-2"></i>Контакты</Link></li>
                  {user?.role === 'admin' && (
                    <li><Link href="/admin" className="hover:text-primary transition-colors text-sm"><i className="fas fa-cog mr-2"></i>Панель управления</Link></li>
                  )}
                  <li><a href="#help" className="hover:text-primary transition-colors text-sm"><i className="fas fa-question-circle mr-2"></i>Помощь</a></li>
                </ul>
              </div>
            </div>

            {/* Developer Info */}
            <div className="border-t border-gray-700 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-gray-300 text-sm mb-2">Разработано:</p>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm">
                    <a href="https://рукодер.рф" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                      <i className="fas fa-globe mr-2"></i>РУКОДЕР - рукодер.рф
                    </a>
                    <a href="https://t.me/RussCoder" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                      <i className="fab fa-telegram mr-2"></i>@RussCoder
                    </a>
                    <a href="mailto:rucoder.rf@yandex.ru" className="text-gray-400 hover:text-gray-300 transition-colors">
                      <i className="fas fa-envelope mr-2"></i>rucoder.rf@yandex.ru
                    </a>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-gray-400 text-sm">© 2024 ЮрДок Генератор</p>
                  <p className="text-gray-500 text-xs mt-1">Все права защищены</p>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="border-t border-gray-700 mt-8 pt-6">
              <div className="text-center text-xs text-gray-500">
                <p className="mb-2 break-words text-xs leading-relaxed">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Документы, создаваемые на платформе, носят информационный характер. 
                  Для решения сложных правовых вопросов рекомендуется консультация с квалифицированным юристом. 
                  Сайт использует файлы cookie для улучшения пользовательского опыта. 
                  Продолжая использование сайта, вы соглашаетесь с обработкой данных.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <Link href="/privacy" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0, 0)}>Политика конфиденциальности</Link>
                    <span className="text-gray-600">•</span>
                    <Link href="/terms" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0, 0)}>Пользовательское соглашение</Link>
                    <span className="text-gray-600">•</span>
                    <Link href="/important" className="hover:text-primary transition-colors" onClick={() => window.scrollTo(0, 0)}>Отказ от ответственности</Link>
                  </div>
                  {!isAuthenticated && (
                    <Button asChild size="sm" className="animate-pulse-glow">
                      <Link href="/login">
                        <User className="mr-2 h-4 w-4" />
                        Войти
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="p-2"
                    title={theme === 'light' ? 'Темная тема' : 'Светлая тема'}
                  >
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
      <ScrollToTop />
    </div>
  );
}
