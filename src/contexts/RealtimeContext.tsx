// src/contexts/RealtimeContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getPusherClient, getPusherChannels, PUSHER_EVENTS } from '@/lib/pusher';
import type { Channel } from 'pusher-js';

interface DriverLocation {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

interface OrderUpdate {
  orderId: string;
  orderNumber: string;
  status: string;
  timestamp: string;
}

interface DriverAssignment {
  orderNumber: string;
  driver: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  timestamp: string;
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  timestamp: string;
}

interface RealtimeContextType {
  isConnected: boolean;
  orderUpdates: OrderUpdate[];
  driverLocation: DriverLocation | null;
  notifications: NotificationData[];
  subscribeToOrder: (orderNumber: string) => void;
  unsubscribeFromOrder: (orderNumber: string) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [subscribedChannels, setSubscribedChannels] = useState<Map<string, Channel>>(new Map());

  const pusherClient = getPusherClient();

  // Initialize connection
  useEffect(() => {
    if (!session?.user) return;

    pusherClient.connection.bind('connected', () => {
      console.log('✅ Pusher connected');
      setIsConnected(true);
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('❌ Pusher disconnected');
      setIsConnected(false);
    });

    pusherClient.connection.bind('error', (error: any) => {
      console.error('❌ Pusher error:', error);
    });

    return () => {
      pusherClient.connection.unbind_all();
    };
  }, [session, pusherClient]);

  // Subscribe to user's personal channel
  useEffect(() => {
    if (!session?.user?.id) return;

    const userId = session.user.id;
    const role = session.user.role as string;

    let channelName = '';
    
    if (role === 'customer') {
      channelName = getPusherChannels.customerOrder(userId);
    } else if (role === 'restaurant') {
      channelName = getPusherChannels.restaurantOrders(userId);
    } else if (role === 'driver') {
      channelName = getPusherChannels.driverChannel(userId);
    }

    if (!channelName) return;

    const channel = pusherClient.subscribe(channelName);

    // Listen for order status changes
    channel.bind(PUSHER_EVENTS.ORDER_STATUS_CHANGED, (data: OrderUpdate) => {
      console.log('📦 Order status changed:', data);
      setOrderUpdates(prev => [data, ...prev].slice(0, 20));
    });

    // Listen for new orders (restaurant)
    channel.bind(PUSHER_EVENTS.RESTAURANT_NEW_ORDER, (data: any) => {
      console.log('🆕 New order received:', data);
      setNotifications(prev => [
        {
          id: data.order.orderNumber,
          title: 'New Order!',
          message: `Order #${data.order.orderNumber} - $${data.order.total}`,
          type: 'new_order',
          data: data.order,
          timestamp: data.timestamp,
        },
        ...prev,
      ]);
    });

    // Listen for driver assignments
    channel.bind(PUSHER_EVENTS.DRIVER_ASSIGNED, (data: DriverAssignment) => {
      console.log('🚗 Driver assigned:', data);
      setNotifications(prev => [
        {
          id: `driver-${data.orderNumber}`,
          title: 'Driver Assigned!',
          message: `${data.driver.name} is on the way`,
          type: 'driver_assigned',
          data: data.driver,
          timestamp: data.timestamp,
        },
        ...prev,
      ]);
    });

    // Listen for notifications
    channel.bind(PUSHER_EVENTS.NOTIFICATION_NEW, (data: any) => {
      console.log('🔔 New notification:', data);
      setNotifications(prev => [data.notification, ...prev]);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [session, pusherClient]);

  // Subscribe to specific order tracking
  const subscribeToOrder = useCallback((orderNumber: string) => {
    const channelName = getPusherChannels.orderTracking(orderNumber);
    
    if (subscribedChannels.has(channelName)) {
      console.log('Already subscribed to', channelName);
      return;
    }

    const channel = pusherClient.subscribe(channelName);

    // Listen for order status changes
    channel.bind(PUSHER_EVENTS.ORDER_STATUS_CHANGED, (data: OrderUpdate) => {
      console.log('📦 Order status update:', data);
      setOrderUpdates(prev => [data, ...prev].slice(0, 20));
    });

    // Listen for driver location updates
    channel.bind(PUSHER_EVENTS.DRIVER_LOCATION_UPDATED, (data: any) => {
      console.log('📍 Driver location updated:', data);
      setDriverLocation(data.location);
    });

    // Listen for driver assignment
    channel.bind(PUSHER_EVENTS.DRIVER_ASSIGNED, (data: DriverAssignment) => {
      console.log('🚗 Driver assigned to order:', data);
    });

    setSubscribedChannels(prev => new Map(prev).set(channelName, channel));
    console.log('✅ Subscribed to order tracking:', orderNumber);
  }, [pusherClient, subscribedChannels]);

  // Unsubscribe from order tracking
  const unsubscribeFromOrder = useCallback((orderNumber: string) => {
    const channelName = getPusherChannels.orderTracking(orderNumber);
    const channel = subscribedChannels.get(channelName);

    if (channel) {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
      
      setSubscribedChannels(prev => {
        const newMap = new Map(prev);
        newMap.delete(channelName);
        return newMap;
      });
      
      console.log('❌ Unsubscribed from order tracking:', orderNumber);
    }
  }, [pusherClient, subscribedChannels]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        orderUpdates,
        driverLocation,
        notifications,
        subscribeToOrder,
        unsubscribeFromOrder,
        clearNotifications,
        markNotificationRead,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}