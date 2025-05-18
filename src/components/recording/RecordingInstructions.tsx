
import React from 'react';

const RecordingInstructions = () => (
  <div className="w-full p-4 bg-muted rounded-lg">
    <h3 className="font-medium mb-2">Recording Instructions:</h3>
    <ul className="list-disc list-inside space-y-1 text-sm">
      <li>Ensure your camera has a clear view of the railway track</li>
      <li>Allow location permissions when prompted for GPS tracking</li>
      <li>Record at a consistent speed for best results</li>
      <li>Maximum video size: 50MB (approximately 2-5 minutes)</li>
      <li>After stopping, the video will be uploaded and queued for processing</li>
    </ul>
  </div>
);

export default RecordingInstructions;
