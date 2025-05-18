
import { useState } from 'react';

export function useGpsState() {
  const [gpsEnabled, setGpsEnabled] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [hasGpsError, setHasGpsError] = useState<boolean>(false);
  const [gpsErrorMessage, setGpsErrorMessage] = useState<string | null>(null);
  
  return {
    gpsEnabled,
    setGpsEnabled,
    gpsAccuracy,
    setGpsAccuracy,
    hasGpsError, 
    setHasGpsError,
    gpsErrorMessage,
    setGpsErrorMessage
  };
}
