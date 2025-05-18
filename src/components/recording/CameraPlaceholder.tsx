
import React from 'react';
import { CameraOff } from 'lucide-react';

const CameraPlaceholder: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900">
      <CameraOff className="h-12 w-12 mb-2 opacity-60" />
      <p className="text-center px-4">
        Camera access denied. Please check your browser permissions and refresh the page.
      </p>
    </div>
  );
};

export default CameraPlaceholder;
