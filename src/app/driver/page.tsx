'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import StatusToggle from '@/components/driver/StatusToggle';
import { DollarSign, Package, TrendingUp, Star, Clock, MapPin, Navigation } from 'lucide-react';

export default function DriverDashboard() {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);

  const todayStats = [
    { label: 'Deliveries', value: '4', icon: Package, color: 'blue' },
    { label: 'Earnings', value: '$68.00', icon: DollarSign, color: 'green' },
    { label: 'Online Time', value: '5.2 hrs', icon: Clock, color: 'purple' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'yellow' },
  ];

  const recentDeliveries = [
    {
      id: 'ORD123',
      restaurant: 'Pizza Palace',
      customer: 'John D.',
      earnings: 12.5,
      distance: 3.2,
      time: '25 min',
      status: 'completed',
    },
    {
      id: 'ORD456',
      restaurant: 'Burger House',
      customer: 'Sarah M.',
      earnings: 15.0,
      distance: 4.8,
      time: '32 min',
      status: 'completed',
    },
    {
      id: 'ORD789',
      restaurant: 'Sushi Master',
      customer: 'Mike R.',
      earnings: 18.5,
      distance: 5.1,
      time: '38 min',
      status: 'completed',
    },
  ];

  const weeklyEarnings = [
    { day: 'Mon', amount: 85 },
    { day: 'Tue', amount: 92 },
    { day: 'Wed', amount: 78 },
    { day: 'Thu', amount: 95 },
    { day: 'Fri', amount: 110 },
    { day: 'Sat', amount: 135 },
    { day: 'Sun', amount: 68 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('driver.myDeliveries')}</h1>
          <p className="text-gray-600">Welcome back! Here's your delivery overview</p>
        </div>

        {/* Status Toggle */}
        <div className="mb-8">
          <StatusToggle isOnline={isOnline} onToggle={setIsOnline} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {todayStats.map((stat, index) => (
            <Card key={index}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weekly Earnings Chart */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Weekly Earnings</h2>
                <div className="flex items-end justify-between h-64 gap-4">
                  {weeklyEarnings.map((day, index) => {
                    const maxAmount = Math.max(...weeklyEarnings.map((d) => d.amount));
                    const heightPercent = (day.amount / maxAmount) * 100;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-sm font-bold text-gray-900">${day.amount}</div>
                        <div
                          className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all hover:from-primary-700 hover:to-primary-500"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <div className="text-sm font-semibold text-gray-600">{day.day}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Total This Week</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${weeklyEarnings.reduce((sum, d) => sum + d.amount, 0)}
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <div className="p-6">
                <MapPin className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Ready to Deliver?</h3>
                <p className="text-primary-100 mb-4">Check available orders in your area</p>
                <Link href="/driver/orders">
                  <button className="w-full py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    View Available Orders
                  </button>
                </Link>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
              <div className="p-6">
                <Navigation className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Live Map</h3>
                <p className="text-blue-100 mb-4">View your current deliveries on map</p>
                <Link href="/driver/map">
                  <button className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Open Map View
                  </button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Deliveries */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Deliveries</h2>
              <Link href="/driver/orders" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">#{delivery.id}</div>
                      <div className="text-sm text-gray-600">
                        {delivery.restaurant} → {delivery.customer}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {delivery.distance} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {delivery.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${delivery.earnings.toFixed(2)}</div>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mt-1">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold mb-1">4.9</div>
              <div className="text-gray-600">Customer Rating</div>
              <div className="text-sm text-green-600 font-semibold mt-2">+0.2 this week</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-3xl font-bold mb-1">156</div>
              <div className="text-gray-600">Total Deliveries</div>
              <div className="text-sm text-blue-600 font-semibold mt-2">All time</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold mb-1">98%</div>
              <div className="text-gray-600">On-Time Rate</div>
              <div className="text-sm text-purple-600 font-semibold mt-2">Excellent!</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}