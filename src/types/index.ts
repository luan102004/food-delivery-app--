// src/types/index.ts - COMPLETE FIXED VERSION

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
  passwordHash?: string; // ✅ ADDED - Missing type
  createdAt: Date;
  updatedAt: Date;
  // ✅ ADDED - Methods for password management
  comparePassword?: (password: string) => Promise<boolean>;
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
  updatedAt: Date; // ✅ ADDED
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
  updatedAt?: Date; // ✅ ADDED
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
  image?: string; // ✅ ADDED - For cart display
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
  updatedAt?: Date; // ✅ ADDED
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
  createdAt?: Date; // ✅ ADDED
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
  topItems?: Array<{ name: string; count: number; revenue?: number }>; // ✅ ADDED
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  revenue?: number; // ✅ ADDED - For revenue charts
  orders?: number; // ✅ ADDED - For order charts
}

// Language Types
export type Language = 'en' | 'vi';

export interface Translations {
  [key: string]: string | Translations;
}

// ✅ ADDED - Review Types (Referenced but not defined)
export interface Review {
  _id: string;
  orderId: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  foodRating: number;
  serviceRating: number;
  deliveryRating?: number;
  overallRating: number;
  comment?: string;
  images?: string[];
  response?: {
    text: string;
    respondedAt: Date;
  };
  isVerified: boolean;
  isHelpful?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ ADDED - Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: 'order_update' | 'promotion' | 'system' | 'driver_assigned' | 'new_order';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ ADDED - API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// ✅ ADDED - Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// ✅ ADDED - Filter Types
export interface RestaurantFilters {
  cuisine?: string;
  search?: string;
  minRating?: number;
  isOpen?: boolean;
  lat?: number;
  lng?: number;
  maxDistance?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  restaurantId?: string;
  driverId?: string;
  startDate?: Date;
  endDate?: Date;
}

// ✅ ADDED - Form Data Types
export interface SignUpFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ✅ ADDED - Map Types (if not in separate file)
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  coordinates: Coordinates;
  address: string;
  heading?: number;
  speed?: number;
  timestamp?: string;
}

// ✅ ADDED - Analytics Cache Types
export interface AnalyticsCache {
  _id: string;
  entityId: string;
  entityType: 'restaurant' | 'driver' | 'system';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  metrics: {
    revenue: number;
    orders: number;
    customers: number;
    avgOrderValue: number;
    topItems?: Array<{ name: string; count: number }>;
  };
  createdAt: Date;
  updatedAt: Date;
}