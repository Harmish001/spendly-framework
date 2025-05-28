
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.fe3b15c32c154b048b9985fefc4797f2',
  appName: 'spendly-framework',
  webDir: 'dist',
  server: {
    url: "https://fe3b15c3-2c15-4b04-8b99-85fefc4797f2.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
