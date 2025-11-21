// src/hooks/useGoogleMaps.ts - Enhanced Version
import { useState, useEffect, useRef, useCallback } from 'react';
import { initGoogleMaps, mapStyles } from '@/lib/googleMaps';
import { MapConfig, Coordinates } from '@/types/maps';

interface UseGoogleMapsProps {
  containerId: string;
  config?: Partial<MapConfig>;
  onMapReady?: (map: google.maps.Map) => void;
}

interface MarkerData {
  marker: google.maps.Marker;
  infoWindow?: google.maps.InfoWindow;
}

export const useGoogleMaps = ({ containerId, config, onMapReady }: UseGoogleMapsProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const markersRef = useRef<Map<string, MarkerData>>(new Map());
  const polylinesRef = useRef<Map<string, google.maps.Polyline>>(new Map());
  const circlesRef = useRef<Map<string, google.maps.Circle>>(new Map());
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const defaultConfig: MapConfig = {
    center: { lat: 10.7769, lng: 106.7009 }, // Ho Chi Minh City
    zoom: 13,
    styles: mapStyles,
    gestureHandling: 'greedy',
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeControl: false,
    ...config,
  };

  // Initialize map
  useEffect(() => {
    if (isInitializing) return;

    const loadMap = async () => {
      setIsInitializing(true);
      try {
        await initGoogleMaps();
        
        const container = document.getElementById(containerId);
        if (!container) {
          throw new Error(`Container with id "${containerId}" not found`);
        }

        const mapInstance = new google.maps.Map(container, defaultConfig);
        setMap(mapInstance);
        setIsLoaded(true);

        // Store markers reference globally for access
        (window as any).__markers = markersRef.current;

        if (onMapReady) {
          onMapReady(mapInstance);
        }

        console.log('✅ Google Maps initialized successfully');
      } catch (err: any) {
        console.error('Failed to load Google Maps:', err);
        setError(err.message || 'Failed to load map');
      } finally {
        setIsInitializing(false);
      }
    };

    loadMap();
  }, [containerId, isInitializing]);

  // Add marker with optional info window
  const addMarker = useCallback((
    id: string,
    position: Coordinates,
    options?: google.maps.MarkerOptions & { 
      infoContent?: string;
      onClick?: () => void;
    }
  ): google.maps.Marker | null => {
    if (!map) return null;

    // Remove existing marker with same id
    removeMarker(id);

    const { infoContent, onClick, ...markerOptions } = options || {};

    const marker = new google.maps.Marker({
      position,
      map,
      ...markerOptions,
    });

    const markerData: MarkerData = { marker };

    // Add info window if content provided
    if (infoContent) {
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        // Close all other info windows
        markersRef.current.forEach(data => {
          if (data.infoWindow) {
            data.infoWindow.close();
          }
        });
        infoWindow.open(map, marker);
      });

      markerData.infoWindow = infoWindow;
    }

    // Add custom click handler
    if (onClick) {
      marker.addListener('click', onClick);
    }

    markersRef.current.set(id, markerData);
    return marker;
  }, [map]);

  // Remove marker
  const removeMarker = useCallback((id: string) => {
    const markerData = markersRef.current.get(id);
    if (markerData) {
      if (markerData.infoWindow) {
        markerData.infoWindow.close();
      }
      markerData.marker.setMap(null);
      markersRef.current.delete(id);
    }
  }, []);

  // Update marker position with animation
  const updateMarker = useCallback((
    id: string,
    position: Coordinates,
    options?: google.maps.MarkerOptions
  ) => {
    const markerData = markersRef.current.get(id);
    if (markerData) {
      markerData.marker.setPosition(position);
      if (options) {
        markerData.marker.setOptions(options);
      }
    } else {
      addMarker(id, position, options);
    }
  }, [addMarker]);

  // Get marker by id
  const getMarker = useCallback((id: string): google.maps.Marker | null => {
    return markersRef.current.get(id)?.marker || null;
  }, []);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((markerData) => {
      if (markerData.infoWindow) {
        markerData.infoWindow.close();
      }
      markerData.marker.setMap(null);
    });
    markersRef.current.clear();
  }, []);

  // Add polyline (route)
  const addPolyline = useCallback((
    id: string,
    path: Coordinates[],
    options?: google.maps.PolylineOptions
  ): google.maps.Polyline | null => {
    if (!map) return null;

    removePolyline(id);

    const polyline = new google.maps.Polyline({
      path,
      map,
      strokeColor: '#22c55e',
      strokeWeight: 5,
      strokeOpacity: 0.8,
      ...options,
    });

    polylinesRef.current.set(id, polyline);
    return polyline;
  }, [map]);

  // Remove polyline
  const removePolyline = useCallback((id: string) => {
    const polyline = polylinesRef.current.get(id);
    if (polyline) {
      polyline.setMap(null);
      polylinesRef.current.delete(id);
    }
  }, []);

  // Clear all polylines
  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    polylinesRef.current.clear();
  }, []);

  // Add circle (radius visualization)
  const addCircle = useCallback((
    id: string,
    center: Coordinates,
    radius: number,
    options?: google.maps.CircleOptions
  ): google.maps.Circle | null => {
    if (!map) return null;

    removeCircle(id);

    const circle = new google.maps.Circle({
      center,
      radius,
      map,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      ...options,
    });

    circlesRef.current.set(id, circle);
    return circle;
  }, [map]);

  // Remove circle
  const removeCircle = useCallback((id: string) => {
    const circle = circlesRef.current.get(id);
    if (circle) {
      circle.setMap(null);
      circlesRef.current.delete(id);
    }
  }, []);

  // Fit bounds to show all points
  const fitBounds = useCallback((points: Coordinates[], padding?: google.maps.Padding) => {
    if (!map || points.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point));
    
    map.fitBounds(bounds, padding || {
      top: 100,
      right: 50,
      bottom: 100,
      left: 50,
    });
  }, [map]);

  // Set center and zoom
  const setCenter = useCallback((center: Coordinates, zoom?: number) => {
    if (!map) return;
    map.setCenter(center);
    if (zoom) map.setZoom(zoom);
  }, [map]);

  // Pan to location
  const panTo = useCallback((location: Coordinates) => {
    if (!map) return;
    map.panTo(location);
  }, [map]);

  // Calculate and display route
  const showRoute = useCallback(async (
    origin: Coordinates,
    destination: Coordinates,
    options?: {
      waypoints?: google.maps.DirectionsWaypoint[];
      travelMode?: google.maps.TravelMode;
      onRouteCalculated?: (result: google.maps.DirectionsResult) => void;
    }
  ) => {
    if (!map) return null;

    const directionsService = new google.maps.DirectionsService();

    // Clear existing renderer
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    // Create new renderer
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#22c55e',
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });

    try {
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(
          {
            origin,
            destination,
            waypoints: options?.waypoints || [],
            travelMode: options?.travelMode || google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
          },
          (result, status) => {
            if (status === 'OK' && result) {
              resolve(result);
            } else {
              reject(new Error(`Directions request failed: ${status}`));
            }
          }
        );
      });

      directionsRendererRef.current?.setDirections(result);

      if (options?.onRouteCalculated) {
        options.onRouteCalculated(result);
      }

      return result;
    } catch (error) {
      console.error('Failed to calculate route:', error);
      return null;
    }
  }, [map]);

  // Clear route
  const clearRoute = useCallback(() => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
  }, []);

  // Add click listener to map
  const addClickListener = useCallback((
    callback: (event: google.maps.MapMouseEvent) => void
  ) => {
    if (!map) return null;
    return map.addListener('click', callback);
  }, [map]);

  // Get current bounds
  const getBounds = useCallback((): google.maps.LatLngBounds | null => {
    return map?.getBounds() || null;
  }, [map]);

  // Get current center
  const getCenter = useCallback((): Coordinates | null => {
    const center = map?.getCenter();
    return center ? { lat: center.lat(), lng: center.lng() } : null;
  }, [map]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
      clearPolylines();
      clearRoute();
      circlesRef.current.forEach(circle => circle.setMap(null));
      circlesRef.current.clear();
    };
  }, [clearMarkers, clearPolylines, clearRoute]);

  return {
    map,
    isLoaded,
    error,
    
    // Marker methods
    addMarker,
    removeMarker,
    updateMarker,
    getMarker,
    clearMarkers,
    
    // Polyline methods
    addPolyline,
    removePolyline,
    clearPolylines,
    
    // Circle methods
    addCircle,
    removeCircle,
    
    // Route methods
    showRoute,
    clearRoute,
    
    // Map control methods
    fitBounds,
    setCenter,
    panTo,
    getBounds,
    getCenter,
    addClickListener,
  };
};