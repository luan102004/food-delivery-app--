'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import StatsCard from '@/components/analytics/StatsCard';
import RevenueChart from '@/components/analytics/RevenueChart';
import OrdersChart from '@/components/analytics/OrdersChart';
import { DollarSign, ShoppingBag, Users, TrendingUp, Store, Truck } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  const revenueData = [
    { date: 'Mon', revenue: 2850 },
    { date: 'Tue', revenue: 3120 },
    { date: 'Wed', revenue: 3890 },
    { date: 'Thu', revenue: 3240 },
    { date: 'Fri', revenue: 4850 },
    { date: 'Sat', revenue: 5680 },
    { date: 'Sun', revenue: 4920 },
  ];

  const ordersData = [
    { date: 'Mon', orders: 145 },
    { date: 'Tue', orders: 168 },
    { date: 'Wed', orders: 192 },
    { date: 'Thu', orders: 156 },
    { date: 'Fri', orders: 234 },
    { date: 'Sat', orders: 289 },
    { date: 'Sun', orders: 245 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Analytics</h1>
            <p className="text-gray-600">Overview of platform performance</p>
          </div>

          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                  timeRange === range ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Revenue" value="$124,230" change={18.5} icon={DollarSign} color="primary" />
          <StatsCard title="Total Orders" value="1,429" change={12.3} icon={ShoppingBag} color="green" />
          <StatsCard title="Active Users" value="2,348" change={8.7} icon={Users} color="blue" />
          <StatsCard title="Growth Rate" value="23.5%" change={15.2} icon={TrendingUp} color="purple" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Platform Revenue</h2>
              <RevenueChart data={revenueData} />
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Total Orders</h2>
              <OrdersChart data={ordersData} />
            </div>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-green-600" />
                Top Restaurants
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Pizza Palace', orders: 342, revenue: 14445 },
                  { name: 'Burger House', orders: 298, revenue: 12230 },
                  { name: 'Sushi Master', orders: 256, revenue: 11680 },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-sm text-gray-600">{r.orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">${r.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Top Drivers
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'John Doe', deliveries: 145, rating: 4.9 },
                  { name: 'Jane Smith', deliveries: 132, rating: 4.8 },
                  { name: 'Mike Johnson', deliveries: 118, rating: 4.7 },
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-sm text-gray-600">{d.deliveries} deliveries</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">⭐ {d.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                User Activity
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">New Users</span>
                    <span className="text-2xl font-bold text-purple-600">245</span>
                  </div>
                  <div className="text-xs text-gray-600">This week</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Active Users</span>
                    <span className="text-2xl font-bold text-green-600">1,892</span>
                  </div>
                  <div className="text-xs text-gray-600">Last 7 days</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Retention</span>
                    <span className="text-2xl font-bold text-blue-600">78%</span>
                  </div>
                  <div className="text-xs text-gray-600">Monthly rate</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}