
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface RecordingWarningsProps {
  cameraError: string | null;
  isRecording: boolean;
  hasGpsError: boolean;
  gpsErrorMessage: string | null;
}

const RecordingWarnings: React.FC<RecordingWarningsProps> = ({
  cameraError,
  isRecording,
  hasGpsError,
  gpsErrorMessage,
}) => {
  if (!cameraError && (!hasGpsError || isRecording)) {
    return null;
  }

  return (
    <>
      {cameraError && (
        <div className="mb-4 flex items-center bg-red-100 text-red-700 p-2 rounded">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{cameraError}</span>
        </div>
      )}

      {!isRecording && hasGpsError && (
        <div className="mb-4 flex items-center bg-yellow-100 text-yellow-700 p-2 rounded">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>GPS Warning: {gpsErrorMessage || 'Issues with GPS tracking'}. Your video may have limited or no location data.</span>
        </div>
      )}
    </>
  );
};

export default RecordingWarnings;
