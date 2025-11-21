// src/components/maps/RoutePolyline.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Coordinates } from '@/types/maps';

interface RoutePolylineProps {
  map: google.maps.Map;
  origin: Coordinates;
  destination: Coordinates;
  waypoints?: google.maps.DirectionsWaypoint[];
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  onRouteCalculated?: (result: google.maps.DirectionsResult) => void;
}

export default function RoutePolyline({
  map,
  origin,
  destination,
  waypoints = [],
  strokeColor = '#22c55e',
  strokeWeight = 5,
  strokeOpacity = 0.8,
  onRouteCalculated,
}: RoutePolylineProps) {
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map) return;

    const directionsService = new google.maps.DirectionsService();
    
    // Create renderer if not exists
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor,
          strokeWeight,
          strokeOpacity,
        },
      });
    }

    // Calculate route
    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRendererRef.current?.setDirections(result);
          
          if (onRouteCalculated) {
            onRouteCalculated(result);
          }
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );

    // Cleanup
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    };
  }, [map, origin, destination, waypoints, strokeColor, strokeWeight, strokeOpacity, onRouteCalculated]);

  return null; // This component doesn't render anything
}