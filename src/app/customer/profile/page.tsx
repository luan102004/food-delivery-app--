// src/app/customer/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import RestaurantMapPicker from '@/components/maps/RestaurantMapPicker';
import { User, Mail, Phone, MapPin, Save, Edit2 } from 'lucide-react';

export default function CustomerProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        lat: 0,
        lng: 0,
      },
    },
  });

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success) {
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          address: data.data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            coordinates: { lat: 0, lng: 0 },
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    // Parse address components
    const addressParts = location.address.split(', ');
    
    setFormData({
      ...formData,
      address: {
        street: addressParts[0] || '',
        city: addressParts[1] || 'Ho Chi Minh City',
        state: addressParts[2] || 'Vietnam',
        zipCode: formData.address.zipCode || '70000',
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
      },
    });
    
    setShowLocationPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
          },
        });
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
          {!isEditing && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <div className="p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold mb-1">{formData.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{formData.email}</p>
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold capitalize">
                {session?.user.role}
              </span>
            </div>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4">Personal Information</h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      icon={<User className="w-5 h-5" />}
                      disabled={!isEditing}
                      required
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      icon={<Mail className="w-5 h-5" />}
                      disabled
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      icon={<Phone className="w-5 h-5" />}
                      disabled={!isEditing}
                      placeholder="+84 123 456 789"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold mb-4">Delivery Address</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
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
                          disabled={!isEditing}
                          placeholder="123 Main Street"
                        />
                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowLocationPicker(true)}
                          >
                            <MapPin className="w-5 h-5" />
                            Pick Location
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="City"
                        value={formData.address.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value },
                          })
                        }
                        disabled={!isEditing}
                      />

                      <Input
                        label="Zip Code"
                        value={formData.address.zipCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, zipCode: e.target.value },
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    {formData.address.coordinates.lat !== 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <MapPin className="w-5 h-5" />
                          <div>
                            <div className="font-semibold">Location Set</div>
                            <div className="text-sm">
                              Lat: {formData.address.coordinates.lat.toFixed(6)}, 
                              Lng: {formData.address.coordinates.lng.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsEditing(false);
                        fetchUserProfile();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      isLoading={saving}
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          </div>
        </div>

        {/* Location Picker Modal */}
        {showLocationPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Pick Your Location</h2>
                  <button
                    onClick={() => setShowLocationPicker(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
                
                <RestaurantMapPicker
                  initialLocation={
                    formData.address.coordinates.lat !== 0
                      ? formData.address.coordinates
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