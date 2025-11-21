// src/components/maps/RestaurantMapPicker.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Coordinates } from '@/types/maps';
import { MapPin, Search, Navigation } from 'lucide-react';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';

interface RestaurantMapPickerProps {
  initialLocation?: Coordinates;
  onLocationSelect: (location: Coordinates & { address: string }) => void;
  className?: string;
}

export default function RestaurantMapPicker({
  initialLocation,
  onLocationSelect,
  className = '',
}: RestaurantMapPickerProps) {
  const containerId = useRef(`map-picker-${Math.random().toString(36).substr(2, 9)}`).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(
    initialLocation || null
  );
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { map, isLoaded, error, addMarker, removeMarker, setCenter, addClickListener } = useGoogleMaps({
    containerId,
    config: {
      center: initialLocation || { lat: 10.7769, lng: 106.7009 },
      zoom: 15,
    },
  });

  // Add initial marker
  useEffect(() => {
    if (!map || !initialLocation) return;

    addMarker('selected', initialLocation, {
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    // Add drag listener
    const marker = (window as any).__markers?.get('selected')?.marker;
    if (marker) {
      marker.addListener('dragend', async (event: google.maps.MapMouseEvent) => {
        const newPos = {
          lat: event.latLng!.lat(),
          lng: event.latLng!.lng(),
        };
        setSelectedLocation(newPos);
        await reverseGeocode(newPos);
      });
    }
  }, [map, initialLocation, addMarker]);

  // Add map click listener
  useEffect(() => {
    if (!map) return;

    const listener = addClickListener(async (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const newPos = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };

        setSelectedLocation(newPos);

        // Update marker
        removeMarker('selected');
        addMarker('selected', newPos, {
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        // Add drag listener to new marker
        const marker = (window as any).__markers?.get('selected')?.marker;
        if (marker) {
          marker.addListener('dragend', async (e: google.maps.MapMouseEvent) => {
            const pos = {
              lat: e.latLng!.lat(),
              lng: e.latLng!.lng(),
            };
            setSelectedLocation(pos);
            await reverseGeocode(pos);
          });
        }

        await reverseGeocode(newPos);
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [map, addMarker, removeMarker, addClickListener]);

  // Reverse geocode to get address
  const reverseGeocode = async (location: Coordinates) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();

    try {
      const result = await new Promise<string>((resolve, reject) => {
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error('Geocoding failed'));
          }
        });
      });

      setAddress(result);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress('Unknown location');
    }
  };

  // Search location
  const handleSearch = async () => {
    if (!map || !searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const geocoder = new google.maps.Geocoder();

      const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
        geocoder.geocode({ address: searchQuery }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error('Location not found'));
          }
        });
      });

      const location = result.geometry.location;
      const newPos = {
        lat: location.lat(),
        lng: location.lng(),
      };

      setSelectedLocation(newPos);
      setAddress(result.formatted_address);
      setCenter(newPos, 17);

      // Update marker
      removeMarker('selected');
      addMarker('selected', newPos, {
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      // Add drag listener
      const marker = (window as any).__markers?.get('selected')?.marker;
      if (marker) {
        marker.addListener('dragend', async (e: google.maps.MapMouseEvent) => {
          const pos = {
            lat: e.latLng!.lat(),
            lng: e.latLng!.lng(),
          };
          setSelectedLocation(pos);
          await reverseGeocode(pos);
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Location not found. Please try a different search term.');
    } finally {
      setIsSearching(false);
    }
  };

  // Get current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setSelectedLocation(newPos);
        setCenter(newPos, 17);

        // Update marker
        removeMarker('selected');
        addMarker('selected', newPos, {
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        // Add drag listener
        const marker = (window as any).__markers?.get('selected')?.marker;
        if (marker) {
          marker.addListener('dragend', async (e: google.maps.MapMouseEvent) => {
            const pos = {
              lat: e.latLng!.lat(),
              lng: e.latLng!.lng(),
            };
            setSelectedLocation(pos);
            await reverseGeocode(pos);
          });
        }

        await reverseGeocode(newPos);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location');
      }
    );
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedLocation && address) {
      onLocationSelect({
        ...selectedLocation,
        address,
      });
    }
  };

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-red-600 font-semibold">Failed to load map</p>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600 font-semibold">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSearch}
            isLoading={isSearching}
            disabled={!searchQuery.trim()}
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            onClick={handleCurrentLocation}
            title="Use current location"
          >
            <Navigation className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div id={containerId} className="w-full h-96 rounded-lg" />
        
        {/* Instructions Overlay */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold mb-1">Pick Your Location</div>
              <div className="text-gray-600">
                Click on the map or drag the marker to select location
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && address && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold mb-1">Selected Location</div>
              <div className="text-sm text-gray-600 break-words">{address}</div>
              <div className="text-xs text-gray-500 mt-1">
                Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
          >
            Confirm Location
          </Button>
        </div>
      )}
    </div>
  );
}