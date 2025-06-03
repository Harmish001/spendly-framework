// Create file: src/utils/allPermissions.ts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface PermissionResult {
    camera: string;
    photos: string;
    microphone: string;
    storage: string;
}

interface PermissionStatus {
    success: boolean;
    permissions: PermissionResult;
    message: string;
}

export const requestAllPermissions = async (): Promise<PermissionStatus> => {
    if (!Capacitor.isNativePlatform()) {
        return {
            success: false,
            permissions: { camera: 'web', photos: 'web', microphone: 'web', storage: 'web' },
            message: 'Running on web platform - no native permissions needed'
        };
    }

    try {
        console.log('🔐 Starting permission requests...');

        // 1. Request Camera & Photos permissions
        const cameraResult = await Camera.requestPermissions({
            permissions: ['camera', 'photos']
        });

        console.log('📷 Camera permissions:', cameraResult);

        // 2. Request Microphone permission via getUserMedia
        let microphoneGranted = 'denied';
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            // Stop the stream immediately
            stream.getTracks().forEach(track => track.stop());
            microphoneGranted = 'granted';
            console.log('🎤 Microphone permission granted');
        } catch (error) {
            console.log('🎤 Microphone permission denied:', error);
            microphoneGranted = 'denied';
        }

        // 3. Trigger storage permission by attempting to take a photo
        let storageGranted = 'unknown';
        try {
            // This will trigger storage permission on Android
            await Camera.getPhoto({
                quality: 1,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Photos,
                width: 1,
                height: 1
            });
            storageGranted = 'granted';
            console.log('📁 Storage permission granted');
        } catch (error) {
            console.log('📁 Storage permission may be denied:', error);
            storageGranted = 'prompt';
        }

        const finalResult: PermissionResult = {
            camera: cameraResult.camera || 'unknown',
            photos: cameraResult.photos || 'unknown',
            microphone: microphoneGranted,
            storage: storageGranted
        };

        const allGranted = Object.values(finalResult).every(
            permission => permission === 'granted'
        );

        return {
            success: allGranted,
            permissions: finalResult,
            message: allGranted
                ? '✅ All permissions granted successfully!'
                : '⚠️ Some permissions may need manual approval in settings'
        };

    } catch (error) {
        console.error('❌ Error requesting permissions:', error);

        return {
            success: false,
            permissions: { camera: 'error', photos: 'error', microphone: 'error', storage: 'error' },
            message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};