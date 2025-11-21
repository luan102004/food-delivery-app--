'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import OrderCard from '@/components/customer/OrderCard';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { Order } from '@/types';

export default function OrdersPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Mock data - replace with API call
  const mockOrders: Order[] = [
    {
      _id: '1',
      orderNumber: 'ORD123ABC',
      customerId: 'cust1',
      restaurantId: 'rest1',
      driverId: 'driver1',
      items: [
        { menuItemId: '1', name: 'Margherita Pizza', price: 12.99, quantity: 2 },
        { menuItemId: '2', name: 'Garlic Bread', price: 4.99, quantity: 1 },
      ],
      subtotal: 30.97,
      deliveryFee: 3.99,
      tax: 2.48,
      discount: 0,
      total: 37.44,
      status: 'on_the_way',
      deliveryAddress: {
        street: '123 Main St',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date('2024-01-16T14:30:00'),
      updatedAt: new Date('2024-01-16T14:45:00'),
    },
    {
      _id: '2',
      orderNumber: 'ORD456DEF',
      customerId: 'cust1',
      restaurantId: 'rest2',
      items: [
        { menuItemId: '3', name: 'Salmon Sushi Roll', price: 16.99, quantity: 1 },
        { menuItemId: '4', name: 'Miso Soup', price: 3.99, quantity: 1 },
      ],
      subtotal: 20.98,
      deliveryFee: 3.99,
      tax: 1.68,
      discount: 5.0,
      total: 21.65,
      status: 'preparing',
      deliveryAddress: {
        street: '123 Main St',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date('2024-01-16T13:00:00'),
      updatedAt: new Date('2024-01-16T13:15:00'),
    },
    {
      _id: '3',
      orderNumber: 'ORD789GHI',
      customerId: 'cust1',
      restaurantId: 'rest3',
      items: [
        { menuItemId: '5', name: 'Caesar Salad', price: 9.99, quantity: 1 },
      ],
      subtotal: 9.99,
      deliveryFee: 3.99,
      tax: 0.8,
      discount: 0,
      total: 14.78,
      status: 'delivered',
      deliveryAddress: {
        street: '123 Main St',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date('2024-01-15T18:00:00'),
      updatedAt: new Date('2024-01-15T18:45:00'),
    },
    {
      _id: '4',
      orderNumber: 'ORD321JKL',
      customerId: 'cust1',
      restaurantId: 'rest1',
      items: [
        { menuItemId: '2', name: 'Double Cheeseburger', price: 14.99, quantity: 2 },
        { menuItemId: '6', name: 'French Fries', price: 3.99, quantity: 2 },
      ],
      subtotal: 37.96,
      deliveryFee: 3.99,
      tax: 3.04,
      discount: 0,
      total: 44.99,
      status: 'delivered',
      deliveryAddress: {
        street: '123 Main St',
        city: 'HCMC',
        state: 'Vietnam',
        zipCode: '70000',
      },
      createdAt: new Date('2024-01-14T12:00:00'),
      updatedAt: new Date('2024-01-14T12:35:00'),
    },
  ];

  const activeOrders = mockOrders.filter((order) =>
    ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(
      order.status
    )
  );

  const completedOrders = mockOrders.filter((order) =>
    ['delivered', 'cancelled'].includes(order.status)
  );

  const tabs = [
    {
      id: 'active' as const,
      label: 'Active Orders',
      count: activeOrders.length,
      icon: Clock,
    },
    {
      id: 'completed' as const,
      label: 'Order History',
      count: completedOrders.length,
      icon: CheckCircle2,
    },
  ];

  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('nav.orders')}</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{activeOrders.length}</span>
            </div>
            <div className="text-blue-100">Active Orders</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {mockOrders.filter((o) => o.status === 'delivered').length}
              </span>
            </div>
            <div className="text-green-100">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{mockOrders.length}</span>
            </div>
            <div className="text-primary-100">Total Orders</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-sm ${
                  activeTab === tab.id
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {displayOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-4">
              {activeTab === 'active' ? '📦' : '✅'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {activeTab === 'active' ? 'No active orders' : 'No order history'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'active'
                ? 'You don\'t have any active orders right now'
                : 'You haven\'t completed any orders yet'}
            </p>
            {activeTab === 'active' && (
              <a href="/customer/menu">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Browse Menu
                </button>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}