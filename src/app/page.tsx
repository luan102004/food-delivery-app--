'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import StatsCard from '@/components/analytics/StatsCard';
import { Users, Store, Truck, DollarSign, TrendingUp, Package } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Users" value="1,234" change={12.5} icon={Users} color="blue" />
          <StatsCard title="Restaurants" value="156" change={8.3} icon={Store} color="green" />
          <StatsCard title="Drivers" value="89" change={15.2} icon={Truck} color="purple" />
          <StatsCard title="Revenue" value="$45,230" change={22.1} icon={DollarSign} color="primary" />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users">
            <Card hover className="p-6 cursor-pointer">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">User Management</h3>
              <p className="text-gray-600">Manage all system users</p>
            </Card>
          </Link>

          <Link href="/admin/restaurants">
            <Card hover className="p-6 cursor-pointer">
              <Store className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Restaurants</h3>
              <p className="text-gray-600">Manage restaurants and menus</p>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card hover className="p-6 cursor-pointer">
              <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Analytics</h3>
              <p className="text-gray-600">View system analytics</p>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Package className="w-8 h-8 text-primary-600" />
                  <div className="flex-1">
                    <div className="font-semibold">New order placed</div>
                    <div className="text-sm text-gray-600">Order #ORD{i}23ABC - $45.99</div>
                  </div>
                  <div className="text-sm text-gray-500">{i} min ago</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}