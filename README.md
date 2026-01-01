# BirthApp — Build & Run Guide

Detected project: Expo (has `expo` dependency and `expo` scripts in `package.json`) with an existing `android/` folder (prebuilt / bare native files present).

This file summarizes quick, copy-paste instructions for developing, building, and releasing on Android and iOS. Commands are shown for Windows PowerShell where appropriate.

## Prerequisites

- Node.js (LTS)
- npm or Yarn
- Java JDK 11 (recommended for React Native 0.81.x)
- Android Studio (Android SDK, emulator, AND set ANDROID_HOME/ANDROID_SDK_ROOT if required)
- If you want to build iOS locally: macOS + Xcode + CocoaPods
- For App Store / Play Store builds from any OS: use EAS Build (recommended)

## Install dependencies

Windows PowerShell:

```powershell
npm install
# or: yarn
```

## Development — Expo Go (fast)

Start Metro and open on device or emulator:

```powershell
npx expo start
# then press 'a' to open Android emulator, 'i' for iOS simulator (macOS), or scan the QR with Expo Go on your phone
```

## Run / build on Android (local)

Quick (build & install to device/emulator):

```powershell
npm run android
# equivalent: npx expo run:android
```

Notes:
- This requires Android SDK + emulator or a connected Android device with USB debugging enabled.
- Because this repo already contains an `android/` folder, Gradle and the native project exist. The Gradle wrapper is at `android\gradlew.bat`.

Build a release APK / AAB locally (requires correct signing configuration):

```powershell
cd android
.\gradlew assembleRelease    # produces APK at android\app\build\outputs\apk\release\
.\gradlew bundleRelease      # produces AAB at android\app\build\outputs\bundle\release\
```

If you need a keystore for signing (generate with keytool from the JDK):

```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Then configure signing in `android/gradle.properties` or `android/app/build.gradle` per React Native docs.

Recommended: Use EAS (below) to avoid local signing complexity.

## iOS builds

Local build (macOS only):

```bash
# on macOS
npm run ios
# or: npx expo run:ios
```

Notes:
- Requires Xcode and CocoaPods. You must open the Xcode workspace from `ios/` and manage signing (team, provisioning, certificates) there for App Store releases.
- Building for iOS on Windows is not possible locally. Use EAS Build or a macOS CI/service.

## EAS Build (recommended for production for both platforms)

EAS (Expo Application Services) lets you build store-ready binaries in the cloud.

1. Install eas-cli:

```powershell
npm install -g eas-cli
eas login    # sign into your Expo account
```

2. Create a basic `eas.json` (example):

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  }
}
```

3. Trigger builds:

```powershell
eas build -p android --profile production
eas build -p ios --profile production
# or build both: eas build --platform all
```

EAS will help you manage credentials (keystores, provisioning profiles). Follow the interactive prompts.

## Troubleshooting & tips

- If you see SDK mismatch errors, ensure the Expo SDK in `app.json` (`sdkVersion`) matches the installed `expo` package.
- If the emulator won't start, open Android Studio, create an AVD, verify ANDROID_HOME, and ensure platform-tools are on PATH.
- For signing: if you lose keystores, Google Play supports uploading a new key via Play App Signing but it's best to back up your keystore.

## Next steps I can help with

- Walk you through setting up Android Studio + emulator on Windows
- Generate a release keystore and wire it into the Gradle config
- Configure `eas.json` and run an EAS build (I can create an `eas.json` profile for you)
- Help prepare App Store metadata and provisioning if you have a Mac

If you tell me which OS you want to build on (Windows or macOS) and whether you prefer local builds or EAS cloud builds, I’ll give the exact step-by-step commands for your environment.

## Troubleshooting Google Sheets CSV fetching

If the app fails to fetch your published Google Sheets CSV, common causes are:

- The sheet isn't actually published to the web (or the URL is wrong)
- The published URL points to an HTML error page (e.g. "file not found") instead of CSV
- Network restrictions or firewalls blocking access

How to check quickly locally:

1. Use the included Node script (requires `node-fetch`):

```powershell
npm install node-fetch@2
node scripts/checkSheets.js
```

2. Verify the published CSV URL in a browser — it should prompt to download or display CSV text. If you see a Google HTML page saying "Sorry, the file you have requested does not exist", the sheet isn't published correctly or the ID is wrong.

3. To publish a Google Sheet as CSV:
  - In Google Sheets: File -> Share -> Publish to web -> Choose sheet -> Link -> CSV
  - Copy the provided link and replace the constants in `src/data/utils/sheets.ts`.

If you'd like, paste the two URLs here (or let me run the `checkSheets.js` output) and I'll diagnose the exact error and patch the parsing code if needed.
