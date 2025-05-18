
import { useGpsState } from './gps/useGpsState';

export function useGpsStatus() {
  const {
    gpsEnabled,
    gpsAccuracy,
    hasGpsError,
    gpsErrorMessage
  } = useGpsState();

  return {
    gpsEnabled,
    gpsAccuracy,
    hasGpsError,
    gpsErrorMessage
  };
}
