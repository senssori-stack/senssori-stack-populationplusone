Birth Announcement App — Backup (created 2025-10-20)

This archive is a snapshot of the project in this workspace to be used as a backup in case of power loss or other extreme events.

What's included
- Full project source files under this workspace root (React Native / Expo app with TypeScript).
- Components: SignFront, SignFrontClean, FitText, SyncFitGroup, etc.
- Screens under src/screens, utility files, android folder, and top-level config like package.json, tsconfig.json, app.json.

Quick restore steps (on a Windows machine)
1. Copy or extract the zip to a safe location, e.g. C:\Projects\BIRTHAPP_CLEAN
2. Open a PowerShell terminal in that folder.
3. Install dependencies:
   npm install
   # or
   yarn install
4. Start Expo Metro:
   npx expo start

Notes about running
- This project was developed with Expo (managed workflow). Use `npx expo start` and scan the QR with Expo Go, or open an emulator with 'a'.
- If PowerShell blocks scripts (expo.ps1), use `npx expo start` which bypasses the global shim.

If you need a full reinstall from scratch
1. Ensure Node.js and npm (or yarn) are installed.
2. Install global tooling if desired: `npm i -g expo-cli` (not required if using npx).
3. Follow the "Quick restore steps" above.

Contact / notes
- Backup created by the project automation on 2025-10-20.
- Keep this file with your zip for future reference.
