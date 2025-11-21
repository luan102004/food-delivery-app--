// src/components/maps/NearbyRestaurantsMap.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Coordinates } from '@/types/maps';
import { Store, MapPin, Star, Navigation, X } from 'lucide-react';
import Button from '@/components/shared/Button';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  location: Coordinates;
  rating: number;
  cuisine: string[];
  image: string;
  distance?: string;
}

interface NearbyRestaurantsMapProps {
  restaurants: Restaurant[];
  userLocation?: Coordinates;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  className?: string;
}

export default function NearbyRestaurantsMap({
  restaurants,
  userLocation,
  onRestaurantSelect,
  className = '',
}: NearbyRestaurantsMapProps) {
  const containerId = useRef(`nearby-map-${Math.random().toString(36).substr(2, 9)}`).current;
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [hoveredRestaurant, setHoveredRestaurant] = useState<string | null>(null);

  const { 
    map, 
    isLoaded, 
    error, 
    addMarker, 
    removeMarker, 
    addCircle,
    removeCircle,
    fitBounds,
    panTo,
  } = useGoogleMaps({
    containerId,
    config: {
      center: userLocation || { lat: 10.7769, lng: 106.7009 },
      zoom: 13,
    },
  });

  // Add user location marker
  useEffect(() => {
    if (!map || !userLocation) return;

    addMarker('user', userLocation, {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#f97316',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 12,
      },
      title: 'Your Location',
      zIndex: 1000,
      infoContent: `
        <div style="padding: 8px;">
          <div style="font-weight: bold; margin-bottom: 4px;">📍 Your Location</div>
          <div style="font-size: 12px; color: #666;">You are here</div>
        </div>
      `,
    });

    // Add radius circle (5km)
    addCircle('user-radius', userLocation, 5000, {
      strokeColor: '#f97316',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      fillColor: '#f97316',
      fillOpacity: 0.1,
    });

    return () => {
      removeMarker('user');
      removeCircle('user-radius');
    };
  }, [map, userLocation, addMarker, removeMarker, addCircle, removeCircle]);

  // Add restaurant markers
  useEffect(() => {
    if (!map || restaurants.length === 0) return;

    restaurants.forEach((restaurant) => {
      const isHovered = hoveredRestaurant === restaurant.id;
      const isSelected = selectedRestaurant?.id === restaurant.id;

      addMarker(`restaurant-${restaurant.id}`, restaurant.location, {
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: isSelected ? '#22c55e' : isHovered ? '#3b82f6' : '#6b7280',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: isSelected ? 14 : isHovered ? 12 : 10,
        },
        title: restaurant.name,
        animation: isHovered || isSelected ? google.maps.Animation.BOUNCE : undefined,
        onClick: () => handleRestaurantClick(restaurant),
        infoContent: `
          <div style="padding: 12px; max-width: 250px;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
              ${restaurant.image} ${restaurant.name}
            </div>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="color: #eab308;">⭐</span>
              <span style="font-weight: 600;">${restaurant.rating}</span>
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
              ${restaurant.cuisine.join(', ')}
            </div>
            <div style="font-size: 12px; color: #666;">
              📍 ${restaurant.address}
            </div>
            ${restaurant.distance ? `
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                🚗 ${restaurant.distance} away
              </div>
            ` : ''}
          </div>
        `,
      });
    });

    // Fit bounds to show all markers
    const allPoints = [
      ...(userLocation ? [userLocation] : []),
      ...restaurants.map(r => r.location),
    ];
    fitBounds(allPoints);

    return () => {
      restaurants.forEach(restaurant => {
        removeMarker(`restaurant-${restaurant.id}`);
      });
    };
  }, [map, restaurants, userLocation, hoveredRestaurant, selectedRestaurant, addMarker, removeMarker, fitBounds]);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    panTo(restaurant.location);
    if (onRestaurantSelect) {
      onRestaurantSelect(restaurant);
    }
  };

  const handleGetDirections = () => {
    if (!selectedRestaurant || !userLocation) return;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedRestaurant.location.lat},${selectedRestaurant.location.lng}`;
    window.open(url, '_blank');
  };

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-red-600 font-semibold">Failed to load map</p>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600 font-semibold">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div id={containerId} className="w-full h-full rounded-lg" />

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="text-sm font-semibold mb-2">Legend</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full" />
            <span>Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Restaurant List Sidebar */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg w-80 max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="font-bold text-lg">
            Nearby Restaurants ({restaurants.length})
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className={`p-4 border-b cursor-pointer transition-colors ${
                selectedRestaurant?.id === restaurant.id
                  ? 'bg-primary-50 border-primary-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleRestaurantClick(restaurant)}
              onMouseEnter={() => setHoveredRestaurant(restaurant.id)}
              onMouseLeave={() => setHoveredRestaurant(null)}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{restaurant.image}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold mb-1 truncate">{restaurant.name}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    <span className="text-sm font-semibold">{restaurant.rating}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {restaurant.cuisine.join(', ')}
                  </div>
                  {restaurant.distance && (
                    <div className="text-xs text-gray-500">
                      🚗 {restaurant.distance} away
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Restaurant Detail */}
      {selectedRestaurant && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-md mx-auto">
          <button
            onClick={() => setSelectedRestaurant(null)}
            className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">{selectedRestaurant.image}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-2">{selectedRestaurant.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                <span className="font-semibold">{selectedRestaurant.rating}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {selectedRestaurant.cuisine.join(', ')}
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{selectedRestaurant.address}</span>
              </div>
              {selectedRestaurant.distance && (
                <div className="text-sm text-gray-600 mt-1">
                  🚗 {selectedRestaurant.distance} away
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGetDirections}
            >
              <Navigation className="w-4 h-4" />
              Directions
            </Button>
            <Button
              variant="primary"
              onClick={() => onRestaurantSelect?.(selectedRestaurant)}
            >
              <Store className="w-4 h-4" />
              View Menu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}