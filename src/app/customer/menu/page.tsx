'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import MenuCard from '@/components/customer/MenuCard';
import Input from '@/components/shared/Input';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import type { MenuItem } from '@/types';

export default function MenuPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - replace with API call
  const menuItems: MenuItem[] = [
    {
      _id: '1',
      restaurantId: 'rest1',
      name: 'Margherita Pizza',
      description: 'Classic tomato sauce, mozzarella, and fresh basil',
      price: 12.99,
      image: '🍕',
      category: 'Pizza',
      isAvailable: true,
      preparationTime: 20,
      tags: ['vegetarian', 'popular'],
      createdAt: new Date(),
    },
    {
      _id: '2',
      restaurantId: 'rest1',
      name: 'Double Cheeseburger',
      description: 'Two beef patties, cheese, lettuce, tomato, special sauce',
      price: 14.99,
      image: '🍔',
      category: 'Burgers',
      isAvailable: true,
      preparationTime: 15,
      tags: ['popular', 'best-seller'],
      createdAt: new Date(),
    },
    {
      _id: '3',
      restaurantId: 'rest2',
      name: 'Salmon Sushi Roll',
      description: 'Fresh salmon, avocado, cucumber, rice',
      price: 16.99,
      image: '🍣',
      category: 'Sushi',
      isAvailable: true,
      preparationTime: 25,
      tags: ['healthy', 'gluten-free'],
      createdAt: new Date(),
    },
    {
      _id: '4',
      restaurantId: 'rest2',
      name: 'Carbonara Pasta',
      description: 'Creamy pasta with bacon, parmesan, and egg',
      price: 13.99,
      image: '🍝',
      category: 'Pasta',
      isAvailable: true,
      preparationTime: 18,
      tags: ['popular'],
      createdAt: new Date(),
    },
    {
      _id: '5',
      restaurantId: 'rest3',
      name: 'Caesar Salad',
      description: 'Romaine lettuce, croutons, parmesan, Caesar dressing',
      price: 9.99,
      image: '🥗',
      category: 'Salads',
      isAvailable: true,
      preparationTime: 10,
      tags: ['healthy', 'vegetarian'],
      createdAt: new Date(),
    },
    {
      _id: '6',
      restaurantId: 'rest3',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center, vanilla ice cream',
      price: 7.99,
      image: '🍰',
      category: 'Desserts',
      isAvailable: false,
      preparationTime: 15,
      tags: ['sweet'],
      createdAt: new Date(),
    },
    {
      _id: '7',
      restaurantId: 'rest1',
      name: 'Chicken Tacos',
      description: 'Grilled chicken, salsa, guacamole, soft tortillas',
      price: 11.99,
      image: '🌮',
      category: 'Mexican',
      isAvailable: true,
      preparationTime: 12,
      tags: ['spicy'],
      createdAt: new Date(),
    },
    {
      _id: '8',
      restaurantId: 'rest2',
      name: 'Beef Ramen',
      description: 'Rich broth, tender beef, noodles, egg, vegetables',
      price: 15.99,
      image: '🍜',
      category: 'Asian',
      isAvailable: true,
      preparationTime: 20,
      tags: ['popular', 'comfort-food'],
      createdAt: new Date(),
    },
  ];

  const categories = [
    { id: 'all', name: 'All Items', emoji: '🍽️' },
    { id: 'Pizza', name: 'Pizza', emoji: '🍕' },
    { id: 'Burgers', name: 'Burgers', emoji: '🍔' },
    { id: 'Sushi', name: 'Sushi', emoji: '🍣' },
    { id: 'Pasta', name: 'Pasta', emoji: '🍝' },
    { id: 'Salads', name: 'Salads', emoji: '🥗' },
    { id: 'Desserts', name: 'Desserts', emoji: '🍰' },
    { id: 'Mexican', name: 'Mexican', emoji: '🌮' },
    { id: 'Asian', name: 'Asian', emoji: '🍜' },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('nav.menu')}</h1>
          <p className="text-gray-600">
            Discover delicious meals from top restaurants
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-semibold">Filters</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{category.emoji}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing{' '}
            <span className="font-semibold text-gray-900">
              {filteredItems.length}
            </span>{' '}
            {filteredItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}