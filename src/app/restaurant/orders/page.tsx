'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import OrderList from '@/components/restaurant/OrderList';
import { Clock, CheckCircle2, Package, XCircle } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

export default function RestaurantOrdersPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'new' | 'active' | 'completed'>('new');

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
      status: 'pending',
      deliveryAddress: {
        street: '123 Main St',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date(Date.now() - 5 * 60000),
      updatedAt: new Date(),
    },
    {
      _id: '2',
      orderNumber: 'ORD456DEF',
      customerId: 'cust2',
      restaurantId: 'rest1',
      items: [
        { menuItemId: '3', name: 'Caesar Salad', price: 9.99, quantity: 2, notes: 'No croutons please' },
      ],
      subtotal: 19.98,
      deliveryFee: 3.99,
      tax: 1.60,
      discount: 0,
      total: 25.57,
      status: 'confirmed',
      deliveryAddress: {
        street: '456 Oak Ave',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date(Date.now() - 12 * 60000),
      updatedAt: new Date(),
    },
    {
      _id: '3',
      orderNumber: 'ORD789GHI',
      customerId: 'cust3',
      restaurantId: 'rest1',
      items: [
        { menuItemId: '1', name: 'Margherita Pizza', price: 12.99, quantity: 1 },
        { menuItemId: '4', name: 'Pepperoni Pizza', price: 14.99, quantity: 1 },
      ],
      subtotal: 27.98,
      deliveryFee: 3.99,
      tax: 2.24,
      discount: 5.0,
      total: 29.21,
      status: 'preparing',
      deliveryAddress: {
        street: '789 Elm St',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date(Date.now() - 18 * 60000),
      updatedAt: new Date(),
    },
    {
      _id: '4',
      orderNumber: 'ORD321JKL',
      customerId: 'cust4',
      restaurantId: 'rest1',
      items: [
        { menuItemId: '2', name: 'Garlic Bread', price: 4.99, quantity: 3 },
      ],
      subtotal: 14.97,
      deliveryFee: 3.99,
      tax: 1.20,
      discount: 0,
      total: 20.16,
      status: 'ready',
      deliveryAddress: {
        street: '321 Pine St',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date(Date.now() - 25 * 60000),
      updatedAt: new Date(),
    },
  ]);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map((order) => (order._id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order)));
  };

  const newOrders = orders.filter((o) => o.status === 'pending');
  const activeOrders = orders.filter((o) => ['confirmed', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter((o) => ['picked_up', 'on_the_way', 'delivered', 'cancelled'].includes(o.status));

  const tabs = [
    { id: 'new' as const, label: t('restaurant.newOrders'), count: newOrders.length, icon: Clock, color: 'yellow' },
    { id: 'active' as const, label: t('restaurant.activeOrders'), count: activeOrders.length, icon: Package, color: 'blue' },
    {
      id: 'completed' as const,
      label: t('restaurant.completedOrders'),
      count: completedOrders.length,
      icon: CheckCircle2,
      color: 'green',
    },
  ];

  const displayOrders = activeTab === 'new' ? newOrders : activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('restaurant.orders')}</h1>
          <p className="text-gray-600">Manage and track your restaurant orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{newOrders.length}</span>
            </div>
            <div className="text-yellow-100">New Orders</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{activeOrders.length}</span>
            </div>
            <div className="text-blue-100">Active Orders</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{completedOrders.length}</span>
            </div>
            <div className="text-green-100">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{orders.length}</span>
            </div>
            <div className="text-primary-100">Total Today</div>
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
        <OrderList orders={displayOrders} onUpdateStatus={handleUpdateStatus} />
      </div>
    </div>
  );
}