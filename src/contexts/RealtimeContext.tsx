// ============================================
// 🔧 FILE 3: src/contexts/RealtimeContext.tsx
// ============================================
// FIXED: Better connection handling and state management

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';

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
  const [pusherClient, setPusherClient] = useState<Pusher | null>(null);
  const [subscribedChannels] = useState<Map<string, any>>(new Map());

  // Initialize Pusher (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;

    if (!PUSHER_KEY || !PUSHER_CLUSTER) {
      console.warn('⚠️ Pusher credentials missing - Real-time disabled');
      setIsConnected(false);
      return;
    }

    try {
      console.log('🔌 Initializing Pusher...');
      const client = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        enabledTransports: ['ws', 'wss'],
        forceTLS: true,
      });

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
        setIsConnected(false);
      });

      setPusherClient(client);

      return () => {
        console.log('🔌 Disconnecting Pusher...');
        client.connection.unbind_all();
        client.disconnect();
        setPusherClient(null);
      };
    } catch (error) {
      console.error('Failed to initialize Pusher:', error);
      setIsConnected(false);
    }
  }, []);

  // Subscribe to user's channel
  useEffect(() => {
    if (!session?.user?.id || !pusherClient) return;

    const userId = session.user.id;
    const role = session.user.role as string;

    let channelName = '';
    
    if (role === 'customer') {
      channelName = `private-customer-${userId}`;
    } else if (role === 'restaurant') {
      channelName = `private-restaurant-${userId}`;
    } else if (role === 'driver') {
      channelName = `private-driver-${userId}`;
    }

    if (!channelName) return;

    console.log(`📡 Subscribing to ${channelName}`);
    const channel = pusherClient.subscribe(channelName);

    channel.bind('order:status-changed', (data: OrderUpdate) => {
      console.log('📦 Order status changed:', data);
      setOrderUpdates(prev => [data, ...prev].slice(0, 20));
    });

    channel.bind('order:updated', (data: OrderUpdate) => {
      console.log('📦 Order updated:', data);
      setOrderUpdates(prev => [data, ...prev].slice(0, 20));
    });

    channel.bind('restaurant:new-order', (data: any) => {
      console.log('🆕 New order received:', data);
      setNotifications(prev => [{
        id: Math.random().toString(),
        title: 'New Order!',
        message: `Order #${data.order.orderNumber} received`,
        type: 'new_order',
        data: data.order,
        timestamp: new Date().toISOString(),
      }, ...prev]);
    });

    channel.bind('notification:new', (data: any) => {
      console.log('🔔 New notification:', data);
      setNotifications(prev => [data.notification, ...prev]);
    });

    return () => {
      console.log(`📡 Unsubscribing from ${channelName}`);
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [session, pusherClient]);

  const subscribeToOrder = useCallback((orderNumber: string) => {
    if (!pusherClient) return;

    const channelName = `presence-order-${orderNumber}`;
    
    if (subscribedChannels.has(channelName)) {
      return;
    }

    console.log(`📡 Subscribing to order ${orderNumber}`);
    const channel = pusherClient.subscribe(channelName);

    channel.bind('order:status-changed', (data: OrderUpdate) => {
      console.log(`📦 Order ${orderNumber} status:`, data);
      setOrderUpdates(prev => [data, ...prev].slice(0, 20));
    });

    channel.bind('driver:location-updated', (data: any) => {
      console.log(`🚗 Driver location for ${orderNumber}:`, data);
      setDriverLocation(data.location);
    });

    subscribedChannels.set(channelName, channel);
  }, [pusherClient, subscribedChannels]);

  const unsubscribeFromOrder = useCallback((orderNumber: string) => {
    if (!pusherClient) return;

    const channelName = `presence-order-${orderNumber}`;
    const channel = subscribedChannels.get(channelName);

    if (channel) {
      console.log(`📡 Unsubscribing from order ${orderNumber}`);
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
      subscribedChannels.delete(channelName);
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