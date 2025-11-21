'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import OrderAcceptCard from '@/components/driver/OrderAcceptCard';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Package, CheckCircle2, Clock, MapPin } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

export default function DriverOrdersPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');

  // Mock data
  const [orders, setOrders] = useState<Order[]>([
    {
      _id: '1',
      orderNumber: 'ORD123ABC',
      customerId: 'cust1',
      restaurantId: 'rest1',
      items: [
        { menuItemId: '1', name: 'Margherita Pizza', price: 12.99, quantity: 2 },
        { menuItemId: '2', name: 'Garlic Bread', price: 4.99, quantity: 1 },
      ],
      subtotal: 30.97,
      deliveryFee: 3.99,
      tax: 2.48,
      discount: 0,
      total: 37.44,
      status: 'ready',
      deliveryAddress: {
        street: '123 Main St',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '2',
      orderNumber: 'ORD456DEF',
      customerId: 'cust2',
      restaurantId: 'rest2',
      driverId: 'driver1',
      items: [
        { menuItemId: '3', name: 'Salmon Sushi Roll', price: 16.99, quantity: 1 },
      ],
      subtotal: 16.99,
      deliveryFee: 3.99,
      tax: 1.36,
      discount: 0,
      total: 22.34,
      status: 'picked_up',
      deliveryAddress: {
        street: '456 Oak Ave',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const handleAcceptOrder = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order._id === orderId ? { ...order, driverId: 'driver1', status: 'picked_up' as OrderStatus } : order
      )
    );
    setActiveTab('active');
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order._id !== orderId));
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)));
  };

  const availableOrders = orders.filter((o) => o.status === 'ready' && !o.driverId);
  const activeOrders = orders.filter((o) => o.driverId === 'driver1' && ['picked_up', 'on_the_way'].includes(o.status));
  const completedOrders = orders.filter((o) => o.driverId === 'driver1' && o.status === 'delivered');

  const tabs = [
    { id: 'available' as const, label: t('driver.availableOrders'), count: availableOrders.length, icon: Clock },
    { id: 'active' as const, label: 'My Deliveries', count: activeOrders.length, icon: Package },
    { id: 'completed' as const, label: 'Completed', count: completedOrders.length, icon: CheckCircle2 },
  ];

  const displayOrders =
    activeTab === 'available' ? availableOrders : activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Delivery Orders</h1>
          <p className="text-gray-600">Accept orders and manage your deliveries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{availableOrders.length}</span>
            </div>
            <div className="text-yellow-100">Available Orders</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{activeOrders.length}</span>
            </div>
            <div className="text-blue-100">Active Deliveries</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">4</span>
            </div>
            <div className="text-green-100">Completed Today</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-sm ${
                  activeTab === tab.id ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {displayOrders.length > 0 ? (
          <div className="space-y-6">
            {activeTab === 'available' &&
              displayOrders.map((order) => (
                <OrderAcceptCard key={order._id} order={order} onAccept={handleAcceptOrder} onReject={handleRejectOrder} />
              ))}

            {activeTab === 'active' &&
              displayOrders.map((order) => (
                <Card key={order._id}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">#{order.orderNumber}</h3>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {order.status === 'picked_up' ? 'Picked Up' : 'On the Way'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">$8.50</div>
                        <div className="text-xs text-gray-600">Your Earnings</div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <div className="font-semibold mb-1">Delivery Address</div>
                          <div className="text-sm text-gray-600">
                            {order.deliveryAddress.street}, {order.deliveryAddress.city}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {order.status === 'picked_up' && (
                        <Button
                          variant="primary"
                          size="lg"
                          className="col-span-2"
                          onClick={() => handleUpdateStatus(order._id, 'on_the_way')}
                        >
                          Start Delivery
                        </Button>
                      )}
                      {order.status === 'on_the_way' && (
                        <>
                          <Button variant="outline" size="lg">
                            Call Customer
                          </Button>
                          <Button variant="success" size="lg" onClick={() => handleUpdateStatus(order._id, 'delivered')}>
                            Mark Delivered
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

            {activeTab === 'completed' && (
              <div className="text-center py-16">
                <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-bold mb-2">Great job today!</h3>
                <p className="text-gray-600">You've completed 4 deliveries</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-4">
              {activeTab === 'available' ? '📦' : activeTab === 'active' ? '🚗' : '✅'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {activeTab === 'available'
                ? 'No available orders'
                : activeTab === 'active'
                ? 'No active deliveries'
                : 'No completed deliveries'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'available'
                ? 'New orders will appear here when available'
                : activeTab === 'active'
                ? 'Accept an order to start delivering'
                : 'Your completed deliveries will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}