// src/hooks/useGoogleMaps.ts
import { useState, useEffect, useRef } from 'react';
import { initGoogleMaps, mapStyles } from '@/lib/googleMaps';
import { MapConfig, Coordinates } from '@/types/maps';

interface UseGoogleMapsProps {
  containerId: string;
  config?: Partial<MapConfig>;
}

export const useGoogleMaps = ({ containerId, config }: UseGoogleMapsProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  const defaultConfig: MapConfig = {
    center: { lat: 10.7769, lng: 106.7009 }, // Ho Chi Minh City
    zoom: 13,
    styles: mapStyles,
    gestureHandling: 'greedy',
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    ...config,
  };

  useEffect(() => {
    const loadMap = async () => {
      try {
        await initGoogleMaps();
        
        const container = document.getElementById(containerId);
        if (!container) {
          throw new Error(`Container with id "${containerId}" not found`);
        }

        const mapInstance = new google.maps.Map(container, defaultConfig);
        setMap(mapInstance);
        setIsLoaded(true);
      } catch (err: any) {
        console.error('Failed to load Google Maps:', err);
        setError(err.message);
      }
    };

    loadMap();
  }, [containerId]);

  const addMarker = (
    id: string,
    position: Coordinates,
    options?: google.maps.MarkerOptions
  ): google.maps.Marker | null => {
    if (!map) return null;

    const marker = new google.maps.Marker({
      position,
      map,
      ...options,
    });

    markersRef.current.set(id, marker);
    return marker;
  };

  const removeMarker = (id: string) => {
    const marker = markersRef.current.get(id);
    if (marker) {
      marker.setMap(null);
      markersRef.current.delete(id);
    }
  };

  const updateMarker = (
    id: string,
    position: Coordinates,
    options?: google.maps.MarkerOptions
  ) => {
    const marker = markersRef.current.get(id);
    if (marker) {
      marker.setPosition(position);
      if (options) {
        marker.setOptions(options);
      }
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();
  };

  const fitBounds = (points: Coordinates[]) => {
    if (!map || points.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point));
    
    map.fitBounds(bounds, {
      top: 100,
      right: 50,
      bottom: 100,
      left: 50,
    });
  };

  const setCenter = (center: Coordinates, zoom?: number) => {
    if (!map) return;
    map.setCenter(center);
    if (zoom) map.setZoom(zoom);
  };

  return {
    map,
    isLoaded,
    error,
    addMarker,
    removeMarker,
    updateMarker,
    clearMarkers,
    fitBounds,
    setCenter,
  };
};