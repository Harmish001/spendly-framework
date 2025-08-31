
# Deployment Configuration

## Prerequisites

Before the GitHub Actions can build APKs successfully, ensure you have:

1. **GitHub Repository Settings:**
   - Actions enabled in repository settings
   - Write permissions for GITHUB_TOKEN (should be enabled by default)

2. **Optional - For Production APK Signing:**
   - Create a keystore file for signing release APKs
   - Add keystore secrets to GitHub repository secrets:
     - `ANDROID_KEYSTORE_FILE` (base64 encoded keystore)
     - `ANDROID_KEYSTORE_PASSWORD`
     - `ANDROID_KEY_ALIAS`
     - `ANDROID_KEY_PASSWORD`

## How to Use

1. **Automatic Builds:**
   - Push to main/master branch triggers automatic build
   - APKs are created and attached to GitHub releases

2. **Manual Builds:**
   - Go to Actions tab in your GitHub repository
   - Select "Build and Deploy Mobile App" workflow
   - Click "Run workflow"
   - Optionally specify a custom version number

3. **Download APKs:**
   - Go to Releases section of your repository
   - Download the APK files from the latest release
   - Share the download link with friends

## APK Installation Instructions

Send these instructions to your friends:

1. Download the APK from the GitHub release
2. On Android device: Settings > Security > Allow installation from unknown sources
3. Open the downloaded APK file to install
4. Grant necessary permissions when prompted
5. Open the Spendly app and start tracking expenses!

## PWA Access

The web version is automatically deployed to GitHub Pages at:
`https://[username].github.io/[repository-name]`

## Troubleshooting

- If builds fail, check the Actions logs
- Ensure all dependencies are properly listed in package.json
- For APK signing issues, verify keystore configuration
- For large APKs, consider enabling ProGuard/R8 optimization
