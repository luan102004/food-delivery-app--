// src/components/maps/GoogleMapComponent.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Coordinates } from '@/types/maps';
import MapMarker from './MapMarker';

interface GoogleMapComponentProps {
  center?: Coordinates;
  zoom?: number;
  markers?: Array<{
    id: string;
    position: Coordinates;
    type: 'restaurant' | 'driver' | 'customer';
    title?: string;
    label?: string;
  }>;
  showRoute?: boolean;
  routePoints?: Coordinates[];
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
}

export default function GoogleMapComponent({
  center = { lat: 10.7769, lng: 106.7009 },
  zoom = 13,
  markers = [],
  showRoute = false,
  routePoints = [],
  className = 'w-full h-full',
  onMapLoad,
}: GoogleMapComponentProps) {
  const containerId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`).current;
  const [routePolyline, setRoutePolyline] = useState<google.maps.Polyline | null>(null);

  const { map, isLoaded, error, fitBounds } = useGoogleMaps({
    containerId,
    config: { center, zoom },
  });

  // Notify parent when map loads
  useEffect(() => {
    if (map && onMapLoad) {
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

  // Draw route polyline
  useEffect(() => {
    if (!map || !showRoute || routePoints.length < 2) return;

    // Remove existing polyline
    if (routePolyline) {
      routePolyline.setMap(null);
    }

    // Create new polyline
    const polyline = new google.maps.Polyline({
      path: routePoints,
      geodesic: true,
      strokeColor: '#22c55e',
      strokeOpacity: 0.8,
      strokeWeight: 5,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            strokeColor: '#22c55e',
          },
          offset: '100%',
          repeat: '100px',
        },
      ],
    });

    polyline.setMap(map);
    setRoutePolyline(polyline);

    // Fit bounds to show entire route
    if (routePoints.length > 0) {
      fitBounds(routePoints);
    }

    return () => {
      polyline.setMap(null);
    };
  }, [map, showRoute, routePoints, fitBounds]);

  // Auto-fit bounds when markers change
  useEffect(() => {
    if (map && markers.length > 0) {
      const points = markers.map((m) => m.position);
      fitBounds(points);
    }
  }, [map, markers, fitBounds]);

  if (error) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
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
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-semibold">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div id={containerId} className="w-full h-full rounded-lg" />
      
      {/* Render markers */}
      {map &&
        markers.map((marker) => (
          <MapMarker
            key={marker.id}
            map={map}
            position={marker.position}
            type={marker.type}
            title={marker.title}
            label={marker.label}
          />
        ))}
    </div>
  );
}