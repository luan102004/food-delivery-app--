// src/app/customer/restaurants-map/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useGeolocation } from '@/hooks/useGeolocation';
import NearbyRestaurantsMap from '@/components/maps/NearbyRestaurantsMap';
import Button from '@/components/shared/Button';
import { ArrowLeft, List, Navigation } from 'lucide-react';
import Link from 'next/link';

export default function RestaurantsMapPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation(true);
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch restaurants
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const params = new URLSearchParams();
        if (latitude && longitude) {
          params.append('lat', latitude.toString());
          params.append('lng', longitude.toString());
          params.append('maxDistance', '10000'); // 10km
        }

        const response = await fetch(`/api/restaurants?${params}`);
        const data = await response.json();

        if (data.success) {
          // Calculate distances if we have user location
          const restaurantsWithDistance = data.data.map((r: any) => {
            let distance = '';
            
            if (latitude && longitude && r.address?.coordinates) {
              const dist = calculateDistance(
                { lat: latitude, lng: longitude },
                r.address.coordinates
              );
              distance = dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
            }

            return {
              id: r._id,
              name: r.name,
              address: r.address?.street || 'Address not available',
              location: r.address?.coordinates || { lat: 10.7769, lng: 106.7009 },
              rating: r.rating || 0,
              cuisine: r.cuisine || [],
              image: r.image || '🍽️',
              distance,
            };
          });

          setRestaurants(restaurantsWithDistance);
        }
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, [latitude, longitude]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.lat)) *
        Math.cos(toRad(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const handleRestaurantSelect = (restaurant: any) => {
    router.push(`/customer/menu?restaurant=${restaurant.id}`);
  };

  if (loading || geoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">
            {geoLoading ? 'Getting your location...' : 'Loading restaurants...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/customer/menu">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Nearby Restaurants</h1>
                <p className="text-sm text-gray-600">
                  {restaurants.length} restaurants found
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/customer/menu">
                <Button variant="outline">
                  <List className="w-5 h-5" />
                  List View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Location Error */}
      {geoError && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-800 mb-1">
                  Location Access Required
                </div>
                <div className="text-sm text-yellow-700">
                  {geoError}. Please enable location access to see restaurants near you.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="h-[calc(100vh-5rem)]">
        <NearbyRestaurantsMap
          restaurants={restaurants}
          userLocation={
            latitude && longitude
              ? { lat: latitude, lng: longitude }
              : undefined
          }
          onRestaurantSelect={handleRestaurantSelect}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}