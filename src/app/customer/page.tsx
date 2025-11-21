'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import {
  ShoppingBag,
  Clock,
  Star,
  TrendingUp,
  Package,
  Heart,
  Gift,
} from 'lucide-react';

export default function CustomerDashboard() {
  const { t } = useLanguage();

  const stats = [
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: '24',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Clock,
      label: 'Active Orders',
      value: '2',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Star,
      label: 'Rewards Points',
      value: '1,250',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
  ];

  const recentOrders = [
    {
      id: '1',
      restaurant: 'Pizza Palace',
      items: 'Margherita Pizza, Garlic Bread',
      total: 24.99,
      status: 'delivered',
      date: '2024-01-15',
    },
    {
      id: '2',
      restaurant: 'Burger House',
      items: 'Double Cheeseburger, Fries',
      total: 18.5,
      status: 'on_the_way',
      date: '2024-01-16',
    },
  ];

  const favoriteRestaurants = [
    { name: 'Pizza Palace', rating: 4.8, cuisine: 'Italian', emoji: '🍕' },
    { name: 'Sushi Master', rating: 4.9, cuisine: 'Japanese', emoji: '🍣' },
    { name: 'Burger House', rating: 4.7, cuisine: 'American', emoji: '🍔' },
    { name: 'Pasta Corner', rating: 4.6, cuisine: 'Italian', emoji: '🍝' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('common.welcome')}, John! 👋
          </h1>
          <p className="text-gray-600">
            Ready to order something delicious?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-600 text-sm mb-1">
                      {stat.label}
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </div>
                  <div className={`${stat.bg} p-4 rounded-xl`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/customer/menu">
                <button className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-lg transition-colors w-full">
                  <div className="bg-primary-100 p-3 rounded-xl">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="text-sm font-semibold">Browse Menu</span>
                </button>
              </Link>

              <Link href="/customer/orders">
                <button className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-lg transition-colors w-full">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold">My Orders</span>
                </button>
              </Link>

              <button className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-pink-100 p-3 rounded-xl">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <span className="text-sm font-semibold">Favorites</span>
              </button>

              <button className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Gift className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-sm font-semibold">Promotions</span>
              </button>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <Link
                  href="/customer/orders"
                  className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{order.restaurant}</h3>
                        <p className="text-sm text-gray-600">{order.items}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-600">
                          ${order.total}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{order.date}</span>
                      <span
                        className={`px-2 py-1 rounded-full font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.status === 'delivered' ? 'Delivered' : 'On the way'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Favorite Restaurants */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Favorite Restaurants</h2>
              <div className="space-y-3">
                {favoriteRestaurants.map((restaurant, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="text-4xl">{restaurant.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600">
                        {restaurant.cuisine}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                      />
                      <span className="font-semibold text-sm">
                        {restaurant.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Promotional Banner */}
        <Card className="mt-8 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="p-8 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Special Offer: 30% Off!
            </h2>
            <p className="mb-4 text-gray-100">
              Use code <span className="font-bold">SAVE30</span> on your next
              order
            </p>
            <Link href="/customer/menu">
              <Button variant="secondary" size="lg">
                Order Now
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}