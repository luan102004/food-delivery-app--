// src/utils/mapHelpers.ts
import { Coordinates } from '@/types/maps';

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.ceil(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const calculateBounds = (
  points: Coordinates[]
): google.maps.LatLngBoundsLiteral => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  points.forEach((point) => {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
  });

  return {
    north: maxLat,
    south: minLat,
    east: maxLng,
    west: minLng,
  };
};

export const getMarkerIcon = (
  type: 'restaurant' | 'driver' | 'customer',
  rotation?: number
): google.maps.Icon | google.maps.Symbol => {
  const colors = {
    restaurant: '#3b82f6', // blue
    driver: '#22c55e', // green
    customer: '#f97316', // orange
  };

  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: colors[type],
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    scale: 10,
    rotation: rotation || 0,
  };
};

export const createDriverIcon = (
  rotation: number = 0
): google.maps.Symbol => {
  return {
    path: 'M 0,-2 L 1,2 L 0,1.5 L -1,2 Z', // Car shape
    fillColor: '#22c55e',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 8,
    rotation: rotation,
    anchor: new google.maps.Point(0, 0),
  };
};

// src/utils/mapHelpers.ts - ADD THESE FUNCTIONS

/**
 * Smooth animation for marker movement
 */
export const animateMarker = (
  marker: google.maps.Marker,
  newPosition: google.maps.LatLngLiteral,
  duration: number = 1000
) => {
  const startPosition = marker.getPosition();
  if (!startPosition) return;

  const startLat = startPosition.lat();
  const startLng = startPosition.lng();
  const endLat = newPosition.lat;
  const endLng = newPosition.lng;

  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-in-out)
    const eased = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;

    const lat = startLat + (endLat - startLat) * eased;
    const lng = startLng + (endLng - startLng) * eased;

    marker.setPosition({ lat, lng });

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  animate();
};

/**
 * Calculate heading between two points
 */
export const calculateHeading = (
  from: Coordinates,
  to: Coordinates
): number => {
  const dLon = to.lng - from.lng;
  const y = Math.sin(dLon) * Math.cos(to.lat);
  const x =
    Math.cos(from.lat) * Math.sin(to.lat) -
    Math.sin(from.lat) * Math.cos(to.lat) * Math.cos(dLon);
  
  const heading = Math.atan2(y, x);
  return ((heading * 180) / Math.PI + 360) % 360;
};

/**
 * Create custom marker icon
 */
export const createCustomIcon = (
  type: 'restaurant' | 'driver' | 'customer' | 'user',
  options?: {
    color?: string;
    scale?: number;
    rotation?: number;
  }
): google.maps.Symbol => {
  const colors = {
    restaurant: '#3b82f6',
    driver: '#22c55e',
    customer: '#f97316',
    user: '#f97316',
  };

  const color = options?.color || colors[type];
  const scale = options?.scale || 10;
  const rotation = options?.rotation || 0;

  if (type === 'driver') {
    return {
      path: 'M 0,-2 L 1,2 L 0,1.5 L -1,2 Z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale,
      rotation,
      anchor: new google.maps.Point(0, 0),
    };
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    scale,
  };
};

/**
 * Check if point is within radius
 */
export const isWithinRadius = (
  point1: Coordinates,
  point2: Coordinates,
  radiusInMeters: number
): boolean => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance <= radiusInMeters;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};