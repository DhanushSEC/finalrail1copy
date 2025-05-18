
import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoRecording } from '@/hooks/useVideoRecording';
import { useCameraSetup } from '@/hooks/useCameraSetup';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useCamera } from '@/hooks/useCamera';
import { useGPS } from '@/hooks/useGPS';

// Components
import CameraSelect from './CameraSelect';
import VideoPreview from './VideoPreview';
import RecordingInstructions from './RecordingInstructions';
import RecordingWarnings from './RecordingWarnings';
import RecordingControls from './RecordingControls';

const VideoRecorder: React.FC = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Custom hooks for logical separation
  const {
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
    timerRef,
    mediaRecorderRef,
    chunksRef,
    startTimer,
    stopTimer,
    getRecordingDuration
  } = useVideoRecording();

  const {
    cameras,
    selectedCamera,
    setSelectedCamera,
    cameraPermission,
    error: cameraError
  } = useCamera();

  const {
    gpsEnabled,
    gpsAccuracy,
    gpsLogRef,
    startGpsTracking,
    stopGpsTracking,
    generateGpsLogContent,
    hasGpsError,
    gpsErrorMessage
  } = useGPS();

  useCameraSetup({
    selectedCamera,
    videoRef,
    isRecording,
    stopRecording: () => {
      if (mediaRecorderRef.current && isRecording) {
        console.log('Stopping recording from cameraSetup');
        mediaRecorderRef.current.stop();
      }
    },
  });

  const { uploadRecording } = useVideoUpload({
    user,
    gpsLogRef,
    stopGpsTracking,
    generateGpsLogContent,
    hasGpsError,
    gpsErrorMessage
  });

  return (
    <div className="flex flex-col items-center space-y-6 max-w-3xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="mr-2 h-6 w-6" />
            Video Recording
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecordingWarnings 
            cameraError={cameraError}
            isRecording={isRecording}
            hasGpsError={hasGpsError}
            gpsErrorMessage={gpsErrorMessage}
          />

          <div className="space-y-4">
            <CameraSelect
              cameras={cameras}
              selectedCamera={selectedCamera}
              setSelectedCamera={setSelectedCamera}
              disabled={isRecording || loading}
            />

            <VideoPreview
              videoRef={videoRef}
              isRecording={isRecording}
              recordingTime={recordingTime}
              gpsEnabled={gpsEnabled}
              gpsAccuracy={gpsAccuracy}
              cameraPermission={cameraPermission}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {isRecording
              ? 'Recording in progress...'
              : 'Ready to record'}
          </div>
          <RecordingControls
            videoRef={videoRef}
            isRecording={isRecording}
            loading={loading}
            selectedCamera={selectedCamera}
            cameraPermission={cameraPermission}
            cameraError={cameraError}
            mediaRecorderRef={mediaRecorderRef}
            chunksRef={chunksRef}
            startGpsTracking={startGpsTracking}
            startTimer={startTimer}
            setIsRecording={setIsRecording}
            stopGpsTracking={stopGpsTracking}
            stopTimer={stopTimer}
            uploadRecording={uploadRecording}
            setLoading={setLoading}
            setRecordingTime={setRecordingTime}
            getRecordingDuration={getRecordingDuration}
          />
        </CardFooter>
      </Card>

      <RecordingInstructions />
    </div>
  );
};

export default VideoRecorder;
