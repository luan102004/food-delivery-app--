// src/lib/pusher.ts
import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// ============ SERVER SIDE PUSHER ============
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,        // FIXED
  secret: process.env.PUSHER_APP_SECRET!,  // FIXED
  cluster: process.env.PUSHER_APP_CLUSTER!,// FIXED
  useTLS: true,
});

// ============ CLIENT SIDE PUSHER ============
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient => {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,     // FIXED
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!, // FIXED
        enabledTransports: ['ws', 'wss'],
      }
    );
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

/**
 * Trigger order status update
 */
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

  // Notify customer
  await pusherServer.trigger(
    getPusherChannels.customerOrder(customerId),
    PUSHER_EVENTS.ORDER_STATUS_CHANGED,
    data
  );

  // Notify restaurant
  await pusherServer.trigger(
    getPusherChannels.restaurantOrders(restaurantId),
    PUSHER_EVENTS.ORDER_UPDATED,
    data
  );

  // Notify driver if assigned
  if (driverId) {
    await pusherServer.trigger(
      getPusherChannels.driverChannel(driverId),
      PUSHER_EVENTS.ORDER_STATUS_CHANGED,
      data
    );
  }

  // Update order tracking channel
  await pusherServer.trigger(
    getPusherChannels.orderTracking(orderNumber),
    PUSHER_EVENTS.ORDER_STATUS_CHANGED,
    data
  );
}

/**
 * Trigger driver location update
 */
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

  // Update order tracking channel
  await pusherServer.trigger(
    getPusherChannels.orderTracking(orderNumber),
    PUSHER_EVENTS.DRIVER_LOCATION_UPDATED,
    data
  );
}

/**
 * Trigger new order notification to restaurant
 */
export async function triggerNewOrderNotification(
  restaurantId: string,
  orderData: any
) {
  await pusherServer.trigger(
    getPusherChannels.restaurantOrders(restaurantId),
    PUSHER_EVENTS.RESTAURANT_NEW_ORDER,
    {
      order: orderData,
      timestamp: new Date().toISOString(),
    }
  );
}

/**
 * Trigger driver assignment
 */
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
  await pusherServer.trigger(
    getPusherChannels.customerOrder(customerId),
    PUSHER_EVENTS.DRIVER_ASSIGNED,
    {
      orderNumber,
      driver: driverData,
      timestamp: new Date().toISOString(),
    }
  );

  await pusherServer.trigger(
    getPusherChannels.orderTracking(orderNumber),
    PUSHER_EVENTS.DRIVER_ASSIGNED,
    {
      driver: driverData,
      timestamp: new Date().toISOString(),
    }
  );
}

/**
 * Trigger notification
 */
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
  await pusherServer.trigger(
    getPusherChannels.customerOrder(userId),
    PUSHER_EVENTS.NOTIFICATION_NEW,
    {
      notification,
      timestamp: new Date().toISOString(),
    }
  );
}