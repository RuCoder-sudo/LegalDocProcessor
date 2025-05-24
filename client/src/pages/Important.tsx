import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, Scale, FileCheck } from "lucide-react";

export default function Important() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-xl border-2 border-red-200">
            <CardHeader className="text-center bg-red-50">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-red-800">
                ВАЖНО! Отказ от ответственности
              </CardTitle>
              <p className="text-red-600 mt-2 font-semibold">
                Обязательно ознакомьтесь перед использованием сервиса
              </p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">
                  Данный сервис предоставляется исключительно в информационных целях и не является заменой профессиональной юридической консультации.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Scale className="h-8 w-8 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">1. Юридическая ответственность</h3>
                    <p className="text-gray-700">
                      <strong>Администрация сервиса НЕ НЕСЕТ НИКАКОЙ ОТВЕТСТВЕННОСТИ</strong> за:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      <li>Юридические последствия использования сгенерированных документов</li>
                      <li>Соответствие документов специфическим требованиям вашего бизнеса</li>
                      <li>Актуальность правовых норм в сгенерированных документах</li>
                      <li>Ущерб от неправильного применения документов</li>
                      <li>Штрафы и санкции контролирующих органов</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <FileCheck className="h-8 w-8 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">2. Обязательная проверка</h3>
                    <p className="text-gray-700">
                      <strong>ВСЕ СГЕНЕРИРОВАННЫЕ ДОКУМЕНТЫ ТРЕБУЮТ ОБЯЗАТЕЛЬНОЙ ПРОВЕРКИ</strong> квалифицированным юристом перед использованием. Это включает:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      <li>Соответствие актуальному законодательству РФ</li>
                      <li>Адаптацию под специфику вашей деятельности</li>
                      <li>Проверку полноты и корректности правовых положений</li>
                      <li>Соответствие отраслевым требованиям</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Shield className="h-8 w-8 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">3. Ограничения использования</h3>
                    <p className="text-gray-700">Сервис предназначен для:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      <li>Создания черновых версий документов</li>
                      <li>Понимания структуры юридических документов</li>
                      <li>Экономии времени на начальной подготовке</li>
                      <li>Образовательных целей</li>
                    </ul>
                  </div>
                </div>

                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Изменения в законодательстве:</strong> Российское законодательство постоянно изменяется. 
                    Шаблоны могут не отражать последние изменения в правовых нормах. Всегда проверяйте актуальность 
                    требований на момент использования документов.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">4. Рекомендации по безопасному использованию</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>✅ Используйте документы как основу для работы с юристом</p>
                    <p>✅ Проверяйте соответствие вашей отрасли деятельности</p>
                    <p>✅ Регулярно обновляйте документы в соответствии с изменениями в законах</p>
                    <p>✅ Консультируйтесь с профильными специалистами</p>
                    <p>❌ Не используйте документы без профессиональной проверки</p>
                    <p>❌ Не полагайтесь исключительно на автоматически сгенерированный контент</p>
                  </div>
                </div>

                <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-red-800 mb-3">5. Окончательный отказ от ответственности</h3>
                  <p className="text-red-700 font-medium">
                    Используя данный сервис, вы полностью принимаете на себя все риски и ответственность 
                    за правовые последствия применения сгенерированных документов. Администрация сервиса 
                    не является юридическим лицом, оказывающим юридические услуги, и не несет ответственности 
                    за соблюдение вами требований законодательства РФ.
                  </p>
                </div>

                <div className="text-center py-6">
                  <p className="text-gray-600">
                    По всем вопросам: <a href="mailto:rucoder.rf@yandex.ru" className="text-blue-600 hover:underline">rucoder.rf@yandex.ru</a> 
                    или <a href="https://t.me/RussCoder" className="text-blue-600 hover:underline">@RussCoder</a>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}