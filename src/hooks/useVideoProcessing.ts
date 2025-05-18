
import { useState, useCallback } from 'react';
import { extractFrames } from '@/lib/video/extractFrames';
import { saveVideoFrames } from '@/lib/video/frameStorage';
import { VideoFrame, GPSCoordinate } from '@/types';
import { matchFrameToGPS } from '@/lib/video/gpsUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseVideoProcessingReturn {
  extractingFrames: boolean;
  extractFramesFromVideo: (videoBlob: Blob, fps?: number, gpsCoordinates?: GPSCoordinate[]) => Promise<VideoFrame[]>;
  error: string | null;
}

export function useVideoProcessing(): UseVideoProcessingReturn {
  const [extractingFrames, setExtractingFrames] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const extractFramesFromVideo = useCallback(async (
    videoBlob: Blob, 
    fps: number = 1, 
    gpsCoordinates?: GPSCoordinate[]
  ): Promise<VideoFrame[]> => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to process videos',
        variant: 'destructive'
      });
      return [];
    }

    try {
      setExtractingFrames(true);
      setError(null);
      
      const frameBlobs = await extractFrames(videoBlob, fps);
      
      // Convert the raw blobs to VideoFrame objects with timestamps
      const videoFrames: VideoFrame[] = frameBlobs.map((blob, index) => {
        const timestamp = index / fps;
        
        // Match with GPS coordinates if provided
        let gpsCoordinate = undefined;
        if (gpsCoordinates && gpsCoordinates.length > 0) {
          gpsCoordinate = matchFrameToGPS(Math.floor(timestamp), gpsCoordinates);
        }
        
        return {
          blob,
          index,
          timestamp,
          gpsCoordinate
        };
      });
      
      // Optional: Save frames to storage (this could be moved to a separate step if needed)
      await saveVideoFrames(
        // You'll need to pass the actual video ID from your upload process
        'temporary-video-id', 
        user.id, 
        videoFrames
      );
      
      return videoFrames;
    } catch (err) {
      console.error('Error during video processing:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during video processing';
      setError(errorMessage);
      
      toast({
        title: 'Video Processing Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return [];
    } finally {
      setExtractingFrames(false);
    }
  }, [user]);

  return {
    extractingFrames,
    extractFramesFromVideo,
    error
  };
}
