import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  FileText, 
  Download, 
  CreditCard, 
  User, 
  Settings, 
  Mail, 
  Phone,
  MessageCircle,
  BookOpen,
  Zap,
  Crown
} from "lucide-react";

export default function Help() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Центр помощи
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Найдите ответы на популярные вопросы и получите помощь по использованию сервиса
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Основной контент */}
            <div className="lg:col-span-2 space-y-8">
              {/* Быстрый старт */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-blue-600" />
                    Быстрый старт
                  </CardTitle>
                  <CardDescription>
                    Основные шаги для начала работы с сервисом
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Регистрация</h4>
                        <p className="text-sm text-muted-foreground">Создайте аккаунт, указав email и пароль</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">Выбор документа</h4>
                        <p className="text-sm text-muted-foreground">Перейдите в генератор и выберите нужный тип документа</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium">Заполнение данных</h4>
                        <p className="text-sm text-muted-foreground">Укажите информацию о вашей компании</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-medium">Скачивание</h4>
                        <p className="text-sm text-muted-foreground">Получите готовый документ в формате PDF</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Часто задаваемые вопросы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Как создать документ?</AccordionTrigger>
                      <AccordionContent>
                        Перейдите на страницу "Генератор документов", выберите нужный тип документа, заполните форму с информацией о вашей компании и нажмите "Создать документ". Система автоматически сгенерирует документ, соответствующий российскому законодательству.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>Какие документы доступны бесплатно?</AccordionTrigger>
                      <AccordionContent>
                        В бесплатном тарифе вы можете создать до 2 документов любого типа: политика конфиденциальности, пользовательское соглашение, согласие на обработку данных, договор оферты, политика cookies и положение о возврате. Документы будут содержать водяной знак.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>Чем отличается премиум подписка?</AccordionTrigger>
                      <AccordionContent>
                        Премиум подписка дает безлимитное создание документов, удаление водяных знаков, доступ к расширенным шаблонам, генерацию QR-кодов, приоритетную поддержку и автоматические обновления при изменении законодательства.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                      <AccordionTrigger>Где найти созданные документы?</AccordionTrigger>
                      <AccordionContent>
                        Все ваши документы сохраняются в личном кабинете. Войдите в аккаунт и перейдите в раздел "Личный кабинет", где вы увидите список всех созданных документов с возможностью просмотра и скачивания.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                      <AccordionTrigger>Как обновить подписку?</AccordionTrigger>
                      <AccordionContent>
                        Перейдите на страницу "Тарифы", выберите подходящий план и нажмите "Обновить подписку". Оплата производится через безопасную платежную систему. После оплаты новые возможности станут доступны немедленно.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-6">
                      <AccordionTrigger>Соответствуют ли документы законодательству?</AccordionTrigger>
                      <AccordionContent>
                        Да, все шаблоны разработаны практикующими юристами и регулярно обновляются в соответствии с изменениями в российском законодательстве. Мы следим за всеми изменениями в законах о персональных данных, защите прав потребителей и электронной коммерции.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-7">
                      <AccordionTrigger>Можно ли редактировать готовые документы?</AccordionTrigger>
                      <AccordionContent>
                        Документы создаются на основе ваших данных и готовы к использованию. Для премиум пользователей доступны расширенные настройки и дополнительные поля. Если нужны существенные изменения, рекомендуем обратиться к юристу.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-8">
                      <AccordionTrigger>Что делать если документ не скачивается?</AccordionTrigger>
                      <AccordionContent>
                        Проверьте интернет-соединение и попробуйте еще раз. Убедитесь, что браузер не блокирует загрузки. Если проблема сохраняется, обратитесь в службу поддержки через форму обратной связи или по email support@legalrfdocs.ru.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Руководства по типам документов */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    Руководства по документам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Политика конфиденциальности</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Документ о том, как вы собираете и используете персональные данные пользователей
                      </p>
                      <Badge variant="secondary">Обязательно для сайтов</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Пользовательское соглашение</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Правила использования вашего сайта или сервиса
                      </p>
                      <Badge variant="secondary">Защищает от споров</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Согласие на обработку</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Форма для получения согласия на обработку персональных данных
                      </p>
                      <Badge variant="secondary">Требование 152-ФЗ</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Договор оферты</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Публичный договор для интернет-магазинов и сервисов
                      </p>
                      <Badge variant="secondary">Для продаж</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Боковая панель */}
            <div className="space-y-6">
              {/* Быстрые действия */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Создать документ
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    Личный кабинет
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Crown className="h-4 w-4 mr-2 text-blue-600" />
                    Обновить подписку
                  </Button>
                </CardContent>
              </Card>

              {/* Связь с поддержкой */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Нужна помощь?</CardTitle>
                  <CardDescription>
                    Свяжитесь с нашей службой поддержки
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">support@legalrfdocs.ru</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Онлайн чат</p>
                      <p className="text-sm text-muted-foreground">Доступен 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Телефон</p>
                      <p className="text-sm text-muted-foreground">+7 (xxx) xxx-xx-xx</p>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Написать в поддержку
                  </Button>
                </CardContent>
              </Card>

              {/* Полезные ссылки */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Полезные ссылки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start h-auto p-2">
                    <div className="text-left">
                      <p className="font-medium">Примеры документов</p>
                      <p className="text-xs text-muted-foreground">Посмотрите готовые образцы</p>
                    </div>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-auto p-2">
                    <div className="text-left">
                      <p className="font-medium">Обновления законов</p>
                      <p className="text-xs text-muted-foreground">Последние изменения</p>
                    </div>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-auto p-2">
                    <div className="text-left">
                      <p className="font-medium">Видео инструкции</p>
                      <p className="text-xs text-muted-foreground">Обучающие материалы</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}