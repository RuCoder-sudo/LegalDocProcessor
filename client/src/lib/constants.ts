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
  charter: {
    name: "Устав сайта",
    description: "Правила поведения и использования платформы",
    icon: "fas fa-scroll",
    color: "indigo",
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
    documentsPerMonth: 3,
    features: [
      "3 документа в месяц",
      "Базовые шаблоны",
      "Просмотр документов",
      "Копирование текста",
      "Email поддержка",
      "Доступ к примерам"
    ],
    restrictions: [
      "Без скачивания PDF",
      "Без пользовательских полей",
      "Без QR-кодов",
      "Без расширенных шаблонов",
      "С водяными знаками"
    ],
    buttonText: "Начать бесплатно",
    popular: false,
  },
  premium: {
    name: "Премиум",
    price: 1990,
    period: "в месяц",
    documentsPerMonth: -1, // unlimited
    features: [
      "Безлимитные документы",
      "Все типы документов + Устав сайта",
      "Скачивание PDF/DOC/HTML",
      "Расширенные шаблоны с радио-кнопками",
      "QR-код генерация и настройка",
      "Пользовательские поля и чекбоксы",
      "Удаление водяных знаков",
      "Брендинг компании (логотип)",
      "Архив всех документов",
      "Telegram уведомления",
      "Приоритетная поддержка 8 часов",
      "История изменений документов",
      "Экспорт в разных форматах",
      "Демо версии документов",
      "Автоматические обновления шаблонов",
      "Возможность редактирования",
      "Сохранение в облаке",
      "Массовая генерация документов"
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
      "Юридические консультации",
      "Проверка документов юристом",
      "Индивидуальные шаблоны на заказ",
      "API доступ для интеграций",
      "Приоритет в разработке функций",
      "Персональная настройка бота",
      "Отправка уведомлений в группы",
      "Белый лейбл (свой брендинг)",
      "Интеграция с CRM системами",
      "Массовая генерация документов",
      "Аналитика и отчеты",
      "24/7 поддержка",
      "Обучение команды"
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

export const FEEDBACK_TYPES = {
  suggestion: { name: "Предложение", icon: "fas fa-lightbulb", color: "blue" },
  complaint: { name: "Жалоба", icon: "fas fa-exclamation-triangle", color: "red" },
  compliment: { name: "Благодарность", icon: "fas fa-heart", color: "green" },
  question: { name: "Вопрос", icon: "fas fa-question-circle", color: "purple" },
} as const;

export const FEEDBACK_CATEGORIES = {
  interface: { name: "Интерфейс", icon: "fas fa-desktop" },
  functionality: { name: "Функциональность", icon: "fas fa-cogs" },
  content: { name: "Контент", icon: "fas fa-file-alt" },
  performance: { name: "Производительность", icon: "fas fa-tachometer-alt" },
} as const;

export const USER_RIGHTS_OPTIONS = [
  "Искать информацию",
  "Получать информацию", 
  "Создавать информацию",
  "Распространять информацию",
  "Комментировать",
  "Изменять рейтинг пользователей"
];

export const COPY_RIGHTS_OPTIONS = [
  "с указанием источника",
  "с разрешения Администрации", 
  "с разрешения Автора"
];

export const HIDE_INFO_RIGHTS_OPTIONS = [
  "о пользователе",
  "переданной пользователем сайту"
];

export const USE_INFO_RIGHTS_OPTIONS = [
  "для личных некоммерческих целей",
  "в коммерческих целях с разрешения Администрации",
  "в коммерческих целях с разрешения правообладателей", 
  "в коммерческих целях без специального разрешения"
];

export const ADMIN_RIGHTS_OPTIONS = [
  "Создавать, изменять, отменять правила",
  "Ограничивать доступ к любой информации на сайте",
  "Создавать, изменять, удалять информацию",
  "Удалять учетные записи",
  "Отказывать в регистрации"
];

export const USER_OBLIGATIONS_OPTIONS = [
  "Обеспечить достоверность предоставляемой информации",
  "Обеспечивать сохранность личных данных от доступа третьих лиц",
  "Обновлять Персональные данные, предоставленные при регистрации, в случае их изменения",
  "Не копировать информацию с других источников",
  "При копировании информации с других источников, включать в её состав информацию об авторе",
  "Не распространять информацию, которая направлена на пропаганду войны, разжигание национальной, расовой или религиозной ненависти и вражды",
  "Не нарушать работоспособность сайта",
  "Не создавать несколько учётных записей на Сайте, если фактически они принадлежат одному и тому же лицу",
  "Не совершать действия, направленные на введение других Пользователей в заблуждение",
  "Не передавать в пользование свою учетную запись и/или логин и пароль своей учетной записи третьим лицам",
  "Не регистрировать учетную запись от имени или вместо другого лица за исключением случаев, предусмотренных законодательством РФ",
  "Не размещать материалы рекламного, эротического, порнографического или оскорбительного характера",
  "Не использовать скрипты (программы) для автоматизированного сбора информации и/или взаимодействия с Сайтом"
];

export const ADMIN_OBLIGATIONS_OPTIONS = [
  "поддерживать работоспособность сайта",
  "осуществлять разностороннюю защиту учетной записи Пользователя",
  "Защищать информацию, распространение которой ограничено или запрещено законами",
  "предоставить всю доступную информацию о Пользователе уполномоченным на то органам государственной власти в случаях, установленных законом"
];

export const DATA_TYPES_OPTIONS = [
  "фамилия, имя, отчество",
  "электронный адрес",
  "номера телефонов", 
  "год, месяц, дата и место рождения",
  "фотографии",
  "адрес проживания",
  "паспортные данные",
  "банковские реквизиты",
  "данные о покупках",
  "IP-адрес и информация о браузере"
];

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
