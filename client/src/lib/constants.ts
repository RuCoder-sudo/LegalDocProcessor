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
  { value: "real_estate", label: "Недвижимость" },
  { value: "automotive", label: "Автомобильная промышленность" },
  { value: "food", label: "Пищевая промышленность" },
  { value: "retail", label: "Розничная торговля" },
  { value: "manufacturing", label: "Производство" },
  { value: "construction", label: "Строительство" },
  { value: "consulting", label: "Консалтинг" },
  { value: "marketing", label: "Маркетинг и реклама" },
  { value: "beauty", label: "Красота и косметика" },
  { value: "sports", label: "Спорт и фитнес" },
  { value: "travel", label: "Туризм и путешествия" },
  { value: "entertainment", label: "Развлечения" },
  { value: "nonprofit", label: "Некоммерческие организации" },
  { value: "government", label: "Государственные услуги" },
  { value: "logistics", label: "Логистика и доставка" },
  { value: "telecommunications", label: "Телекоммуникации" },
  { value: "energy", label: "Энергетика" },
  { value: "agriculture", label: "Сельское хозяйство" },
  { value: "mining", label: "Горнодобывающая промышленность" },
  { value: "pharmaceutical", label: "Фармацевтика" },
  { value: "insurance", label: "Страхование" },
  { value: "journalism", label: "Журналистика и СМИ" },
  { value: "gaming", label: "Игровая индустрия" },
  { value: "legal", label: "Юридические услуги" },
  { value: "accounting", label: "Бухгалтерские услуги" },
  { value: "it_services", label: "IT услуги" },
  { value: "other", label: "Другое" },
] as const;

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Бесплатный",
    price: 0,
    period: "навсегда",
    documentsPerMonth: 2,
    features: [
      "2 документа в месяц",
      "Базовые шаблоны",
      "Просмотр документов",
      "Email поддержка"
    ],
    restrictions: [
      "Без скачивания PDF",
      "Без пользовательских полей",
      "Без QR-кодов",
      "Без брендинга"
    ],
    buttonText: "Начать бесплатно",
    popular: false,
  },
  premium: {
    name: "Премиум",
    price: 990,
    period: "в месяц",
    documentsPerMonth: -1, // unlimited
    features: [
      "Безлимитные документы",
      "Все типы документов",
      "Скачивание PDF",
      "Пользовательские поля",
      "QR-код генерация",
      "Удаление водяных знаков",
      "Брендинг компании",
      "Приоритетная поддержка",
      "Архив всех документов",
      "Экспорт в Word/HTML"
    ],
    restrictions: [],
    buttonText: "Выбрать Премиум",
    popular: true,
  },
  ultra: {
    name: "Ультра",
    price: 4990,
    period: "в месяц",
    documentsPerMonth: -1,
    features: [
      "Все функции Премиум",
      "Персональный менеджер",
      "Консультации по законодательству",
      "Приоритет в обновлениях",
      "Индивидуальные шаблоны",
      "Связаться с юристом"
    ],
    restrictions: [],
    buttonText: "Связаться с нами",
    popular: false,
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
