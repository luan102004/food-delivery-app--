'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import MenuItemForm from '@/components/restaurant/MenuItemForm';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import type { MenuItem } from '@/types';

export default function RestaurantMenuPage() {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
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
      name: 'Pepperoni Pizza',
      description: 'Classic pepperoni with mozzarella cheese',
      price: 14.99,
      image: '🍕',
      category: 'Pizza',
      isAvailable: true,
      preparationTime: 20,
      tags: ['popular', 'best-seller'],
      createdAt: new Date(),
    },
    {
      _id: '3',
      restaurantId: 'rest1',
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
      _id: '4',
      restaurantId: 'rest1',
      name: 'Garlic Bread',
      description: 'Toasted bread with garlic butter and herbs',
      price: 4.99,
      image: '🥖',
      category: 'Sides',
      isAvailable: false,
      preparationTime: 8,
      tags: ['side'],
      createdAt: new Date(),
    },
  ]);

  const categories = ['all', 'Pizza', 'Burgers', 'Salads', 'Pasta', 'Sides', 'Desserts'];

  const handleAddItem = (item: Partial<MenuItem>) => {
    const newItem: MenuItem = {
      ...item,
      _id: Math.random().toString(),
      restaurantId: 'rest1',
      createdAt: new Date(),
    } as MenuItem;
    setMenuItems([...menuItems, newItem]);
  };

  const handleEditItem = (item: Partial<MenuItem>) => {
    setMenuItems(menuItems.map((i) => (i._id === editingItem?._id ? { ...i, ...item } : i)));
    setEditingItem(undefined);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(menuItems.filter((i) => i._id !== id));
    }
  };

  const toggleAvailability = (id: string) => {
    setMenuItems(menuItems.map((i) => (i._id === id ? { ...i, isAvailable: !i.isAvailable } : i)));
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('restaurant.manageMenu')}</h1>
            <p className="text-gray-600">Add, edit, or remove menu items</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setEditingItem(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            {t('restaurant.addMenuItem')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="text-gray-600 text-sm mb-1">Total Items</div>
              <div className="text-3xl font-bold">{menuItems.length}</div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-gray-600 text-sm mb-1">Available</div>
              <div className="text-3xl font-bold text-green-600">
                {menuItems.filter((i) => i.isAvailable).length}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-gray-600 text-sm mb-1">Unavailable</div>
              <div className="text-3xl font-bold text-red-600">
                {menuItems.filter((i) => !i.isAvailable).length}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-gray-600 text-sm mb-1">Categories</div>
              <div className="text-3xl font-bold">{new Set(menuItems.map((i) => i.category)).size}</div>
            </div>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item._id}>
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      {item.image || '🍽️'}
                    </div>
                  </div>
                  {!item.isAvailable && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Unavailable
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <span className="text-2xl font-bold text-primary-600">${item.price.toFixed(2)}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-gray-500 text-xs">• {item.preparationTime} min</span>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => toggleAvailability(item._id)}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        item.isAvailable
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsFormOpen(true);
                      }}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold text-sm transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Menu Item Form Modal */}
        <MenuItemForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(undefined);
          }}
          onSubmit={editingItem ? handleEditItem : handleAddItem}
          editItem={editingItem}
        />
      </div>
    </div>
  );
}