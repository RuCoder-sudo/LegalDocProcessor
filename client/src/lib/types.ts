export interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'premium' | 'admin';
  subscription: 'free' | 'premium';
  documentsCreated: number;
  documentsLimit: number;
  profileImageUrl?: string;
}

export interface DocumentFormData {
  type: 'privacy' | 'terms' | 'consent' | 'offer' | 'cookie' | 'return' | 'charter';
  ownerType: 'individual' | 'legal';
  companyName: string;
  websiteUrl: string;
  contactEmail: string;
  phone?: string;
  industry?: string;
  
  // Поля для юридических лиц
  inn?: string;
  ogrn?: string;
  legalAddress?: string;
  
  // Дополнительные поля
  registrar?: string;
  hostingProvider?: string;
  
  // Поля настройки
  isSmi?: boolean;
  userCanPost?: boolean;
  agreementStart?: 'any_use' | 'after_registration';
  agreementDuration?: 'indefinite' | 'until_new_version';
  canAdminChange?: boolean;
  notifyChanges?: 'yes' | 'sometimes' | 'no';
  
  // Массивы опций
  userRights?: string[];
  adminRights?: string[];
  userObligations?: string[];
  adminObligations?: string[];
  dataTypes?: string[];
  
  // QR-код
  generateQr?: boolean;
  qrData?: string;
}

export interface UserDocument {
  id: number;
  userId: string;
  name: string;
  type: string;
  formData: DocumentFormData;
  generatedContent?: string;
  status: 'draft' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: 'legal_update' | 'reminder' | 'info';
  isRead: boolean;
  createdAt: string;
}

export interface DocumentTemplate {
  id: number;
  name: string;
  type: string;
  industry?: string;
  isPremium: boolean;
  exampleContent?: string;
}

export interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  documentsCreated: number;
}
