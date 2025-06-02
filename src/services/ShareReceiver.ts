
import { Capacitor } from '@capacitor/core';

export interface SharedImageData {
  uri: string;
  type: string;
  name?: string;
}

export class ShareReceiver {
  static async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Share receiver only works on native platforms');
      return;
    }

    try {
      // Dynamic import to avoid build errors on web
      const { App } = await import('@capacitor/app');
      
      // Listen for app URL open events (when shared content is received)
      App.addListener('appUrlOpen', async (event) => {
        console.log('App opened with URL:', event.url);
        await this.handleSharedContent(event.url);
      });

      // Listen for app state changes
      App.addListener('appStateChange', async (state) => {
        if (state.isActive) {
          // Check if app was opened with shared content
          await this.checkForSharedContent();
        }
      });

      // Check for shared content on app launch
      await this.checkForSharedContent();
    } catch (error) {
      console.error('Error initializing ShareReceiver:', error);
    }
  }

  static async handleSharedContent(url: string) {
    try {
      // Parse the shared content URL
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const sharedType = urlParams.get('type');
      const sharedUri = urlParams.get('uri');

      if (sharedType === 'image' && sharedUri) {
        const imageData: SharedImageData = {
          uri: sharedUri,
          type: 'image',
          name: urlParams.get('name') || 'shared_image'
        };

        // Process the shared image
        await this.processSharedImage(imageData);
      }
    } catch (error) {
      console.error('Error handling shared content:', error);
    }
  }

  static async checkForSharedContent() {
    try {
      if (!Capacitor.isNativePlatform()) return;

      const { App } = await import('@capacitor/app');
      const state = await App.getState();
      
      // Check if app was opened with intent data
      if (state.isActive) {
        // This is a placeholder for checking intent data
        // The actual implementation would depend on a Capacitor plugin
        console.log('Checking for shared content...');
      }
    } catch (error) {
      console.error('Error checking shared content:', error);
    }
  }

  static async processSharedImage(imageData: SharedImageData) {
    try {
      console.log('Processing shared image:', imageData);
      
      if (!Capacitor.isNativePlatform()) {
        console.log('File system access not available on web');
        return;
      }

      // Dynamic import for filesystem
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      
      // Read the image file
      const imageFile = await Filesystem.readFile({
        path: imageData.uri,
        directory: Directory.Cache
      });

      // Convert to base64 if needed
      const base64Data = typeof imageFile.data === 'string' 
        ? imageFile.data 
        : btoa(String.fromCharCode(...new Uint8Array(imageFile.data as ArrayBuffer)));

      // Create a blob from the base64 data
      const response = await fetch(`data:image/jpeg;base64,${base64Data}`);
      const blob = await response.blob();
      
      // Convert blob to ArrayBuffer and then create File
      const arrayBuffer = await blob.arrayBuffer();
      const file = new File([arrayBuffer], imageData.name || 'shared_image.jpg', { type: 'image/jpeg' });

      // Trigger the AI processing
      window.dispatchEvent(new CustomEvent('processSharedImage', { 
        detail: { file } 
      }));

    } catch (error) {
      console.error('Error processing shared image:', error);
      
      // Fallback: try to handle as regular shared content
      try {
        // Dispatch event with URI for fallback processing
        window.dispatchEvent(new CustomEvent('processSharedImage', { 
          detail: { uri: imageData.uri } 
        }));
      } catch (fallbackError) {
        console.error('Fallback processing also failed:', fallbackError);
      }
    }
  }
}
