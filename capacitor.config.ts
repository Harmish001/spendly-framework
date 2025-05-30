
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.fe3b15c32c154b048b9985fefc4797f2',
  appName: 'spendly-framework',
  webDir: 'dist',
  server: {
    url: "https://spendly-eight.vercel.app",
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    App: {
      handleUrl: true
    }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
