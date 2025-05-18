
import { useCallback } from 'react';
import { GPSCoordinate } from '@/types';
import { ensureCompleteGPSData } from '@/lib/video/gpsUtils';

export function useGpsLogGenerator(gpsLogRef: React.MutableRefObject<GPSCoordinate[]>) {
  const generateGpsLogContent = useCallback((durationSeconds: number) => {
    const header = 'second,latitude,longitude,accuracy';
    console.log(`Generating GPS log for ${durationSeconds} second video`);
    
    // Ensure durationSeconds is at least 1
    durationSeconds = Math.max(1, durationSeconds);
    
    // Debug log before creating complete dataset
    console.log(`Raw GPS data count: ${gpsLogRef.current.length}`);
    if (gpsLogRef.current.length > 0) {
      console.log(`First GPS entry: second=${gpsLogRef.current[0].second}, lat=${gpsLogRef.current[0].latitude}, lng=${gpsLogRef.current[0].longitude}`);
      if (gpsLogRef.current.length > 1) {
        const last = gpsLogRef.current[gpsLogRef.current.length - 1];
        console.log(`Last GPS entry: second=${last.second}, lat=${last.latitude}, lng=${last.longitude}`);
      }
    }
    
    // Create a complete dataset with one entry per second for the entire video duration
    const completeGpsData = ensureCompleteGPSData(gpsLogRef.current, durationSeconds);
    
    // Create rows for all seconds of the video
    const rows: string[] = [];
    
    // If we have GPS data, create a CSV row for each second
    if (completeGpsData.length > 0) {
      console.log(`Generated ${completeGpsData.length} GPS points for ${durationSeconds} second video`);
      
      // Debug log after creating complete dataset
      console.log(`First complete GPS entry: second=${completeGpsData[0].second}, lat=${completeGpsData[0].latitude}, lng=${completeGpsData[0].longitude}`);
      if (completeGpsData.length > 1) {
        const last = completeGpsData[completeGpsData.length - 1];
        console.log(`Last complete GPS entry: second=${last.second}, lat=${last.latitude}, lng=${last.longitude}`);
      }
      
      // For each second of the video, add the corresponding GPS data to the CSV
      for (const coord of completeGpsData) {
        rows.push(`${coord.second},${coord.latitude},${coord.longitude},${coord.accuracy || 0}`);
      }
    } else {
      // If no GPS data was collected, report that in the log with zeros
      console.warn('No GPS coordinates collected, using default values (0,0) for all seconds');
      for (let second = 1; second <= durationSeconds; second++) {
        rows.push(`${second},0,0,0`);
      }
    }
    
    const content = [header, ...rows].join('\n');
    console.log(`Generated GPS log with ${rows.length} entries, one per second of video`);
    return content;
  }, [gpsLogRef]);

  return { generateGpsLogContent };
}
