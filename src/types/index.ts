// src/types/index.ts
import { Types } from "mongoose";

// =======================
// USER ADDRESS (Simple)
// =======================
export interface UserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// =======================
// RESTAURANT GEOJSON ADDRESS
// =======================
export interface LocationGeoJSON {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: LocationGeoJSON;
}

// =======================
// USER
// =======================
export type UserRole = "customer" | "restaurant" | "driver" | "admin";

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  address?: UserAddress;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword?: (password: string) => Promise<boolean>;
}

// =======================
// RESTAURANT
// =======================
export interface TimeSlot {
  open: string;
  close: string;
  isClosed: boolean;
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

export interface Restaurant {
  _id: string | Types.ObjectId;
  name: string;
  description: string;
  ownerId: string | Types.ObjectId;

  address: GeoAddress;

  phone?: string;
  email?: string;
  image: string;

  rating: number;
  cuisine: string[];
  openingHours: OpeningHours;

  isOpen: boolean;
  isAddressComplete: boolean;

  createdAt: Date;
  updatedAt: Date;

  canAcceptOrders?: boolean;
  id?: string;
}

// =======================
// ORDER
// =======================
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

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
  deliveryAddress: UserAddress;
  promotionId?: string;
  notes?: string;
  estimatedDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// =======================
// PROMOTION
// =======================
export type PromotionType = "percentage" | "fixed" | "free_delivery";

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
  updatedAt?: Date;
}

// =======================
// DRIVER LOCATION
// =======================
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
  createdAt?: Date;
}

// =======================
// CART
// =======================
export interface CartItem extends OrderItem {
  image: string;
  restaurantId: string;
}

// =======================
// ANALYTICS
// =======================
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  revenue?: number;
  orders?: number;
}

export interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  growth: number;
  chartData: ChartDataPoint[];
  topItems?: Array<{ name: string; count: number; revenue?: number }>;
}

// =======================
// REVIEWS
// =======================
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

// =======================
// NOTIFICATION
// =======================
export interface Notification {
  _id: string;
  userId: string;
  type:
    | "order_update"
    | "promotion"
    | "system"
    | "driver_assigned"
    | "new_order";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =======================
// API RESPONSE
// =======================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// =======================
// FILTERS
// =======================
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

// =======================
// AUTH FORM TYPES
// =======================
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

// =======================
// MAP
// =======================
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

// =======================
// ANALYTICS CACHE
// =======================
export interface AnalyticsCache {
  _id: string;
  entityId: string;
  entityType: "restaurant" | "driver" | "system";
  period: "daily" | "weekly" | "monthly" | "yearly";
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
