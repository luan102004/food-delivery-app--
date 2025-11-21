// User Types
export type UserRole = 'customer' | 'restaurant' | 'driver' | 'admin';

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Restaurant Types
export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  address: Address;
  phone: string;
  email: string;
  image: string;
  rating: number;
  cuisine: string[];
  openingHours: OpeningHours;
  isOpen: boolean;
  createdAt: Date;
}

export interface OpeningHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

export interface TimeSlot {
  open: string;
  close: string;
  isClosed: boolean;
}

// Menu Types
export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
  tags: string[];
  createdAt: Date;
}

// Order Types
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'picked_up' 
  | 'on_the_way' 
  | 'delivered' 
  | 'cancelled';

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  promotionId?: string;
  notes?: string;
  estimatedDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

// Promotion Types
export type PromotionType = 'percentage' | 'fixed' | 'free_delivery';

export interface Promotion {
  _id: string;
  code: string;
  type: PromotionType;
  value: number;
  description: string;
  minOrderAmount: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  createdAt: Date;
}

// Driver Location Types
export interface DriverLocation {
  _id: string;
  driverId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  heading?: number;
  speed?: number;
  isAvailable: boolean;
  currentOrderId?: string;
  updatedAt: Date;
}

// Cart Types
export interface CartItem extends OrderItem {
  image: string;
  restaurantId: string;
}

// Analytics Types
export interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  growth: number;
  chartData: ChartDataPoint[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Language Types
export type Language = 'en' | 'vi';

export interface Translations {
  [key: string]: string | Translations;
}