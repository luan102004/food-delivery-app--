// src/app/driver/map/page.tsx - ENHANCED VERSION
'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import Card from '@/components/shared/Card';
import LiveTrackingMap from '@/components/maps/LiveTrackingMap';
import Button from '@/components/shared/Button';
import { Navigation, Phone, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function DriverMapPage() {
  const { t } = useLanguage();
  const { latitude, longitude } = useGeolocation(true); // Watch position
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch active delivery
  useEffect(() => {
    async function fetchActiveDelivery() {
      try {
        // Get current user's active delivery
        const response = await fetch('/api/orders?status=on_the_way&limit=1');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          setActiveDelivery(data.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch active delivery:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveDelivery();
  }, []);

  // Update driver location in real-time
  useEffect(() => {
    if (!latitude || !longitude || !activeDelivery) return;

    const updateLocation = async () => {
      try {
        await fetch('/api/realtime/driver-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverId: 'current-driver-id', // Get from auth
            coordinates: { lat: latitude, lng: longitude },
          }),
        });
      } catch (error) {
        console.error('Failed to update location:', error);
      }
    };

    // Update every 10 seconds
    const interval = setInterval(updateLocation, 10000);
    updateLocation(); // Initial update

    return () => clearInterval(interval);
  }, [latitude, longitude, activeDelivery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery details...</p>
        </div>
      </div>
    );
  }

  if (!activeDelivery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">No Active Delivery</h2>
          <p className="text-gray-600">Accept an order to start delivering</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Live Delivery Map</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <LiveTrackingMap
                  orderNumber={activeDelivery.orderNumber}
                  restaurantLocation={{
                    lat: 10.7769,
                    lng: 106.7009,
                    name: 'Restaurant Name',
                    address: 'Restaurant Address',
                  }}
                  deliveryLocation={{
                    lat: activeDelivery.deliveryAddress.coordinates?.lat || 10.7809,
                    lng: activeDelivery.deliveryAddress.coordinates?.lng || 106.7049,
                    address: activeDelivery.deliveryAddress.street,
                  }}
                  initialDriverLocation={
                    latitude && longitude
                      ? { lat: latitude, lng: longitude }
                      : undefined
                  }
                />
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="font-bold mb-4">Delivery Actions</h3>
                <div className="space-y-3">
                  <Button variant="primary" size="lg" className="w-full">
                    <Navigation className="w-5 h-5" />
                    {t('driver.navigation')}
                  </Button>
                  <Button variant="success" size="lg" className="w-full">
                    <CheckCircle2 className="w-5 h-5" />
                    Mark as Delivered
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}