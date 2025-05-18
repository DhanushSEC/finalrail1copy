
import React from 'react';

interface GpsStatusProps {
  gpsEnabled: boolean;
  gpsAccuracy: number | null;
}

const GpsStatus: React.FC<GpsStatusProps> = ({ gpsEnabled, gpsAccuracy }) => {
  if (!gpsEnabled) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/70 text-white px-3 py-1 rounded-full">
      <span className="text-xs">
        GPS: {gpsAccuracy !== null ? `±${Math.round(gpsAccuracy)}m` : 'Connecting...'}
      </span>
    </div>
  );
};

export default GpsStatus;
