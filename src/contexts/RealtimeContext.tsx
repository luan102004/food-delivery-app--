// src/contexts/RealtimeContext.tsx - FIXED VERSION
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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
  const [subscribedChannels] = useState<Map<string, Channel>>(new Map());
  const [pusherClient, setPusherClient] = useState<any>(null);

  // Initialize Pusher Client (only on client side)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamic import to avoid SSR issues
    import('@/lib/pusher').then(({ getPusherClient, PUSHER_EVENTS, getPusherChannels }) => {
      try {
        const client = getPusherClient();
        setPusherClient({ client, PUSHER_EVENTS, getPusherChannels });

        client.connection.bind('connected', () => {
          console.log('✅ Pusher connected');
          setIsConnected(true);
        });

        client.connection.bind('disconnected', () => {
          console.log('❌ Pusher disconnected');
          setIsConnected(false);
        });

        client.connection.bind('error', (error: any) => {
          console.error('❌ Pusher error:', error);
        });
      } catch (error) {
        console.error('Failed to initialize Pusher:', error);
      }
    });

    return () => {
      if (pusherClient?.client) {
        pusherClient.client.connection.unbind_all();
      }
    };
  }, []);

  // Subscribe to user's personal channel
  useEffect(() => {
    if (!session?.user?.id || !pusherClient) return;

    const { client, PUSHER_EVENTS, getPusherChannels } = pusherClient;
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

    const channel = client.subscribe(channelName);

    channel.bind(PUSHER_EVENTS.ORDER_STATUS_CHANGED, (data: OrderUpdate) => {
      console.log('📦 Order status changed:', data);
      setOrderUpdates(prev => [data, ...prev].slice(0, 20));
    });

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

    channel.bind(PUSHER_EVENTS.DRIVER_ASSIGNED, (data: any) => {
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

    channel.bind(PUSHER_EVENTS.NOTIFICATION_NEW, (data: any) => {
      console.log('🔔 New notification:', data);
      setNotifications(prev => [data.notification, ...prev]);
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(channelName);
    };
  }, [session, pusherClient]);

  const subscribeToOrder = useCallback((orderNumber: string) => {
    if (!pusherClient) return;

    const { client, PUSHER_EVENTS, getPusherChannels } = pusherClient;
    const channelName = getPusherChannels.orderTracking(orderNumber);
    
    if (subscribedChannels.has(channelName)) {
      console.log('Already subscribed to', channelName);
      return;
    }

    const channel = client.subscribe(channelName);

    channel.bind(PUSHER_EVENTS.ORDER_STATUS_CHANGED, (data: OrderUpdate) => {
      console.log('📦 Order status update:', data);
      setOrderUpdates(prev => [data, ...prev].slice(0, 20));
    });

    channel.bind(PUSHER_EVENTS.DRIVER_LOCATION_UPDATED, (data: any) => {
      console.log('📍 Driver location updated:', data);
      setDriverLocation(data.location);
    });

    channel.bind(PUSHER_EVENTS.DRIVER_ASSIGNED, (data: any) => {
      console.log('🚗 Driver assigned to order:', data);
    });

    subscribedChannels.set(channelName, channel);
    console.log('✅ Subscribed to order tracking:', orderNumber);
  }, [pusherClient, subscribedChannels]);

  const unsubscribeFromOrder = useCallback((orderNumber: string) => {
    if (!pusherClient) return;

    const { client, getPusherChannels } = pusherClient;
    const channelName = getPusherChannels.orderTracking(orderNumber);
    const channel = subscribedChannels.get(channelName);

    if (channel) {
      channel.unbind_all();
      client.unsubscribe(channelName);
      subscribedChannels.delete(channelName);
      console.log('❌ Unsubscribed from order tracking:', orderNumber);
    }
  }, [pusherClient, subscribedChannels]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

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