import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../stores/location.store';

export const useLocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { latitude, longitude, address, setLocation } = useLocationStore();

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const addr = geo
        ? [geo.street, geo.city, geo.region].filter(Boolean).join(', ')
        : 'Current Location';

      setLocation(loc.coords.latitude, loc.coords.longitude, addr);
    } catch {
      setError('Failed to get location');
    } finally {
      setLoading(false);
    }
  }, [setLocation]);

  return { latitude, longitude, address, loading, error, requestLocation };
};
