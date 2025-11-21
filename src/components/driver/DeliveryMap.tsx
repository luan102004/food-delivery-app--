'use client';

import React from 'react';
import { MapPin, Navigation, Store } from 'lucide-react';
import Button from '@/components/shared/Button';

interface DeliveryMapProps {
  restaurantLocation?: { lat: number; lng: number; name: string };
  deliveryLocation?: { lat: number; lng: number; address: string };
  driverLocation?: { lat: number; lng: number };
  onNavigate?: () => void;
}

export default function DeliveryMap({
  restaurantLocation,
  deliveryLocation,
  driverLocation,
  onNavigate,
}: DeliveryMapProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl relative overflow-hidden h-[500px]">
      {/* Decorative Map Background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="gray" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Map Content */}
      <div className="relative h-full p-6 flex items-center justify-center">
        <div className="relative w-full max-w-4xl h-full">
          {/* Restaurant Marker */}
          {restaurantLocation && (
            <div className="absolute left-1/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-slow">
              <div className="bg-white rounded-full p-5 shadow-2xl border-4 border-blue-500">
                <Store className="w-10 h-10 text-blue-600" />
              </div>
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-4 py-2 rounded-full shadow-lg font-semibold">
                <div className="text-xs text-gray-600">Pickup</div>
                <div className="font-bold">{restaurantLocation.name}</div>
              </div>
            </div>
          )}

          {/* Driver Marker */}
          {driverLocation && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-white rounded-full p-5 shadow-2xl border-4 border-primary-500 animate-bounce">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  🚗
                </div>
              </div>
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-4 py-2 rounded-full shadow-lg">
                <div className="text-xs text-gray-600">You</div>
                <div className="font-bold text-primary-600">Your Location</div>
              </div>
              {/* Pulsing circle */}
              <div className="absolute inset-0 -m-3">
                <div className="w-full h-full bg-primary-400 rounded-full opacity-30 animate-ping" />
              </div>
            </div>
          )}

          {/* Delivery Marker */}
          {deliveryLocation && (
            <div className="absolute right-1/4 bottom-1/4 transform translate-x-1/2 translate-y-1/2">
              <div className="bg-white rounded-full p-5 shadow-2xl border-4 border-green-500">
                <MapPin className="w-10 h-10 text-green-600" />
              </div>
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-4 py-2 rounded-full shadow-lg text-center max-w-xs">
                <div className="text-xs text-gray-600">Drop-off</div>
                <div className="font-bold text-sm">{deliveryLocation.address}</div>
              </div>
            </div>
          )}

          {/* Route Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <path
              d="M 25% 25% Q 37.5% 37.5%, 50% 50% T 75% 75%"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10,5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="font-semibold">Live Tracking</span>
        </div>
        <div className="text-xs text-gray-600">
          <div>Distance: 3.2 km</div>
          <div>ETA: 12 minutes</div>
        </div>
      </div>

      {/* Navigation Button */}
      {onNavigate && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button variant="primary" size="lg" onClick={onNavigate} className="shadow-2xl">
            <Navigation className="w-5 h-5" />
            Start Navigation
          </Button>
        </div>
      )}
    </div>
  );
}