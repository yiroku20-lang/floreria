export type ProductCategory =
  | 'Citas & Romance'
  | 'Graduaciones'
  | 'Cumpleaños'
  | 'Condolencias & Homenaje'
  | 'Tulipanes'
  | 'Rosas de Lujo'
  | 'Ramos de Autor'
  | 'Flores Preservadas'
  | 'Merchandising & Regalos';

export interface ImageFraming {
  zoom: number;
  x: number; // percentage (-50 to 50)
  y: number; // percentage (-50 to 50)
  rotation?: number; // 0, 90, 180, 270
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  originalImageUrl?: string;
  framing?: ImageFraming;
  tags?: ('Bestseller' | 'Nuevo' | 'Temporada' | 'Exclusivo' | 'Oferta')[];
  careTips?: string[];
  stemCount?: string;
  featured?: boolean;
  occasion?: 'Citas & Romance' | 'Graduaciones' | 'Cumpleaños' | 'Condolencias & Homenaje' | 'Aniversarios' | 'Agradecimiento' | 'General';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DedicationCard {
  enabled: boolean;
  to: string;
  from: string;
  message: string;
}

export type DeliveryType = 'delivery' | 'pickup';

export type OrderStatus = 'Nuevo' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address?: string;
  reference?: string;
  district?: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  dedicationCard?: DedicationCard;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  notes?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'salida';
  quantity: number;
  reason: string;
  staffName: string;
  date: string;
}

export interface PromoConfig {
  isEnabled: boolean;
  title: string;
  subtitle: string;
  badge: string;
  couponCode?: string;
  driveImageUrl: string;
  ctaText: string;
  categoryRedirect?: string;
}

export interface BoutiqueSettings {
  whatsappNumber: string; // e.g. 51987654321
  storeName: string;
  storeAddress: string;
  storeCity: string;
  openingHours: string;
  defaultDeliveryFee: number;
}

export interface AdminUser {
  username: string;
  email: string;
  name: string;
  role: 'Administrador' | 'Super Admin';
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  loginTime: string;
}
