export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  ON_THE_WAY: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  DRIVER: 'driver',
  ADMIN: 'admin',
} as const;

export const PROMOTION_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_DELIVERY: 'free_delivery',
} as const;

export const DELIVERY_FEE = 3.99;
export const TAX_RATE = 0.08; // 8%
export const MIN_ORDER_AMOUNT = 10;
export const MAX_DELIVERY_DISTANCE = 15; // km

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30s
  UPLOAD: 60000, // 1min
} as const;