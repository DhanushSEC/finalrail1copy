
import { useRef, useCallback } from 'react';
import { GPSCoordinate } from '@/types';

interface UseGpsTrackingParams {
  gpsLogRef: React.MutableRefObject<GPSCoordinate[]>;
  setGpsEnabled: (value: boolean) => void;
  setGpsAccuracy: (value: number | null) => void;
  setHasGpsError: (value: boolean) => void; 
  setGpsErrorMessage: (value: string | null) => void;
  hasGpsError: boolean;
}

export function useGpsTracking({
  gpsLogRef,
  setGpsEnabled,
  setGpsAccuracy,
  setHasGpsError,
  setGpsErrorMessage,
  hasGpsError
}: UseGpsTrackingParams) {
  const gpsWatchIdRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);

  const startGpsTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setHasGpsError(true);
      setGpsErrorMessage('Geolocation is not supported by your browser');
      console.error('Geolocation is not supported by your browser');
      return false;
    }
    
    // Clear previous GPS data and errors
    gpsLogRef.current = [];
    recordingStartTimeRef.current = Date.now();
    setHasGpsError(false);
    setGpsErrorMessage(null);
    
    console.log('Starting GPS tracking');
    
    try {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log(`Initial GPS position: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          
          gpsLogRef.current.push({
            second: 0,
            latitude,
            longitude,
            accuracy
          });
          
          setGpsAccuracy(accuracy);
          setGpsEnabled(true);
        },
        (error) => {
          console.error('Initial GPS error:', error);
          setHasGpsError(true);
          
          // Set specific error message based on error code
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setGpsErrorMessage('GPS permission denied');
              break;
            case error.POSITION_UNAVAILABLE:
              setGpsErrorMessage('GPS position unavailable');
              break;
            case error.TIMEOUT:
              setGpsErrorMessage('GPS request timed out');
              break;
            default:
              setGpsErrorMessage('Unknown GPS error');
          }
          
          // Continue even if initial position fails
          setGpsEnabled(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, 
          maximumAge: 0
        }
      );
      
      // Start watching position with higher frequency for better tracking
      gpsWatchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          if (!recordingStartTimeRef.current) {
            recordingStartTimeRef.current = Date.now();
          }
          
          const second = Math.floor(
            (Date.now() - recordingStartTimeRef.current) / 1000
          );
          
          console.log(`GPS update at ${second}s: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          
          // Store this GPS coordinate with the correct second
          gpsLogRef.current.push({
            second,
            latitude,
            longitude,
            accuracy
          });
          
          setGpsAccuracy(accuracy);
          setGpsEnabled(true);
          
          // If we had an error before but now we're getting data, clear the error
          if (hasGpsError) {
            setHasGpsError(false);
            setGpsErrorMessage(null);
          }
        },
        (error) => {
          console.error('GPS watch error:', error);
          setHasGpsError(true);
          
          // Set specific error message based on error code
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setGpsErrorMessage('GPS permission denied');
              break;
            case error.POSITION_UNAVAILABLE:
              setGpsErrorMessage('GPS position unavailable');
              break;
            case error.TIMEOUT:
              setGpsErrorMessage('GPS request timed out');
              break;
            default:
              setGpsErrorMessage('Unknown GPS error');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000, // Lower timeout for faster updates
          maximumAge: 0
        }
      );
      
      return true;
    } catch (e) {
      console.error('Error setting up GPS tracking:', e);
      setHasGpsError(true);
      setGpsErrorMessage('Failed to start GPS tracking');
      return false;
    }
  }, [gpsLogRef, setGpsEnabled, setGpsAccuracy, setHasGpsError, setGpsErrorMessage, hasGpsError]);

  const stopGpsTracking = useCallback(() => {
    if (gpsWatchIdRef.current !== null) {
      console.log('Stopping GPS tracking');
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    recordingStartTimeRef.current = null;
    console.log(`Collected ${gpsLogRef.current.length} GPS coordinates`);
  }, [gpsLogRef]);

  return {
    startGpsTracking,
    stopGpsTracking
  };
}
