'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/hooks/useLanguage';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import { 
  Pizza, 
  Clock, 
  Star, 
  MapPin, 
  Smartphone,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Auto redirect if user is logged in
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user) {
      const roleRedirects: Record<string, string> = {
        customer: '/customer',
        restaurant: '/restaurant',
        driver: '/driver',
        admin: '/admin/users',
      };
      
      const redirectUrl = roleRedirects[session.user.role as string] || '/customer';
      router.push(redirectUrl);
    }
  }, [session, status, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Get your food delivered in 30 minutes or less',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Star,
      title: 'Top Rated',
      description: 'Order from the highest rated restaurants',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      icon: MapPin,
      title: 'Track Order',
      description: 'Real-time tracking of your delivery',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: 'Safe and secure payment options',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  const popularCategories = [
    { name: 'Pizza', emoji: '🍕', count: 245 },
    { name: 'Burger', emoji: '🍔', count: 189 },
    { name: 'Sushi', emoji: '🍣', count: 156 },
    { name: 'Pasta', emoji: '🍝', count: 198 },
    { name: 'Salad', emoji: '🥗', count: 134 },
    { name: 'Dessert', emoji: '🍰', count: 167 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Delicious Food
                <br />
                <span className="text-yellow-300">Delivered Fast</span>
              </h1>
              <p className="text-xl text-gray-100">
                Order from the best local restaurants with easy, on-demand delivery
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/customer/menu">
                  <Button size="lg" variant="secondary">
                    <Pizza className="w-5 h-5" />
                    {t('customer.orderNow')}
                  </Button>
                </Link>
                <Link href="/restaurant">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-700">
                    For Restaurants
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 pt-6">
                <div>
                  <div className="text-3xl font-bold">2.5K+</div>
                  <div className="text-gray-200">Restaurants</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-gray-200">Delivered Orders</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">4.8</div>
                  <div className="text-gray-200">Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-6xl mb-4 text-center">🍔</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    Premium Burger
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    Delicious beef burger with fresh ingredients
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary-600">$12.99</span>
                    <Button variant="primary">Order Now</Button>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-yellow-400 rounded-full p-4 shadow-lg animate-bounce-slow">
                <Star className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-green-400 rounded-full p-4 shadow-lg animate-pulse-slow">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-gray-600 text-lg">The best food delivery experience</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} hover className="p-6 text-center">
              <div className={`${feature.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Categories</h2>
            <p className="text-gray-600 text-lg">Explore our diverse menu options</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCategories.map((category, index) => (
              <Card key={index} hover className="p-6 text-center cursor-pointer">
                <div className="text-5xl mb-3">{category.emoji}</div>
                <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} items</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg">Three simple steps to get your food</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xl">
              1
            </div>
            <h3 className="text-xl font-bold mb-3">Choose Your Food</h3>
            <p className="text-gray-600">
              Browse through our menu and select your favorite dishes from top restaurants
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xl">
              2
            </div>
            <h3 className="text-xl font-bold mb-3">Place Your Order</h3>
            <p className="text-gray-600">
              Add items to cart, apply promo codes, and proceed to secure checkout
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xl">
              3
            </div>
            <h3 className="text-xl font-bold mb-3">Fast Delivery</h3>
            <p className="text-gray-600">
              Track your order in real-time and enjoy fresh food delivered to your door
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <Smartphone className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Join thousands of satisfied customers ordering delicious food every day
          </p>
          <Link href="/customer/menu">
            <Button size="lg" variant="secondary">
              Start Ordering Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}