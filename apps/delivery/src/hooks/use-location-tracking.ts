import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { deliveryApi } from '../services/delivery.service';
import { useAuthStore } from '../stores/auth.store';

export const useLocationTracking = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightRef = useRef(false);
  const isOnline = useAuthStore((s) => s.isOnline);

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    intervalRef.current = setInterval(async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        await deliveryApi.updateLocation([loc.coords.longitude, loc.coords.latitude]);
      } catch {
        // Silently handle location errors during tracking
      } finally {
        inFlightRef.current = false;
      }
    }, 10000);
  }, []);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
      startTracking();
    } else {
      stopTracking();
    }
    return stopTracking;
  }, [isOnline, startTracking, stopTracking]);

  return { startTracking, stopTracking };
};
