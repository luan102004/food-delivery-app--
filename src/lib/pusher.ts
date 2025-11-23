// src/lib/pusher.ts - FIXED VERSION
import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// ============ CHECK ENV VARIABLES ============
const requiredEnvVars = [
  'PUSHER_APP_ID',
  'PUSHER_APP_KEY',
  'PUSHER_APP_SECRET',
  'PUSHER_APP_CLUSTER',
  'NEXT_PUBLIC_PUSHER_APP_KEY',
  'NEXT_PUBLIC_PUSHER_APP_CLUSTER',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing Pusher environment variables:', missingVars.join(', '));
}

// ============ SERVER SIDE PUSHER ============
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_APP_KEY || '',
  secret: process.env.PUSHER_APP_SECRET || '',
  cluster: process.env.PUSHER_APP_CLUSTER || '',
  useTLS: true,
});

// ============ CLIENT SIDE PUSHER ============
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient => {
  if (typeof window === 'undefined') {
    throw new Error('getPusherClient can only be called on client side');
  }

  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;

    if (!key || !cluster) {
      console.error('❌ Pusher client configuration missing');
      // Return mock instance to prevent crashes
      pusherClientInstance = {
        connection: {
          bind: () => {},
          unbind_all: () => {},
        },
        subscribe: () => ({
          bind: () => {},
          unbind_all: () => {},
        }),
        unsubscribe: () => {},
      } as any;
      return pusherClientInstance;
    }

    pusherClientInstance = new PusherClient(key, {
      cluster,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
    });
  }

  return pusherClientInstance;
};

// ============ PUSHER EVENTS ============
export const PUSHER_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status-changed',
  DRIVER_LOCATION_UPDATED: 'driver:location-updated',
  DRIVER_STATUS_CHANGED: 'driver:status-changed',
  DRIVER_ASSIGNED: 'driver:assigned',
  NOTIFICATION_NEW: 'notification:new',
  RESTAURANT_NEW_ORDER: 'restaurant:new-order',
} as const;

// ============ PUSHER CHANNELS ============
export const getPusherChannels = {
  customerOrder: (customerId: string) => `private-customer-${customerId}`,
  restaurantOrders: (restaurantId: string) => `private-restaurant-${restaurantId}`,
  driverChannel: (driverId: string) => `private-driver-${driverId}`,
  orderTracking: (orderNumber: string) => `presence-order-${orderNumber}`,
  publicUpdates: () => 'public-updates',
};

// ============ HELPER FUNCTIONS ============

// Safe trigger function with error handling
async function safeTrigger(channel: string, event: string, data: any) {
  try {
    await pusherServer.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error(`Failed to trigger Pusher event ${event} on ${channel}:`, error);
    return false;
  }
}

export async function triggerOrderStatusUpdate(
  orderId: string,
  orderNumber: string,
  status: string,
  customerId: string,
  restaurantId: string,
  driverId?: string
) {
  const data = {
    orderId,
    orderNumber,
    status,
    timestamp: new Date().toISOString(),
  };

  await Promise.allSettled([
    safeTrigger(getPusherChannels.customerOrder(customerId), PUSHER_EVENTS.ORDER_STATUS_CHANGED, data),
    safeTrigger(getPusherChannels.restaurantOrders(restaurantId), PUSHER_EVENTS.ORDER_UPDATED, data),
    driverId && safeTrigger(getPusherChannels.driverChannel(driverId), PUSHER_EVENTS.ORDER_STATUS_CHANGED, data),
    safeTrigger(getPusherChannels.orderTracking(orderNumber), PUSHER_EVENTS.ORDER_STATUS_CHANGED, data),
  ]);
}

export async function triggerDriverLocationUpdate(
  driverId: string,
  orderNumber: string,
  location: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
  }
) {
  const data = {
    driverId,
    location,
    timestamp: new Date().toISOString(),
  };

  await safeTrigger(
    getPusherChannels.orderTracking(orderNumber),
    PUSHER_EVENTS.DRIVER_LOCATION_UPDATED,
    data
  );
}

export async function triggerNewOrderNotification(
  restaurantId: string,
  orderData: any
) {
  await safeTrigger(
    getPusherChannels.restaurantOrders(restaurantId),
    PUSHER_EVENTS.RESTAURANT_NEW_ORDER,
    {
      order: orderData,
      timestamp: new Date().toISOString(),
    }
  );
}

export async function triggerDriverAssignment(
  customerId: string,
  orderNumber: string,
  driverData: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  }
) {
  const data = {
    orderNumber,
    driver: driverData,
    timestamp: new Date().toISOString(),
  };

  await Promise.allSettled([
    safeTrigger(getPusherChannels.customerOrder(customerId), PUSHER_EVENTS.DRIVER_ASSIGNED, data),
    safeTrigger(getPusherChannels.orderTracking(orderNumber), PUSHER_EVENTS.DRIVER_ASSIGNED, data),
  ]);
}

export async function triggerNotification(
  userId: string,
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    data?: any;
  }
) {
  await safeTrigger(
    getPusherChannels.customerOrder(userId),
    PUSHER_EVENTS.NOTIFICATION_NEW,
    {
      notification,
      timestamp: new Date().toISOString(),
    }
  );
}