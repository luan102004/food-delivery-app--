// src/lib/googleMaps.ts - FIXED VERSION

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

if (!GOOGLE_MAPS_API_KEY && typeof window !== 'undefined') {
  console.warn("⚠️ Google Maps API key is not configured");
}

let googleLoading = false;
let googleLoaded = false;

// Load Google Maps script
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    if (document.getElementById("google-maps-script")) {
      resolve();
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('Google Maps API key is not configured'));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleLoaded = true;
      resolve();
    };
    script.onerror = (err) => {
      googleLoading = false;
      reject(new Error('Failed to load Google Maps'));
    };

    document.head.appendChild(script);
  });
}

export const initGoogleMaps = async (): Promise<typeof google> => {
  if (typeof window === 'undefined') {
    throw new Error('Google Maps can only be initialized on client side');
  }

  if (googleLoaded && window.google) {
    return window.google;
  }

  if (googleLoading) {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 5 seconds max
      let attempts = 0;
      
      const timer = setInterval(() => {
        attempts++;
        if (googleLoaded && window.google) {
          clearInterval(timer);
          resolve(window.google);
        } else if (attempts >= maxAttempts) {
          clearInterval(timer);
          reject(new Error('Timeout waiting for Google Maps'));
        }
      }, 100);
    });
  }

  googleLoading = true;

  try {
    await loadGoogleScript();
    googleLoaded = true;
    googleLoading = false;
    
    // Wait for google to be available
    if (!window.google) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return window.google;
  } catch (error) {
    googleLoading = false;
    console.error("❌ Failed to load Google Maps:", error);
    throw error;
  }
};

// Directions API
export const getDirections = async (
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  waypoints?: google.maps.DirectionsWaypoint[]
): Promise<google.maps.DirectionsResult> => {
  const google = await initGoogleMaps();
  const service = new google.maps.DirectionsService();

  return new Promise((resolve, reject) => {
    service.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === "OK" && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions failed: ${status}`));
        }
      }
    );
  });
};

// Calculate distance using Haversine formula
export const calculateDistance = (
  point1: google.maps.LatLngLiteral,
  point2: google.maps.LatLngLiteral
): number => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degree: number): number => degree * (Math.PI / 180);

// Geocode: address → lat/lng
export const geocodeAddress = async (
  address: string
): Promise<google.maps.LatLngLiteral> => {
  const google = await initGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

// Reverse geocode: lat/lng → address
export const reverseGeocode = async (
  location: google.maps.LatLngLiteral
): Promise<string> => {
  const google = await initGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        resolve(results[0].formatted_address);
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
};

// Custom Map Styles
export const mapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];