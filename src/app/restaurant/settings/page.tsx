// src/app/restaurant/settings/page.tsx - ENHANCED
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import RestaurantMapPicker from '@/components/maps/RestaurantMapPicker';
import { Store, Mail, Phone, MapPin, Save, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RestaurantSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [addressComplete, setAddressComplete] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0], // [lng, lat]
      },
    },
    cuisine: [] as string[],
    openingHours: {
      monday: { open: '09:00', close: '22:00', isClosed: false },
      tuesday: { open: '09:00', close: '22:00', isClosed: false },
      wednesday: { open: '09:00', close: '22:00', isClosed: false },
      thursday: { open: '09:00', close: '22:00', isClosed: false },
      friday: { open: '09:00', close: '23:00', isClosed: false },
      saturday: { open: '09:00', close: '23:00', isClosed: false },
      sunday: { open: '10:00', close: '21:00', isClosed: false },
    },
  });

  useEffect(() => {
    if (session?.user) {
      fetchRestaurant();
    }
  }, [session]);

  useEffect(() => {
    // Check if address is complete
    const isComplete = 
      formData.address.street.length >= 5 &&
      formData.address.city.length > 0 &&
      formData.address.state.length > 0 &&
      formData.address.zipCode.length > 0 &&
      formData.address.coordinates.coordinates[0] !== 0 &&
      formData.address.coordinates.coordinates[1] !== 0;
    
    setAddressComplete(isComplete);
  }, [formData.address]);

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurants?ownerId=${session?.user.id}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const rest = data.data[0];
        setRestaurant(rest);
        setFormData({
          name: rest.name || '',
          description: rest.description || '',
          phone: rest.phone || '',
          email: rest.email || '',
          address: rest.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            coordinates: { type: 'Point', coordinates: [0, 0] },
          },
          cuisine: rest.cuisine || [],
          openingHours: rest.openingHours || formData.openingHours,
        });
      }
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    const addressParts = location.address.split(', ');
    
    setFormData({
      ...formData,
      address: {
        street: addressParts[0] || '',
        city: addressParts[1] || 'Ho Chi Minh City',
        state: addressParts[2] || 'Vietnam',
        zipCode: formData.address.zipCode || '70000',
        coordinates: {
          type: 'Point',
          coordinates: [location.lng, location.lat], // [lng, lat] order!
        },
      },
    });
    
    setShowLocationPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!addressComplete) {
      alert('⚠️ Please complete your restaurant address with accurate location on map.\n\nThis is required for:\n✅ Customers to find you\n✅ Calculate delivery distance\n✅ Driver navigation');
      return;
    }

    if (!formData.name || formData.name.length < 3) {
      alert('Restaurant name must be at least 3 characters');
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      alert('Description must be at least 10 characters');
      return;
    }

    if (formData.cuisine.length === 0) {
      alert('Please select at least one cuisine type');
      return;
    }

    setSaving(true);

    try {
      const method = restaurant ? 'PUT' : 'POST';
      const body = restaurant
        ? { _id: restaurant._id, ...formData }
        : { ...formData, ownerId: session?.user.id };

      const response = await fetch('/api/restaurants', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Restaurant settings updated successfully!');
        fetchRestaurant();
      } else {
        alert('❌ ' + (data.error || 'Failed to update settings'));
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('❌ Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCuisineChange = (cuisine: string) => {
    setFormData({
      ...formData,
      cuisine: formData.cuisine.includes(cuisine)
        ? formData.cuisine.filter((c) => c !== cuisine)
        : [...formData.cuisine, cuisine],
    });
  };

  const cuisineOptions = [
    'Italian', 'Japanese', 'Chinese', 'Vietnamese', 
    'American', 'Thai', 'Korean', 'Mexican', 
    'Indian', 'French', 'Mediterranean', 'Fast Food'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Restaurant Settings</h1>
          <p className="text-gray-600">Manage your restaurant information</p>
        </div>

        {/* Address Completion Warning */}
        {!addressComplete && (
          <Card className="mb-6 border-l-4 border-l-yellow-500">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">⚠️ Complete Your Address to Accept Orders</h3>
                  <p className="text-gray-700 mb-3">
                    Your restaurant address is incomplete. Please set your accurate location on the map below.
                  </p>
                  <div className="bg-yellow-50 rounded-lg p-4 text-sm">
                    <div className="font-semibold mb-2">Why this is important:</div>
                    <ul className="space-y-1 text-gray-700">
                      <li>✓ Customers can find your restaurant on the map</li>
                      <li>✓ System calculates accurate delivery distances</li>
                      <li>✓ Drivers get correct navigation directions</li>
                      <li>✓ You appear in "Nearby Restaurants" search</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Success Status */}
        {addressComplete && (
          <Card className="mb-6 border-l-4 border-l-green-500">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">
                  ✅ Your restaurant is ready to accept orders!
                </span>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold mb-4">Basic Information</h3>
              
              <Input
                label="Restaurant Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={<Store className="w-5 h-5" />}
                required
                minLength={3}
                placeholder="e.g., Pizza Paradise"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description * (min 10 characters)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  required
                  minLength={10}
                  placeholder="Describe your restaurant, specialties, and what makes you unique..."
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<Phone className="w-5 h-5" />}
                  placeholder="+84 123 456 789"
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                  placeholder="restaurant@example.com"
                />
              </div>
            </div>
          </Card>

          {/* Location - CRITICAL */}
          <Card className={!addressComplete ? 'border-2 border-yellow-400' : ''}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Location * (Required)</h3>
                {!addressComplete && (
                  <span className="text-yellow-600 text-sm font-semibold">
                    ⚠️ Action Required
                  </span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address * (min 5 characters)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    icon={<MapPin className="w-5 h-5" />}
                    required
                    minLength={5}
                    placeholder="123 Main Street, District 1"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setShowLocationPicker(true)}
                  >
                    <MapPin className="w-5 h-5" />
                    Pick on Map
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="City *"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  required
                  placeholder="Ho Chi Minh City"
                />

                <Input
                  label="Zip Code *"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value },
                    })
                  }
                  required
                  placeholder="70000"
                />
              </div>

              {formData.address.coordinates.coordinates[0] !== 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">✅ Location Set Successfully</div>
                      <div className="text-sm mt-1">
                        Coordinates: {formData.address.coordinates.coordinates[1].toFixed(6)}, 
                        {formData.address.coordinates.coordinates[0].toFixed(6)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">❌ Location Not Set</div>
                      <div className="text-sm mt-1">
                        Click "Pick on Map" to set your exact restaurant location
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Cuisine */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Cuisine Types * (Select at least one)</h3>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => handleCuisineChange(cuisine)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.cuisine.includes(cuisine)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
              {formData.cuisine.length === 0 && (
                <p className="text-red-600 text-sm mt-2">Please select at least one cuisine type</p>
              )}
            </div>
          </Card>

          {/* Opening Hours */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Opening Hours
              </h3>
              <div className="space-y-3">
                {Object.entries(formData.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-28 font-semibold capitalize">{day}</div>
                    <input
                      type="checkbox"
                      checked={!hours.isClosed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          openingHours: {
                            ...formData.openingHours,
                            [day]: { ...hours, isClosed: !e.target.checked },
                          },
                        })
                      }
                      className="w-5 h-5"
                    />
                    {!hours.isClosed && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              openingHours: {
                                ...formData.openingHours,
                                [day]: { ...hours, open: e.target.value },
                              },
                            })
                          }
                          className="px-3 py-2 border rounded-lg"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              openingHours: {
                                ...formData.openingHours,
                                [day]: { ...hours, close: e.target.value },
                              },
                            })
                          }
                          className="px-3 py-2 border rounded-lg"
                        />
                      </>
                    )}
                    {hours.isClosed && <span className="text-gray-500">Closed</span>}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full" 
            isLoading={saving}
            disabled={!addressComplete}
          >
            <Save className="w-5 h-5" />
            {addressComplete ? 'Save Settings' : 'Complete Address First'}
          </Button>
        </form>

        {/* Location Picker Modal */}
        {showLocationPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">📍 Pick Your Exact Restaurant Location</h2>
                  <button
                    onClick={() => setShowLocationPicker(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Drag the marker or click on the map to set your exact restaurant location.
                    This helps customers and drivers find you accurately!
                  </p>
                </div>
                
                <RestaurantMapPicker
                  initialLocation={
                    formData.address.coordinates.coordinates[0] !== 0
                      ? {
                          lat: formData.address.coordinates.coordinates[1],
                          lng: formData.address.coordinates.coordinates[0],
                        }
                      : undefined
                  }
                  onLocationSelect={handleLocationSelect}
                  className="h-[600px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}