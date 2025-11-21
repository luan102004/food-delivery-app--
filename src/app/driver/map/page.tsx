'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import DeliveryMap from '@/components/driver/DeliveryMap';
import Button from '@/components/shared/Button';
import { Navigation, Phone, MessageCircle, CheckCircle2, MapPin, Clock } from 'lucide-react';

export default function DriverMapPage() {
  const { t } = useLanguage();
  const [activeDelivery] = useState({
    orderNumber: 'ORD456DEF',
    restaurant: {
      name: 'Pizza Palace',
      address: '456 Restaurant St, District 1',
      phone: '+84 123 456 789',
    },
    customer: {
      name: 'John Doe',
      address: '123 Main St, District 1',
      phone: '+84 987 654 321',
    },
    status: 'on_the_way',
    earnings: 8.5,
    distance: 3.2,
    estimatedTime: 12,
  });

  const handleNavigation = () => {
    alert('Opening Google Maps navigation...');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Live Delivery Map</h1>
          <p className="text-gray-600">Track your current delivery in real-time</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Order #{activeDelivery.orderNumber}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    On the Way
                  </span>
                </div>

                <DeliveryMap
                  restaurantLocation={{
                    lat: 10.7769,
                    lng: 106.7009,
                    name: activeDelivery.restaurant.name,
                  }}
                  deliveryLocation={{
                    lat: 10.7809,
                    lng: 106.7049,
                    address: activeDelivery.customer.address,
                  }}
                  driverLocation={{
                    lat: 10.7789,
                    lng: 106.7029,
                  }}
                  onNavigate={handleNavigation}
                />

                {/* Trip Info */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                    <div className="text-2xl font-bold">{activeDelivery.distance} km</div>
                    <div className="text-sm text-gray-600">Distance Left</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{activeDelivery.estimatedTime} min</div>
                    <div className="text-sm text-gray-600">ETA</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">${activeDelivery.earnings}</div>
                    <div className="text-sm text-gray-600">Earnings</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Delivery Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Restaurant Info */}
            <Card>
              <div className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Pickup Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-lg">{activeDelivery.restaurant.name}</div>
                    <div className="text-sm text-gray-600">{activeDelivery.restaurant.address}</div>
                  </div>
                  <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm">
                    <Phone className="w-4 h-4" />
                    {activeDelivery.restaurant.phone}
                  </button>
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card>
              <div className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Delivery Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-lg">{activeDelivery.customer.name}</div>
                    <div className="text-sm text-gray-600">{activeDelivery.customer.address}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="p-6">
                <h3 className="font-bold mb-4">Delivery Actions</h3>
                <div className="space-y-3">
                  <Button variant="primary" size="lg" className="w-full" onClick={handleNavigation}>
                    <Navigation className="w-5 h-5" />
                    {t('driver.navigation')}
                  </Button>
                  <Button variant="success" size="lg" className="w-full">
                    <CheckCircle2 className="w-5 h-5" />
                    {t('driver.deliveryComplete')}
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-white rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Delivery Instructions</div>
                  <div className="text-sm font-medium">Ring doorbell, leave at door</div>
                </div>
              </div>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="p-6">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="font-bold mb-2">Safety First</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Follow traffic rules</li>
                  <li>• Wear protective gear</li>
                  <li>• Keep food secure</li>
                  <li>• Contact support if needed</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}