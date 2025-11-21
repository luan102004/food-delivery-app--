// src/app/customer/track/[orderNumber]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useRealtime } from '@/contexts/RealtimeContext';
import Card from '@/components/shared/Card';
import LiveTrackingMap from '@/components/maps/LiveTrackingMap';
import {
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  User,
  Store,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

export default function TrackOrderPage() {
  const params = useParams();
  const { t } = useLanguage();
  const orderNumber = params.orderNumber as string;
  
  const { orderUpdates, subscribeToOrder, unsubscribeFromOrder } = useRealtime();

  const [orderData, setOrderData] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('pending');
  const [loading, setLoading] = useState(true);

  // Fetch initial order data
  useEffect(() => {
    async function fetchOrderData() {
      try {
        const response = await fetch(`/api/orders/track/${orderNumber}`);
        const result = await response.json();

        if (result.success) {
          setOrderData(result.data);
          setCurrentStatus(result.data.order.status);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderData();
  }, [orderNumber]);

  // Subscribe to realtime updates
  useEffect(() => {
    subscribeToOrder(orderNumber);
    return () => unsubscribeFromOrder(orderNumber);
  }, [orderNumber, subscribeToOrder, unsubscribeFromOrder]);

  // Update status from realtime updates
  useEffect(() => {
    const latestUpdate = orderUpdates.find(u => u.orderNumber === orderNumber);
    if (latestUpdate) {
      setCurrentStatus(latestUpdate.status as OrderStatus);
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Order Update', {
          body: `Your order is now ${latestUpdate.status}`,
          icon: '/icon.png',
        });
      }
    }
  }, [orderUpdates, orderNumber]);

  const orderStatuses: { status: OrderStatus; label: string; time?: string }[] = [
    { status: 'pending', label: t('order.pending'), time: orderData?.order?.createdAt },
    { status: 'confirmed', label: t('order.confirmed') },
    { status: 'preparing', label: t('order.preparing') },
    { status: 'ready', label: t('order.ready') },
    { status: 'picked_up', label: t('order.picked_up') },
    { status: 'on_the_way', label: t('order.on_the_way') },
    { status: 'delivered', label: t('order.delivered') },
  ];

  const currentIndex = orderStatuses.findIndex((s) => s.status === currentStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600">Order #{orderNumber} could not be found</p>
        </div>
      </div>
    );
  }

  const { order, restaurant, driverLocation } = orderData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('customer.trackOrder')} #{orderNumber}
          </h1>
          <p className="text-gray-600">
            Estimated delivery: {order.estimatedDeliveryTime || '20-30 minutes'}
          </p>
          
          {/* Realtime Status Badge */}
          <div className="mt-3 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-green-600">Live Tracking Active</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Map */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary-600" />
                  Live Tracking
                </h2>
                <LiveTrackingMap
                  orderNumber={orderNumber}
                  restaurantLocation={{
                    lat: restaurant.address.coordinates.lat,
                    lng: restaurant.address.coordinates.lng,
                    name: restaurant.name,
                    address: restaurant.address.street,
                  }}
                  deliveryLocation={{
                    lat: order.deliveryAddress.coordinates?.lat || 10.7809,
                    lng: order.deliveryAddress.coordinates?.lng || 106.7049,
                    address: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`,
                  }}
                  initialDriverLocation={driverLocation?.coordinates}
                  onArrival={() => {
                    console.log('Driver arrived!');
                  }}
                />
              </div>
            </Card>

            {/* Order Timeline */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Order Status</h2>
                <div className="space-y-4">
                  {orderStatuses.map((status, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div key={status.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              isCompleted
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-primary-200 animate-pulse' : ''}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          {index < orderStatuses.length - 1 && (
                            <div
                              className={`w-0.5 h-12 ${
                                isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 pb-8">
                          <div
                            className={`font-semibold mb-1 ${
                              isCurrent ? 'text-primary-600' : ''
                            }`}
                          >
                            {status.label}
                          </div>
                          {status.time && (
                            <div className="text-sm text-gray-500">
                              {new Date(status.time).toLocaleTimeString()}
                            </div>
                          )}
                          {isCurrent && (
                            <div className="text-sm text-primary-600 font-medium mt-1 flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                              In Progress...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Driver Info */}
            {order.driverId && (
              <Card>
                <div className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Your Driver
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      D
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        Driver Name
                      </div>
                      <div className="text-sm text-gray-600">
                        Vehicle Info
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">4.9</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* Restaurant Info */}
            <Card>
              <div className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Restaurant
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold">{restaurant.name}</div>
                    <div className="text-sm text-gray-600">
                      {restaurant.address.street}
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm">
                    <Phone className="w-4 h-4" />
                    {restaurant.phone}
                  </button>
                </div>
              </div>
            </Card>

            {/* Order Summary */}
            <Card>
              <div className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </h3>
                <div className="space-y-3 mb-4">
                  {order.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="font-medium">{item.quantity}x</span>{' '}
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('order.total')}</span>
                    <span className="text-primary-600">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Help */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="p-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-bold mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contact our support team for assistance
                </p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Contact Support
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}