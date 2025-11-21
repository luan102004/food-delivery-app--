// src/components/maps/MapMarker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Coordinates } from '@/types/maps';

interface MapMarkerProps {
  map: google.maps.Map;
  position: Coordinates;
  type: 'restaurant' | 'driver' | 'customer';
  title?: string;
  label?: string;
  onClick?: () => void;
  rotation?: number;
}

export default function MapMarker({
  map,
  position,
  type,
  title,
  label,
  onClick,
  rotation = 0,
}: MapMarkerProps) {
  const markerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create marker icon based on type
    const icon = getMarkerIcon(type, rotation);

    // Create marker
    const marker = new google.maps.Marker({
      position,
      map,
      title,
      label: label ? {
        text: label,
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 'bold',
      } : undefined,
      icon,
      animation: google.maps.Animation.DROP,
    });

    markerRef.current = marker;

    // Create info window if title provided
    if (title) {
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${title}</h3>
            <p style="margin: 0; color: #666; font-size: 12px;">
              ${type === 'restaurant' ? '🍽️ Restaurant' : 
                type === 'driver' ? '🚗 Driver' : 
                '📍 Delivery Location'}
            </p>
          </div>
        `,
      });

      infoWindowRef.current = infoWindow;

      // Add click listener
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        if (onClick) onClick();
      });
    }

    // Cleanup
    return () => {
      marker.setMap(null);
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [map, position.lat, position.lng, type, title, label, onClick]);

  // Update position when it changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    }
  }, [position]);

  // Update rotation for driver marker
  useEffect(() => {
    if (markerRef.current && type === 'driver') {
      const icon = getMarkerIcon(type, rotation);
      markerRef.current.setIcon(icon);
    }
  }, [rotation, type]);

  return null;
}

// Helper function to get marker icon
function getMarkerIcon(
  type: 'restaurant' | 'driver' | 'customer',
  rotation: number = 0
): google.maps.Symbol {
  const colors = {
    restaurant: '#3b82f6', // blue
    driver: '#22c55e', // green
    customer: '#f97316', // orange
  };

  if (type === 'driver') {
    // Car icon for driver
    return {
      path: 'M 0,-3 L 2,3 L 0,2 L -2,3 Z',
      fillColor: colors.driver,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 5,
      rotation: rotation,
      anchor: new google.maps.Point(0, 0),
    };
  }

  // Circle marker for restaurant and customer
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: colors[type],
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    scale: 12,
  };
}