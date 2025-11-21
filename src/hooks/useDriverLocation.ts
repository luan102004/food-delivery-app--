// src/hooks/useDriverLocation.ts
import { useState, useEffect, useCallback } from 'react';
import { Coordinates } from '@/types/maps';

interface DriverLocationData {
  driverId: string;
  coordinates: Coordinates;
  heading?: number;
  speed?: number;
  updatedAt: Date;
}

interface UseDriverLocationProps {
  orderId?: string;
  driverId?: string;
  enabled?: boolean;
  pollingInterval?: number;
}

export const useDriverLocation = ({
  orderId,
  driverId,
  enabled = true,
  pollingInterval = 5000, // 5 seconds
}: UseDriverLocationProps) => {
  const [location, setLocation] = useState<DriverLocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    if (!enabled || !driverId) return;

    try {
      const response = await fetch(`/api/driver/location?driverId=${driverId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch driver location');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setLocation({
          ...data.data,
          updatedAt: new Date(data.data.updatedAt),
        });
        setError(null);
      }
    } catch (err: any) {
      console.error('Error fetching driver location:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [driverId, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchLocation();

    // Set up polling
    const intervalId = setInterval(fetchLocation, pollingInterval);

    return () => clearInterval(intervalId);
  }, [fetchLocation, enabled, pollingInterval]);

  const updateLocation = async (newLocation: Partial<DriverLocationData>) => {
    if (!driverId) return;

    try {
      const response = await fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          ...newLocation,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver location');
      }

      const data = await response.json();
      if (data.success) {
        setLocation(data.data);
      }
    } catch (err: any) {
      console.error('Error updating driver location:', err);
      setError(err.message);
    }
  };

  return {
    location,
    isLoading,
    error,
    updateLocation,
    refetch: fetchLocation,
  };
};