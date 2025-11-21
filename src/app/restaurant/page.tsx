'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import StatsCard from '@/components/analytics/StatsCard';
import RevenueChart from '@/components/analytics/RevenueChart';
import OrdersChart from '@/components/analytics/OrdersChart';
import { DollarSign, ShoppingBag, Clock, TrendingUp, Package, Star, Users } from 'lucide-react';

export default function RestaurantDashboard() {
  const { t } = useLanguage();

  // Mock data
  const revenueData = [
    { date: 'Mon', revenue: 850 },
    { date: 'Tue', revenue: 920 },
    { date: 'Wed', revenue: 1100 },
    { date: 'Thu', revenue: 980 },
    { date: 'Fri', revenue: 1350 },
    { date: 'Sat', revenue: 1580 },
    { date: 'Sun', revenue: 1420 },
  ];

  const ordersData = [
    { date: 'Mon', orders: 45 },
    { date: 'Tue', orders: 52 },
    { date: 'Wed', orders: 61 },
    { date: 'Thu', orders: 48 },
    { date: 'Fri', orders: 73 },
    { date: 'Sat', orders: 85 },
    { date: 'Sun', orders: 78 },
  ];

  const topItems = [
    { name: 'Margherita Pizza', orders: 142, revenue: 1845.58, trend: 12 },
    { name: 'Cheeseburger', orders: 98, revenue: 1470.02, trend: 8 },
    { name: 'Caesar Salad', orders: 76, revenue: 759.24, trend: -3 },
    { name: 'Pasta Carbonara', orders: 64, revenue: 894.36, trend: 15 },
  ];

  const recentOrders = [
    { id: 'ORD123', customer: 'John Doe', items: 3, total: 34.99, status: 'preparing', time: '2 min ago' },
    { id: 'ORD124', customer: 'Jane Smith', items: 2, total: 24.50, status: 'ready', time: '5 min ago' },
    { id: 'ORD125', customer: 'Bob Wilson', items: 4, total: 45.99, status: 'confirmed', time: '8 min ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Restaurant Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your restaurant overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Today's Revenue" value="$1,420" change={12.5} icon={DollarSign} color="primary" />
          <StatsCard title="Orders Today" value="78" change={8.3} icon={ShoppingBag} color="green" />
          <StatsCard title="Active Orders" value="12" icon={Clock} color="blue" />
          <StatsCard title="Avg Rating" value="4.8" change={2.1} icon={Star} color="yellow" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>
              <RevenueChart data={revenueData} />
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Orders Overview</h2>
              <OrdersChart data={ordersData} />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Top Selling Items</h2>
                <Link href="/restaurant/menu" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                  View Menu
                </Link>
              </div>

              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center font-bold text-primary-600">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${item.revenue.toFixed(2)}</div>
                      <div className={`text-sm font-semibold ${item.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend >= 0 ? '↑' : '↓'} {Math.abs(item.trend)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Orders */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <Link href="/restaurant/orders" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">#{order.id}</h3>
                        <p className="text-sm text-gray-600">{order.customer} • {order.items} items</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${order.total}</div>
                        <div className="text-xs text-gray-500">{order.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          order.status === 'preparing'
                            ? 'bg-purple-100 text-purple-700'
                            : order.status === 'ready'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.status}
                      </span>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/restaurant/menu">
                <button className="flex flex-col items-center gap-3 p-6 hover:bg-gray-50 rounded-lg transition-colors w-full border-2 border-gray-200 hover:border-primary-300">
                  <div className="bg-primary-100 p-4 rounded-xl">
                    <Package className="w-8 h-8 text-primary-600" />
                  </div>
                  <span className="font-semibold text-center">Manage Menu</span>
                </button>
              </Link>

              <Link href="/restaurant/orders">
                <button className="flex flex-col items-center gap-3 p-6 hover:bg-gray-50 rounded-lg transition-colors w-full border-2 border-gray-200 hover:border-primary-300">
                  <div className="bg-blue-100 p-4 rounded-xl">
                    <ShoppingBag className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="font-semibold text-center">View Orders</span>
                </button>
              </Link>

              <Link href="/restaurant/promotions">
                <button className="flex flex-col items-center gap-3 p-6 hover:bg-gray-50 rounded-lg transition-colors w-full border-2 border-gray-200 hover:border-primary-300">
                  <div className="bg-yellow-100 p-4 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                  </div>
                  <span className="font-semibold text-center">Promotions</span>
                </button>
              </Link>

              <Link href="/restaurant/analytics">
                <button className="flex flex-col items-center gap-3 p-6 hover:bg-gray-50 rounded-lg transition-colors w-full border-2 border-gray-200 hover:border-primary-300">
                  <div className="bg-purple-100 p-4 rounded-xl">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="font-semibold text-center">Analytics</span>
                </button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}