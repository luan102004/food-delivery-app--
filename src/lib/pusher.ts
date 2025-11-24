// src/lib/pusher.ts
import Pusher from "pusher";
import PusherClient from "pusher-js";

const requiredEnvVars = [
  "PUSHER_APP_ID",
  "PUSHER_APP_KEY",
  "PUSHER_APP_SECRET",
  "PUSHER_APP_CLUSTER",
  "NEXT_PUBLIC_PUSHER_APP_KEY",
  "NEXT_PUBLIC_PUSHER_APP_CLUSTER",
];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error("❌ Missing Pusher ENV variables:", missingVars.join(", "));
}

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_APP_KEY || "",
  secret: process.env.PUSHER_APP_SECRET || "",
  cluster: process.env.PUSHER_APP_CLUSTER || "",
  useTLS: true,
});

let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("getPusherClient() can only run on client side");
  }

  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;

    if (!key || !cluster) {
      console.error("❌ Missing NEXT_PUBLIC pusher config");
      throw new Error("Missing Pusher client keys");
    }

    pusherClientInstance = new PusherClient(key, {
      cluster,
      forceTLS: true,
    });
  }

  return pusherClientInstance;
}

export const PUSHER_EVENTS = {
  ORDER_CREATED: "order:created",
  ORDER_UPDATED: "order:updated",
  ORDER_STATUS_CHANGED: "order:status-changed",
  DRIVER_LOCATION_UPDATED: "driver:location-updated",
  DRIVER_ASSIGNED: "driver:assigned",
  NOTIFICATION_NEW: "notification:new",
  RESTAURANT_NEW_ORDER: "restaurant:new-order",
} as const;

export const getPusherChannels = {
  customerOrder: (customerId: string) => `private-customer-${customerId}`,
  restaurantOrders: (restaurantId: string) => `private-restaurant-${restaurantId}`,
  driverChannel: (driverId: string) => `private-driver-${driverId}`,
  orderTracking: (orderNumber: string) => `presence-order-${orderNumber}`,
  userNotifications: (userId: string) => `private-user-${userId}`,
};

async function safeTrigger(
  channel: string,
  event: string,
  data: any,
  retries = 3
): Promise<boolean> {
  for (let i = 1; i <= retries; i++) {
    try {
      await pusherServer.trigger(channel, event, data);
      return true;
    } catch (err: any) {
      console.error(`❌ Trigger failed attempt ${i}/${retries}:`, err.message || err);
      if (i === retries) return false;
      await new Promise((res) => setTimeout(res, 700 * i));
    }
  }
  return false;
}

export async function triggerNotification(
  userId: string,
  message: string,
  extra: any = {}
) {
  const payload = {
    userId,
    message,
    extra,
    timestamp: new Date().toISOString(),
  };

  return await safeTrigger(
    getPusherChannels.userNotifications(userId),
    PUSHER_EVENTS.NOTIFICATION_NEW,
    payload
  );
}

export async function triggerOrderStatusUpdate(
  orderId: string,
  orderNumber: string,
  status: string,
  customerId: string,
  restaurantId: string,
  driverId?: string
) {
  const payload = {
    orderId,
    orderNumber,
    status,
    timestamp: new Date().toISOString(),
  };

  await Promise.allSettled([
    safeTrigger(
      getPusherChannels.customerOrder(customerId),
      PUSHER_EVENTS.ORDER_STATUS_CHANGED,
      payload
    ),

    safeTrigger(
      getPusherChannels.restaurantOrders(restaurantId),
      PUSHER_EVENTS.ORDER_UPDATED,
      payload
    ),

    driverId &&
      safeTrigger(
        getPusherChannels.driverChannel(driverId),
        PUSHER_EVENTS.ORDER_STATUS_CHANGED,
        payload
      ),

    safeTrigger(
      getPusherChannels.orderTracking(orderNumber),
      PUSHER_EVENTS.ORDER_STATUS_CHANGED,
      payload
    ),
  ]);
}

export async function triggerNewOrderNotification(
  restaurantId: string,
  orderData: any
) {
  return await safeTrigger(
    getPusherChannels.restaurantOrders(restaurantId),
    PUSHER_EVENTS.RESTAURANT_NEW_ORDER,
    {
      order: orderData,
      timestamp: new Date().toISOString(),
    }
  );
}

export async function triggerDriverLocationUpdate(
  driverId: string,
  orderNumber: string,
  location: { lat: number; lng: number; heading?: number; speed?: number }
) {
  return await safeTrigger(
    getPusherChannels.orderTracking(orderNumber),
    PUSHER_EVENTS.DRIVER_LOCATION_UPDATED,
    {
      driverId,
      location,
      timestamp: new Date().toISOString(),
    }
  );
}

export async function triggerDriverAssignment(
  customerId: string,
  orderNumber: string,
  driver: { id: string; name: string; phone: string; rating: number }
) {
  const payload = {
    orderNumber,
    driver,
    timestamp: new Date().toISOString(),
  };

  await Promise.allSettled([
    safeTrigger(
      getPusherChannels.customerOrder(customerId),
      PUSHER_EVENTS.DRIVER_ASSIGNED,
      payload
    ),
    safeTrigger(
      getPusherChannels.orderTracking(orderNumber),
      PUSHER_EVENTS.DRIVER_ASSIGNED,
      payload
    ),
  ]);
}
