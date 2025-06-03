
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  granted: boolean;
  message: string;
}

export class AndroidPermissions {
  static async requestMicrophonePermission(): Promise<PermissionStatus> {
    if (!Capacitor.isNativePlatform()) {
      return {
        granted: false,
        message: 'Not on native platform'
      };
    }

    try {
      // First try using MediaDevices API which should trigger native permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      // If successful, stop the stream and return success
      stream.getTracks().forEach(track => track.stop());
      
      return {
        granted: true,
        message: 'Microphone permission granted'
      };
    } catch (error) {
      console.error('Microphone permission denied:', error);
      
      return {
        granted: false,
        message: 'Microphone permission denied. Please enable it in device settings.'
      };
    }
  }

  static async checkAllPermissions(): Promise<{
    microphone: boolean;
    camera: boolean;
    storage: boolean;
  }> {
    const permissions = {
      microphone: false,
      camera: false,
      storage: false
    };

    if (!Capacitor.isNativePlatform()) {
      return permissions;
    }

    try {
      // Check microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        permissions.microphone = true;
      } catch (e) {
        console.log('Microphone not available');
      }

      // Check camera via Capacitor
      try {
        const { Camera } = await import('@capacitor/camera');
        const result = await Camera.checkPermissions();
        permissions.camera = result.camera === 'granted';
      } catch (e) {
        console.log('Camera permission check failed');
      }

      // Storage is implicitly checked through camera permissions
      permissions.storage = permissions.camera;

    } catch (error) {
      console.error('Error checking permissions:', error);
    }

    return permissions;
  }
}
