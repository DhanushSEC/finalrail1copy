
import React from 'react';

interface RecordingTimerProps {
  isRecording: boolean;
  recordingTime: number;
}

const RecordingTimer: React.FC<RecordingTimerProps> = ({ isRecording, recordingTime }) => {
  if (!isRecording) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/70 text-white px-3 py-1 rounded-full">
      <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
      <span>{formatTime(recordingTime)}</span>
    </div>
  );
};

export default RecordingTimer;
