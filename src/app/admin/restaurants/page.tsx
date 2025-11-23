'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Star, MapPin } from 'lucide-react';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/restaurants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, isOpen: !currentStatus }),
      });

      if (response.ok) {
        fetchRestaurants();
      }
    } catch (error) {
      console.error('Failed to update restaurant:', error);
    }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine?.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Restaurant Management</h1>
            <p className="text-gray-600">Manage all restaurants in the system</p>
          </div>
          <Button variant="primary" size="lg" aria-label="Add restaurant">
            <Plus className="w-5 h-5" />
            Add Restaurant
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Restaurants', value: restaurants.length, color: 'blue' },
            { label: 'Active', value: restaurants.filter(r => r.isOpen).length, color: 'green' },
            { label: 'Inactive', value: restaurants.filter(r => !r.isOpen).length, color: 'red' },
            { label: 'Avg Rating', value: '4.5', color: 'yellow' },
          ].map((stat, idx) => (
            <Card key={idx}>
              <div className="p-6">
                <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="mb-6">
          <div className="p-6">
            <Input
              placeholder="Search restaurants by name or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search restaurants"
              icon={<Search className="w-5 h-5" />}
            />
          </div>
        </Card>

        {/* Restaurants */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant._id}>
                
                {/* Image */}
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {restaurant.image || '🍽️'}
                  </div>
                  {!restaurant.isOpen && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Closed
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                        <span className="font-semibold">{restaurant.rating}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {restaurant.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{restaurant.address?.street}</span>
                  </div>

                  {restaurant.cuisine?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {restaurant.cuisine.map((c: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => toggleRestaurantStatus(restaurant._id, restaurant.isOpen)}
                      aria-label={restaurant.isOpen ? 'Hide restaurant' : 'Show restaurant'}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        restaurant.isOpen
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {restaurant.isOpen ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      aria-label="Edit restaurant"
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold text-sm transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      aria-label="Delete restaurant"
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
