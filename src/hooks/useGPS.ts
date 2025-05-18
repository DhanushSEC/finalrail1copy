
import { useRef } from 'react';
import { GPSCoordinate } from '@/types';
import { useGpsState } from './gps/useGpsState';
import { useGpsTracking } from './gps/useGpsTracking';
import { useGpsLogGenerator } from './gps/useGpsLogGenerator';

interface UseGPSReturn {
  gpsEnabled: boolean;
  gpsAccuracy: number | null;
  gpsLogRef: React.MutableRefObject<GPSCoordinate[]>;
  startGpsTracking: () => boolean;
  stopGpsTracking: () => void;
  generateGpsLogContent: (durationSeconds: number) => string;
  hasGpsError: boolean;
  gpsErrorMessage: string | null;
}

export const useGPS = (): UseGPSReturn => {
  // State management
  const {
    gpsEnabled,
    setGpsEnabled,
    gpsAccuracy,
    setGpsAccuracy,
    hasGpsError,
    setHasGpsError,
    gpsErrorMessage,
    setGpsErrorMessage
  } = useGpsState();
  
  // GPS data storage
  const gpsLogRef = useRef<GPSCoordinate[]>([]);
  
  // GPS tracking functionality
  const { startGpsTracking, stopGpsTracking } = useGpsTracking({
    gpsLogRef,
    setGpsEnabled,
    setGpsAccuracy,
    setHasGpsError,
    setGpsErrorMessage,
    hasGpsError
  });
  
  // GPS log generation
  const { generateGpsLogContent } = useGpsLogGenerator(gpsLogRef);

  return {
    gpsEnabled,
    gpsAccuracy,
    gpsLogRef,
    startGpsTracking,
    stopGpsTracking,
    generateGpsLogContent,
    hasGpsError,
    gpsErrorMessage
  };
};
