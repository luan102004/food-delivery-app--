// src/lib/googleMaps.ts
import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️ Google Maps API key is not configured');
}

let loaderInstance: Loader | null = null;
let isLoading = false;
let isLoaded = false;

export const initGoogleMaps = async (): Promise<typeof google> => {
  // Return immediately if already loaded
  if (isLoaded && window.google) {
    return window.google;
  }

  // Wait if currently loading
  if (isLoading) {
    return new Promise((resolve) => {
      const checkLoaded = setInterval(() => {
        if (isLoaded && window.google) {
          clearInterval(checkLoaded);
          resolve(window.google);
        }
      }, 100);
    });
  }

  isLoading = true;

  try {
    if (!loaderInstance) {
      loaderInstance = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry', 'drawing'],
      });
    }

    await loaderInstance.load();
    isLoaded = true;
    isLoading = false;
    return window.google;
  } catch (error) {
    isLoading = false;
    console.error('Failed to load Google Maps:', error);
    throw error;
  }
};

export const getDirections = async (
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  waypoints?: google.maps.DirectionsWaypoint[]
): Promise<google.maps.DirectionsResult> => {
  const google = await initGoogleMaps();
  const directionsService = new google.maps.DirectionsService();

  return new Promise((resolve, reject) => {
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
          resolve(result);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      }
    );
  });
};

export const calculateDistance = (
  point1: google.maps.LatLngLiteral,
  point2: google.maps.LatLngLiteral
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const geocodeAddress = async (
  address: string
): Promise<google.maps.LatLngLiteral> => {
  const google = await initGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

export const reverseGeocode = async (
  location: google.maps.LatLngLiteral
): Promise<string> => {
  const google = await initGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
};

// Custom map styles
export const mapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];