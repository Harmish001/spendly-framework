
#!/bin/bash

echo "🚀 Building Spendly Android App..."

# Build web app
echo "📦 Building web application..."
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Build Android APK
echo "🤖 Building Android APK..."
cd android
./gradlew assembleDebug

echo "✅ Build complete!"
echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on device:"
echo "1. Enable 'Install from unknown sources' in Android settings"
echo "2. Transfer APK to device and install"
echo "3. Grant necessary permissions"
