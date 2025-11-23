// ============================================
// 🔧 FILE 2: src/lib/pusher.ts
// ============================================
// FIXED: Proper error handling and logging

import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Check ENV variables
const requiredEnvVars = [
  'PUSHER_APP_ID',
  'PUSHER_APP_KEY',
  'PUSHER_APP_SECRET',
  'PUSHER_APP_CLUSTER',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing Pusher variables:', missingVars.join(', '));
}

// Server-side Pusher
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_APP_KEY || '',
  secret: process.env.PUSHER_APP_SECRET || '',
  cluster: process.env.PUSHER_APP_CLUSTER || '',
  useTLS: true,
});

// Client-side Pusher
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
      throw new Error('Pusher configuration missing');
    }

    pusherClientInstance = new PusherClient(key, {
      cluster,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
    });
  }

  return pusherClientInstance;
};

// Events
export const PUSHER_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status-changed',
  DRIVER_LOCATION_UPDATED: 'driver:location-updated',
  DRIVER_ASSIGNED: 'driver:assigned',
  NOTIFICATION_NEW: 'notification:new',
  RESTAURANT_NEW_ORDER: 'restaurant:new-order',
} as const;

// Channels
export const getPusherChannels = {
  customerOrder: (customerId: string) => `private-customer-${customerId}`,
  restaurantOrders: (restaurantId: string) => `private-restaurant-${restaurantId}`,
  driverChannel: (driverId: string) => `private-driver-${driverId}`,
  orderTracking: (orderNumber: string) => `presence-order-${orderNumber}`,
};

// Safe trigger with retry
async function safeTrigger(
  channel: string,
  event: string,
  data: any,
  retries = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pusherServer.trigger(channel, event, data);
      console.log(`✅ Pusher [${channel}] → ${event}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Pusher attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt === retries) {
        console.error(`❌ Pusher FAILED after ${retries} attempts on ${channel}`);
        return false;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
}

// Trigger order status update to ALL parties
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

  console.log(`📤 Broadcasting order update: ${orderNumber} → ${status}`);

  // Trigger to all relevant channels simultaneously
  await Promise.allSettled([
    // Customer channel
    safeTrigger(
      getPusherChannels.customerOrder(customerId),
      PUSHER_EVENTS.ORDER_STATUS_CHANGED,
      data
    ),
    
    // Restaurant channel
    safeTrigger(
      getPusherChannels.restaurantOrders(restaurantId),
      PUSHER_EVENTS.ORDER_UPDATED,
      data
    ),
    
    // Driver channel (if assigned)
    driverId && safeTrigger(
      getPusherChannels.driverChannel(driverId),
      PUSHER_EVENTS.ORDER_STATUS_CHANGED,
      data
    ),
    
    // Order tracking channel (for live tracking)
    safeTrigger(
      getPusherChannels.orderTracking(orderNumber),
      PUSHER_EVENTS.ORDER_STATUS_CHANGED,
      data
    ),
  ]);

  console.log(`✅ Broadcast complete for ${orderNumber}`);
}

// Trigger new order notification to restaurant
export async function triggerNewOrderNotification(
  restaurantId: string,
  orderData: any
) {
  console.log(`📤 New order notification → Restaurant ${restaurantId}`);
  
  await safeTrigger(
    getPusherChannels.restaurantOrders(restaurantId),
    PUSHER_EVENTS.RESTAURANT_NEW_ORDER,
    {
      order: orderData,
      timestamp: new Date().toISOString(),
    }
  );
}

// Trigger driver location update
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

// Trigger driver assignment
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
    safeTrigger(
      getPusherChannels.customerOrder(customerId),
      PUSHER_EVENTS.DRIVER_ASSIGNED,
      data
    ),
    safeTrigger(
      getPusherChannels.orderTracking(orderNumber),
      PUSHER_EVENTS.DRIVER_ASSIGNED,
      data
    ),
  ]);
}