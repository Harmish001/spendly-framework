
# Spendly - Deployment Guide

## 🚀 Quick Start for Sharing

### Option 1: GitHub Actions (Recommended)
1. Push your code to GitHub
2. GitHub Actions automatically builds APKs
3. Download APKs from GitHub Releases
4. Share the download link with friends

### Option 2: Manual Build
```bash
# Make script executable
chmod +x scripts/build-android.sh

# Build APK
./scripts/build-android.sh
```

## 📱 For Your Friends

### Installing the APK
1. **Download**: Get the APK from GitHub releases
2. **Enable Unknown Sources**: 
   - Android Settings > Security > Install unknown apps
   - Enable for your browser/file manager
3. **Install**: Tap the APK file and follow prompts
4. **Permissions**: Grant camera and storage permissions

### Using the App
1. **Open Spendly** on your Android device
2. **Share a Screenshot**: 
   - Take a screenshot of any receipt/expense
   - Use Android's share feature
   - Select "Spendly" from the share menu
3. **AI Extraction**: The app automatically extracts expense data
4. **Review & Save**: Confirm the details and save the expense

## 🌐 Web Version (PWA)

The web version is available at your GitHub Pages URL:
`https://[username].github.io/[repository-name]`

### PWA Installation
1. Open the web app in Chrome/Edge
2. Look for "Install" prompt or menu option
3. Add to home screen for app-like experience

## 🔧 Development Setup

```bash
# Install dependencies
npm install

# Add Android platform
npx cap add android

# Sync and build
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android
```

## 📋 Features

- ✨ AI-powered expense extraction from receipts
- 📸 Share screenshots from any app
- 💰 Expense tracking and categorization
- 📊 Spending analytics and insights
- 🔄 Cross-platform (Web + Android)

## 🤝 Sharing with Friends

1. **GitHub Release**: Share the APK download link
2. **Direct APK**: Send the APK file directly
3. **Web Version**: Share the GitHub Pages URL
4. **QR Code**: Generate QR codes for easy sharing

## 🔒 Privacy & Security

- All data is stored locally on device
- AI processing happens securely
- No personal data is shared externally
- Open source - you can verify the code

## 🆘 Troubleshooting

- **Installation Failed**: Enable unknown sources
- **Permissions**: Grant camera and storage access
- **Share Not Working**: Ensure app is set as default handler
- **Build Issues**: Check GitHub Actions logs

## 📞 Support

If you encounter issues:
1. Check GitHub Issues
2. Review the troubleshooting section
3. Create a new issue with details
