export const DOCUMENT_TYPES = {
  privacy: {
    name: "Политика конфиденциальности",
    description: "152-ФЗ совместимый документ",
    icon: "fas fa-user-shield",
    color: "primary",
  },
  terms: {
    name: "Пользовательское соглашение", 
    description: "Условия использования сайта",
    icon: "fas fa-handshake",
    color: "success",
  },
  consent: {
    name: "Согласие на обработку ПД",
    description: "Форма согласия пользователя",
    icon: "fas fa-check-circle", 
    color: "warning",
  },
  offer: {
    name: "Публичная оферта",
    description: "Условия продажи товаров/услуг",
    icon: "fas fa-file-contract",
    color: "purple",
  },
  cookie: {
    name: "Политика использования Cookie",
    description: "Информация об использовании cookie",
    icon: "fas fa-cookie-bite",
    color: "blue",
  },
  return: {
    name: "Политика возврата",
    description: "Правила возврата товаров и средств",
    icon: "fas fa-undo-alt",
    color: "green",
  },
} as const;

export const INDUSTRIES = [
  { value: "ecommerce", label: "Интернет-магазин" },
  { value: "medical", label: "Медицинские услуги" },
  { value: "education", label: "Образование" },
  { value: "fintech", label: "Финансовые услуги" },
  { value: "crypto", label: "Криптопроекты" },
  { value: "marketplace", label: "Маркетплейс" },
  { value: "mobile", label: "Мобильные приложения" },
  { value: "saas", label: "SaaS сервисы" },
  { value: "other", label: "Другое" },
] as const;

export const SUBSCRIPTION_LIMITS = {
  free: {
    documentsPerMonth: 3,
    features: [
      "До 3 документов в месяц",
      "Просмотр и копирование текста", 
      "Базовые шаблоны документов",
      "Стандартная поддержка",
    ],
    restrictions: [
      "Экспорт в PDF/DOC",
      "Редактирование документов",
      "Приоритетная поддержка",
    ],
  },
  premium: {
    documentsPerMonth: -1, // unlimited
    features: [
      "Безлимитное создание документов",
      "Экспорт в PDF, DOC, HTML",
      "Редактирование сгенерированного текста",
      "Расширенные шаблоны",
      "Приоритетная поддержка",
      "Персональные консультации",
      "Email уведомления",
    ],
    restrictions: [],
  },
} as const;

export const NEWS_CATEGORIES = {
  legal_news: {
    name: "Правовые новости",
    color: "primary",
    icon: "fas fa-gavel",
  },
  guides: {
    name: "Руководства",
    color: "success", 
    icon: "fas fa-book",
  },
  updates: {
    name: "Обновления",
    color: "warning",
    icon: "fas fa-sync",
  },
  faq: {
    name: "Вопросы и ответы",
    color: "purple",
    icon: "fas fa-question-circle",
  },
} as const;

export const CONTACT_INFO = {
  developer: {
    name: "РУКОДЕР",
    telegram: "@RussCoder",
    email: "rucoder.rf@yandex.ru",
    website: "рукодер.рф",
    phone: "+7 (985) 985-53-97",
  },
  support: {
    hours: "Пн-Пт: 9:00-18:00",
    timezone: "МСК",
  },
} as const;
