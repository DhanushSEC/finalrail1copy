
import { useToast } from '@/hooks/use-toast';
import { uploadFile, createVideoRecord } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { GPSCoordinate } from '@/types';
import { MutableRefObject, useCallback } from 'react';

interface UseVideoUploadParams {
  user: SupabaseUser | null;
  gpsLogRef: MutableRefObject<GPSCoordinate[]>;
  stopGpsTracking: () => void;
  generateGpsLogContent: (durationSeconds: number) => string;
  hasGpsError?: boolean;
  gpsErrorMessage?: string | null;
}

export function useVideoUpload({ 
  user, 
  gpsLogRef, 
  stopGpsTracking, 
  generateGpsLogContent,
  hasGpsError,
  gpsErrorMessage 
}: UseVideoUploadParams) {
  const { toast } = useToast();

  const uploadRecording = useCallback(async (
    chunks: Blob[],
    setLoading: (v: boolean) => void,
    setIsRecording: (v: boolean) => void,
    setRecordingTime: (v: number) => void,
    recordingDuration: number
  ) => {
    try {
      setLoading(true);
      console.log(`Starting upload with ${chunks.length} chunks`);

      const videoBlob = new Blob(chunks, { type: 'video/webm;codecs=vp9,opus' });
      console.log(`Video recording completed: ${videoBlob.size} bytes, duration: ${recordingDuration} seconds`);

      if (videoBlob.size === 0) {
        toast({
          title: 'Error',
          description: 'Video recording is empty. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (videoBlob.size > 50 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Video size exceeds 50MB limit. Please record a shorter video.',
          variant: 'destructive',
        });
        return;
      }

      if (!user) throw new Error('User not authenticated');
      
      // Make sure we're using the actual duration passed from the recording hook
      // and it's at least 1 second
      const finalDuration = Math.max(1, recordingDuration);
      console.log(`Final video duration for GPS log: ${finalDuration} seconds`);
      
      // Debug log about GPS data being used
      console.log(`GPS data before generating log: ${gpsLogRef.current.length} points`);
      if (gpsLogRef.current.length > 0) {
        console.log(`First GPS point: second=${gpsLogRef.current[0].second}, lat=${gpsLogRef.current[0].latitude}, lng=${gpsLogRef.current[0].longitude}`);
        if (gpsLogRef.current.length > 1) {
          const last = gpsLogRef.current[gpsLogRef.current.length - 1];
          console.log(`Last GPS point: second=${last.second}, lat=${last.latitude}, lng=${last.longitude}`);
        }
      }
      
      // Generate GPS log content for each second of the video duration
      const gpsLogContent = generateGpsLogContent(finalDuration);
      console.log(`GPS log content length: ${gpsLogContent.length} characters`);
      console.log(`GPS log preview: ${gpsLogContent.substring(0, 200)}${gpsLogContent.length > 200 ? '...' : ''}`);
      
      // Check if we had GPS errors but still generated GPS data
      if (hasGpsError && gpsLogRef.current.length > 0) {
        toast({
          title: 'GPS Warning',
          description: `GPS had some issues: ${gpsErrorMessage || 'Unknown error'}. Limited location data included.`,
          variant: 'default',
        });
      }
      // If we had GPS errors and no GPS data was collected
      else if (hasGpsError && gpsLogRef.current.length === 0) {
        toast({
          title: 'GPS Error',
          description: `No GPS data collected: ${gpsErrorMessage || 'Unknown error'}. Video will not have location data.`,
          variant: 'default',
        });
      }
      
      const gpsLogBlob = new Blob([gpsLogContent], { type: 'text/csv' });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const videoFileName = `${user.id}/${timestamp}/video.webm`;
      const gpsLogFileName = `${user.id}/${timestamp}/gps_by_second.csv`;

      const videoFile = new File([videoBlob], 'video.webm');
      const gpsLogFile = new File([gpsLogBlob], 'gps_by_second.csv');
      
      console.log('Uploading video file:', videoFileName);
      const videoUrl = await uploadFile('videos', videoFileName, videoFile);
      console.log('Video uploaded successfully');
      
      console.log('Uploading GPS log file:', gpsLogFileName);
      const gpsLogUrl = await uploadFile('gps-logs', gpsLogFileName, gpsLogFile);
      console.log('GPS log uploaded successfully');

      console.log('Creating video record in database');
      await createVideoRecord({
        user_id: user.id,
        video_url: videoFileName,
        gps_log_url: gpsLogFileName,
        status: 'Queued'
      });

      toast({
        title: 'Recording saved',
        description: 'Your video has been uploaded and queued for processing.',
      });
    } catch (err) {
      console.error('Error saving recording:', err);
      toast({
        title: 'Recording Error',
        description: 'Failed to save your recording. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRecording(false);
      setRecordingTime(0);
      stopGpsTracking();
      setLoading(false);
    }
  }, [user, generateGpsLogContent, stopGpsTracking, toast, hasGpsError, gpsErrorMessage, gpsLogRef]);

  return { uploadRecording };
}
