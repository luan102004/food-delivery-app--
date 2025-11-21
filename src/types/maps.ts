// src/types/maps.ts
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapMarkerProps {
  position: Coordinates;
  type: 'restaurant' | 'driver' | 'customer';
  title?: string;
  info?: string;
  icon?: string;
  rotation?: number;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  steps?: google.maps.DirectionsStep[];
}

export interface MapConfig {
  center: Coordinates;
  zoom: number;
  styles?: google.maps.MapTypeStyle[];
  gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
  zoomControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
}

export interface LiveTrackingData {
  driverLocation: Coordinates;
  restaurantLocation: Coordinates;
  deliveryLocation: Coordinates;
  route?: google.maps.DirectionsResult;
  eta?: string;
  distance?: string;
}