import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Download, X, FileText, Calendar, User } from "lucide-react";
import { UserDocument } from "@/lib/types";

interface DocumentViewerProps {
  document: UserDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentViewer({ document, open, onOpenChange }: DocumentViewerProps) {
  if (!document) return null;

  const handleDownload = () => {
    // Создаем PDF или текстовый файл для скачивания
    const content = document.generatedContent || 'Содержимое документа недоступно';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getDocumentTypeName = (type: string) => {
    const types: Record<string, string> = {
      privacy: 'Политика конфиденциальности',
      terms: 'Пользовательское соглашение',
      consent: 'Согласие на обработку ПД',
      offer: 'Договор оферты',
      cookie: 'Политика cookies',
      return: 'Политика возврата'
    };
    return types[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">{document.name}</DialogTitle>
                <DialogDescription className="flex items-center space-x-4 mt-1">
                  <Badge variant="secondary">
                    {getDocumentTypeName(document.type)}
                  </Badge>
                  <span className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(document.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  <span className="flex items-center text-sm">
                    <User className="h-3 w-3 mr-1" />
                    {document.formData?.companyName || 'Не указано'}
                  </span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleDownload} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Скачать
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Информация о компании */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3">Информация о компании</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Название:</span> {document.formData?.companyName || 'Не указано'}
              </div>
              <div>
                <span className="font-medium">ИНН:</span> {document.formData?.inn || 'Не указано'}
              </div>
              <div>
                <span className="font-medium">Адрес:</span> {document.formData?.legalAddress || 'Не указано'}
              </div>
              <div>
                <span className="font-medium">Сайт:</span> {document.formData?.websiteUrl || 'Не указано'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {document.formData?.contactEmail || 'Не указано'}
              </div>
              <div>
                <span className="font-medium">Телефон:</span> {document.formData?.phone || 'Не указано'}
              </div>
            </div>
          </div>

          {/* Содержимое документа */}
          <div>
            <h4 className="font-medium mb-3">Содержимое документа</h4>
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {document.generatedContent || 'Содержимое документа недоступно'}
              </div>
            </ScrollArea>
          </div>

          {/* Статус */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Статус:</span>
              <Badge variant={document.status === 'completed' ? 'default' : 'secondary'}>
                {document.status === 'completed' ? 'Готов' : 
                 document.status === 'draft' ? 'Черновик' : 'Архив'}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Обновлен: {new Date(document.updatedAt).toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}