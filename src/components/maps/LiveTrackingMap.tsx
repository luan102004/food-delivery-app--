// src/components/maps/LiveTrackingMap.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Coordinates } from '@/types/maps';
import { MapPin, Store, Navigation, Clock } from 'lucide-react';
import { animateMarker, calculateHeading, formatDistance, formatDuration } from '@/utils/mapHelpers';

interface LiveTrackingMapProps {
  orderNumber: string;
  restaurantLocation: Coordinates & { name: string; address: string };
  deliveryLocation: Coordinates & { address: string };
  initialDriverLocation?: Coordinates;
  estimatedTime?: string;
  onArrival?: () => void;
}

export default function LiveTrackingMap({
  orderNumber,
  restaurantLocation,
  deliveryLocation,
  initialDriverLocation,
  estimatedTime,
  onArrival,
}: LiveTrackingMapProps) {
  const containerId = useRef(`live-map-${orderNumber}`).current;
  const [distance, setDistance] = useState<string>('Calculating...');
  const [duration, setDuration] = useState<string>(estimatedTime || 'Calculating...');
  const [currentDriverLocation, setCurrentDriverLocation] = useState<Coordinates | null>(
    initialDriverLocation || null
  );

  const { map, isLoaded, error, addMarker, updateMarker, removeMarker, fitBounds } = useGoogleMaps({
    containerId,
    config: {
      center: restaurantLocation,
      zoom: 14,
    },
  });

  const { driverLocation, subscribeToOrder, unsubscribeFromOrder } = useRealtime();

  // Subscribe to order updates
  useEffect(() => {
    subscribeToOrder(orderNumber);
    return () => unsubscribeFromOrder(orderNumber);
  }, [orderNumber, subscribeToOrder, unsubscribeFromOrder]);

  // Update driver location from realtime
  useEffect(() => {
    if (driverLocation) {
      setCurrentDriverLocation({
        lat: driverLocation.lat,
        lng: driverLocation.lng,
      });
    }
  }, [driverLocation]);

  // Add markers when map loads
  useEffect(() => {
    if (!map) return;

    // Restaurant marker
    addMarker('restaurant', restaurantLocation, {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 12,
      },
      title: restaurantLocation.name,
      animation: google.maps.Animation.DROP,
    });

    // Delivery location marker
    addMarker('delivery', deliveryLocation, {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#f97316',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 12,
      },
      title: 'Delivery Location',
      animation: google.maps.Animation.DROP,
    });

    // Fit bounds to show all markers
    fitBounds([restaurantLocation, deliveryLocation]);

    return () => {
      removeMarker('restaurant');
      removeMarker('delivery');
      removeMarker('driver');
    };
  }, [map, restaurantLocation, deliveryLocation, addMarker, removeMarker, fitBounds]);

  // Add/Update driver marker
  useEffect(() => {
    if (!map || !currentDriverLocation) return;

    const driverMarkerExists = document.getElementById('driver-marker');
    
    if (!driverMarkerExists) {
      // Create new driver marker
      const heading = calculateHeading(currentDriverLocation, deliveryLocation);
      
      addMarker('driver', currentDriverLocation, {
        icon: {
          path: 'M 0,-2 L 1,2 L 0,1.5 L -1,2 Z',
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10,
          rotation: heading,
          anchor: new google.maps.Point(0, 0),
        },
        title: 'Driver',
      });
    } else {
      // Update existing marker with animation
      const marker = (window as any).__markers?.get('driver');
      if (marker) {
        const newHeading = calculateHeading(currentDriverLocation, deliveryLocation);
        animateMarker(marker, currentDriverLocation, 1000);
        
        marker.setIcon({
          path: 'M 0,-2 L 1,2 L 0,1.5 L -1,2 Z',
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10,
          rotation: newHeading,
          anchor: new google.maps.Point(0, 0),
        });
      }
    }

    // Calculate distance and duration
    if (window.google && window.google.maps) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: currentDriverLocation,
          destination: deliveryLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            const route = result.routes[0];
            if (route.legs[0]) {
              setDistance(route.legs[0].distance?.text || 'N/A');
              setDuration(route.legs[0].duration?.text || 'N/A');

              // Check if driver is near delivery location (within 100m)
              const distanceValue = route.legs[0].distance?.value || 0;
              if (distanceValue < 100 && onArrival) {
                onArrival();
              }
            }
          }
        }
      );
    }
  }, [map, currentDriverLocation, deliveryLocation, addMarker, onArrival]);

  // Draw route polyline
  useEffect(() => {
    if (!map || !currentDriverLocation) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#22c55e',
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });

    directionsService.route(
      {
        origin: currentDriverLocation,
        destination: deliveryLocation,
        waypoints: [],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        }
      }
    );

    return () => {
      directionsRenderer.setMap(null);
    };
  }, [map, currentDriverLocation, deliveryLocation]);

  if (error) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-red-600 font-semibold mb-2">Failed to load map</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-semibold">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      {/* Map Container */}
      <div id={containerId} className="w-full h-full" />

      {/* Info Overlay */}
      <div className="absolute top-4 left-4 right-4 flex gap-3">
        {/* Restaurant Info */}
        <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-3 flex-1">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-600">Pickup</div>
            <div className="font-semibold text-sm truncate">{restaurantLocation.name}</div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-3 flex-1">
          <div className="bg-orange-100 p-2 rounded-lg">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-600">Drop-off</div>
            <div className="font-semibold text-sm truncate">{deliveryLocation.address}</div>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      {currentDriverLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-semibold text-sm">Driver En Route</span>
            </div>
            <Navigation className="w-5 h-5 text-primary-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                <MapPin className="w-4 h-4" />
                <span>Distance</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{distance}</div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                <Clock className="w-4 h-4" />
                <span>ETA</span>
              </div>
              <div className="text-xl font-bold text-primary-600">{duration}</div>
            </div>
          </div>
        </div>
      )}

      {/* No Driver Yet */}
      {!currentDriverLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-yellow-800 font-semibold mb-1">Searching for driver...</div>
          <div className="text-yellow-600 text-sm">We'll update you when a driver accepts your order</div>
        </div>
      )}
    </div>
  );
}