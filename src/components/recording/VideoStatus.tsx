
import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, StopCircle } from 'lucide-react';

interface VideoStatusProps {
  isRecording: boolean;
  loading: boolean;
  selectedCamera: string;
  cameraPermission: boolean | null;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
}

const VideoStatus: React.FC<VideoStatusProps> = ({
  isRecording,
  loading,
  selectedCamera,
  cameraPermission,
  error,
  startRecording,
  stopRecording,
}) => {
  return (
    <div className="flex space-x-2">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          disabled={loading || !selectedCamera || cameraPermission === false || error !== null}
          className="bg-red-600 hover:bg-red-700"
        >
          <Video className="mr-2 h-4 w-4" />
          Start Recording
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          variant="destructive"
          disabled={loading}
        >
          <StopCircle className="mr-2 h-4 w-4" />
          Stop Recording
        </Button>
      )}
    </div>
  );
};

export default VideoStatus;

