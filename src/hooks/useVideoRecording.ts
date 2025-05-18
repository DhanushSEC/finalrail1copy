
import { useRef, useState, useCallback } from 'react';

interface UseVideoRecordingReturn {
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  recordingTime: number;
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>;
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  chunksRef: React.MutableRefObject<Blob[]>;
  startTimer: () => void;
  stopTimer: () => void;
  getRecordingDuration: () => number;
}

export function useVideoRecording(): UseVideoRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsedSeconds);
        console.log(`Recording time updated: ${elapsedSeconds} seconds`);
      }
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Don't reset startTimeRef here so we can calculate the actual duration
  }, []);

  const getRecordingDuration = useCallback(() => {
    // Calculate the actual duration based on elapsed time
    if (startTimeRef.current) {
      const actualDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      // Ensure we have at least 1 second
      const duration = Math.max(1, actualDuration);
      console.log(`getRecordingDuration returning ${duration} seconds (calculated from timer start)`);
      return duration;
    }
    
    // Fallback to recorded time if startTimeRef was not set
    const duration = Math.max(1, recordingTime);
    console.log(`getRecordingDuration returning ${duration} seconds (from recordingTime: ${recordingTime})`);
    return duration;
  }, [recordingTime]);

  return {
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
  };
}
