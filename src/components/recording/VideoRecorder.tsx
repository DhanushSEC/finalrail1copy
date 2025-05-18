import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'react-native-camera';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoRecording } from '@/hooks/useVideoRecording';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useGPS } from '@/hooks/useGPS';
import UsbManager from 'react-native-usb';
import DeviceInfo from 'react-native-device-info';

const VideoRecorder: React.FC = () => {
  const { user } = useAuth();
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
    gpsEnabled,
    gpsAccuracy,
    gpsLogRef,
    startGpsTracking,
    stopGpsTracking,
    generateGpsLogContent,
    hasGpsError,
    gpsErrorMessage
  } = useGPS();

  const { uploadRecording } = useVideoUpload({
    user,
    gpsLogRef,
    stopGpsTracking,
    generateGpsLogContent,
    hasGpsError,
    gpsErrorMessage
  });

  useEffect(() => {
    checkPermissions();
    scanForCameras();
  }, []);

  const checkPermissions = async () => {
    const cameraPermission = await Camera.requestPermissions();
    setHasPermission(cameraPermission === 'authorized');
  };

  const scanForCameras = async () => {
    // Get built-in cameras
    const devices = await Camera.getAvailableCameras();
    
    // Scan for USB cameras
    UsbManager.getDeviceList().then(usbDevices => {
      const usbCameras = usbDevices.filter(device => {
        // USB device class for imaging devices is 0x06
        return device.getDeviceClass() === 6;
      });

      const allCameras = [
        ...devices.map(device => ({
          id: device.id,
          name: device.name,
          type: 'built-in'
        })),
        ...usbCameras.map(device => ({
          id: device.deviceId,
          name: `USB Camera (${device.getProductName()})`,
          type: 'usb'
        }))
      ];

      setCameras(allCameras);
      if (allCameras.length > 0) {
        setSelectedCamera(allCameras[0]);
      }
    });
  };

  const startRecording = async () => {
    if (!selectedCamera) {
      alert('Please select a camera');
      return;
    }

    const gpsStarted = startGpsTracking();
    if (!gpsStarted) {
      console.warn('GPS tracking could not be started');
    }

    try {
      setIsRecording(true);
      startTimer();
      await cameraRef.current.startRecording({
        quality: Camera.Constants.VideoQuality['720p'],
        maxDuration: 300, // 5 minutes max
        maxFileSize: 50 * 1024 * 1024, // 50MB limit
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      stopGpsTracking();
      setIsRecording(false);
      stopTimer();
    }
  };

  const stopRecording = async () => {
    try {
      const data = await cameraRef.current.stopRecording();
      stopTimer();
      await uploadRecording(
        [data],
        setLoading,
        setIsRecording,
        setRecordingTime,
        getRecordingDuration()
      );
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.preview}
        type={selectedCamera?.type === 'built-in' ? Camera.Constants.Type.back : Camera.Constants.Type.external}
        device={selectedCamera}
      />
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button}
          onPress={scanForCameras}
        >
          <Text style={styles.buttonText}>Scan for Cameras</Text>
        </TouchableOpacity>

        {cameras.length > 0 && (
          <View style={styles.cameraSelect}>
            {cameras.map(camera => (
              <TouchableOpacity
                key={camera.id}
                style={[
                  styles.cameraOption,
                  selectedCamera?.id === camera.id && styles.selectedCamera
                ]}
                onPress={() => setSelectedCamera(camera)}
              >
                <Text style={styles.cameraOptionText}>{camera.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={loading || !selectedCamera}
        >
          <Text style={styles.buttonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>

        {isRecording && (
          <Text style={styles.timer}>
            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
          </Text>
        )}

        {gpsEnabled && (
          <Text style={styles.gpsStatus}>
            GPS: {gpsAccuracy !== null ? `±${Math.round(gpsAccuracy)}m` : 'Connecting...'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  recordButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  cameraSelect: {
    marginBottom: 20,
  },
  cameraOption: {
    backgroundColor: '#424242',
    padding: 10,
    marginBottom: 5,
    borderRadius: 4,
  },
  selectedCamera: {
    backgroundColor: '#1976D2',
  },
  cameraOptionText: {
    color: '#fff',
  },
  timer: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  gpsStatus: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 10,
  },
});

export default VideoRecorder;