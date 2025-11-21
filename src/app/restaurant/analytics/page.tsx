'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import StatsCard from '@/components/analytics/StatsCard';
import RevenueChart from '@/components/analytics/RevenueChart';
import OrdersChart from '@/components/analytics/OrdersChart';
import { DollarSign, ShoppingBag, TrendingUp, Users, Clock, Star } from 'lucide-react';

export default function RestaurantAnalyticsPage() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  const timeRanges = [
    { id: 'daily' as const, label: t('analytics.daily') },
    { id: 'weekly' as const, label: t('analytics.weekly') },
    { id: 'monthly' as const, label: t('analytics.monthly') },
    { id: 'yearly' as const, label: t('analytics.yearly') },
  ];

  // Mock data - adjust based on time range
  const revenueData =
    timeRange === 'daily'
      ? [
          { date: '6 AM', revenue: 120 },
          { date: '9 AM', revenue: 450 },
          { date: '12 PM', revenue: 890 },
          { date: '3 PM', revenue: 620 },
          { date: '6 PM', revenue: 1250 },
          { date: '9 PM', revenue: 980 },
        ]
      : [
          { date: 'Mon', revenue: 850 },
          { date: 'Tue', revenue: 920 },
          { date: 'Wed', revenue: 1100 },
          { date: 'Thu', revenue: 980 },
          { date: 'Fri', revenue: 1350 },
          { date: 'Sat', revenue: 1580 },
          { date: 'Sun', revenue: 1420 },
        ];

  const ordersData =
    timeRange === 'daily'
      ? [
          { date: '6 AM', orders: 8 },
          { date: '9 AM', orders: 25 },
          { date: '12 PM', orders: 48 },
          { date: '3 PM', orders: 32 },
          { date: '6 PM', orders: 65 },
          { date: '9 PM', orders: 42 },
        ]
      : [
          { date: 'Mon', orders: 45 },
          { date: 'Tue', orders: 52 },
          { date: 'Wed', orders: 61 },
          { date: 'Thu', orders: 48 },
          { date: 'Fri', orders: 73 },
          { date: 'Sat', orders: 85 },
          { date: 'Sun', orders: 78 },
        ];

  const topMenuItems = [
    { rank: 1, name: 'Margherita Pizza', orders: 342, revenue: 4445.58, percentage: 18.5 },
    { rank: 2, name: 'Pepperoni Pizza', orders: 298, revenue: 4467.02, percentage: 15.2 },
    { rank: 3, name: 'Caesar Salad', orders: 256, revenue: 2558.44, percentage: 13.1 },
    { rank: 4, name: 'Garlic Bread', orders: 234, revenue: 1167.66, percentage: 11.9 },
    { rank: 5, name: 'Pasta Carbonara', orders: 198, revenue: 2767.02, percentage: 10.1 },
  ];

  const customerInsights = [
    { metric: 'New Customers', value: 245, change: 12.3, icon: Users },
    { metric: 'Returning Customers', value: 1458, change: 8.7, icon: Users },
    { metric: 'Avg Order Value', value: '$32.45', change: 5.2, icon: DollarSign },
    { metric: 'Customer Rating', value: '4.8', change: 2.1, icon: Star },
  ];

  const peakHours = [
    { time: '12:00 PM - 1:00 PM', orders: 145, percentage: 22 },
    { time: '6:00 PM - 8:00 PM', orders: 238, percentage: 36 },
    { time: '8:00 PM - 9:00 PM', orders: 98, percentage: 15 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('analytics.overview')}</h1>
            <p className="text-gray-600">Track your restaurant performance</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                  timeRange === range.id ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title={t('analytics.revenue')} value="$8,200" change={15.3} icon={DollarSign} color="primary" />
          <StatsCard title={t('analytics.orders')} value="442" change={12.8} icon={ShoppingBag} color="green" />
          <StatsCard title="Avg Prep Time" value="18 min" change={-8.5} icon={Clock} color="blue" />
          <StatsCard title={t('analytics.growth')} value="23.5%" change={18.2} icon={TrendingUp} color="purple" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('analytics.revenue')} Trend</h2>
              <RevenueChart data={revenueData} />
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('analytics.orders')} Trend</h2>
              <OrdersChart data={ordersData} />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Top Menu Items */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">{t('analytics.topItems')}</h2>
              <div className="space-y-4">
                {topMenuItems.map((item) => (
                  <div key={item.rank} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                      #{item.rank}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{item.orders} orders</span>
                        <span>•</span>
                        <span className="font-semibold text-primary-600">${item.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{item.percentage}%</div>
                      <div className="text-xs text-gray-500">of total</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Customer Insights */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Customer Insights</h2>
              <div className="space-y-4">
                {customerInsights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <insight.icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">{insight.metric}</div>
                        <div className="text-2xl font-bold">{insight.value}</div>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        insight.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {insight.change >= 0 ? '↑' : '↓'} {Math.abs(insight.change)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Peak Hours */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Peak Hours Analysis</h2>
            <div className="space-y-4">
              {peakHours.map((hour, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <span className="font-semibold">{hour.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">{hour.orders} orders</span>
                      <span className="font-bold text-primary-600">{hour.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-700 h-3 rounded-full"
                      style={{ width: `${hour.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
