'use client';

import React from 'react';
import { MapPin, Store, User } from 'lucide-react';

interface TrackingMapProps {
  restaurantLocation?: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
}

export default function TrackingMap({
  restaurantLocation,
  driverLocation,
  deliveryLocation,
}: TrackingMapProps) {
  // This is a placeholder. In production, integrate Google Maps API
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 relative overflow-hidden h-96">
      {/* Decorative Map Background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="gray"
              strokeWidth="1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Map Markers */}
      <div className="relative h-full flex items-center justify-center">
        <div className="relative w-full max-w-3xl">
          {/* Restaurant Marker */}
          {restaurantLocation && (
            <div className="absolute left-1/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-white rounded-full p-4 shadow-2xl border-4 border-blue-500 animate-pulse-slow">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-lg text-sm font-semibold">
                Restaurant
              </div>
            </div>
          )}

          {/* Driver Marker */}
          {driverLocation && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-white rounded-full p-4 shadow-2xl border-4 border-green-500 animate-bounce">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-lg text-sm font-semibold">
                Driver
              </div>
            </div>
          )}

          {/* Delivery Location Marker */}
          {deliveryLocation && (
            <div className="absolute right-1/4 bottom-1/4 transform translate-x-1/2 translate-y-1/2">
              <div className="bg-white rounded-full p-4 shadow-2xl border-4 border-primary-500">
                <MapPin className="w-8 h-8 text-primary-600" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-lg text-sm font-semibold">
                Your Location
              </div>
            </div>
          )}

          {/* Route Line */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <path
              d="M 25% 25% Q 40% 40%, 50% 50% T 75% 75%"
              stroke="#22c55e"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Map Info */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="font-semibold">Live Tracking Active</span>
        </div>
      </div>
    </div>
  );
}