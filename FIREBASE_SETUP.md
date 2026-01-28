# Firebase Setup Instructions

## What Firebase Will Track:

1. **Survey Responses** - User answers to marketing questions
2. **Email Addresses** - For special offers and marketing
3. **Usage Analytics** - Time in app, screens viewed, user engagement
4. **Announcement Creations** - When users build announcements (mode, theme, orientation)

## Setup Steps:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it: `birth-announcement-studio` (or your choice)
4. **Disable Google Analytics for now** (can enable later)
5. Click "Create project"

### 2. Add Web App to Project

1. In Firebase Console, click the **</> Web** icon
2. Register app name: `Birth Studio App`
3. **Check "Also set up Firebase Hosting"** - NO (skip this)
4. Click "Register app"
5. **Copy the firebaseConfig object** - you'll need this!

### 3. Enable Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click "Create database"
3. Choose **"Start in test mode"** (for development)
4. Select location: **us-central** (or closest to you)
5. Click "Enable"

### 4. Configure Your App

1. Open `src/config/firebase.ts`
2. Replace the placeholder config with YOUR config from step 2:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXX", // YOUR values here
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

3. Save the file

### 5. Set Up Firestore Security Rules (IMPORTANT!)

1. In Firebase Console, go to **Firestore Database → Rules**
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to write survey responses (but not read)
    match /survey_responses/{document} {
      allow create: if true;
      allow read, update, delete: if false;
    }
    
    // Allow anyone to write announcement creations (but not read)
    match /announcements_created/{document} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

3. Click "Publish"

### 6. Enable Analytics (Optional but Recommended)

1. Go to **Project Settings** (gear icon)
2. Scroll to "Google Analytics"
3. Click "Enable Google Analytics"
4. Create new account or link existing
5. This gives you free time tracking and user engagement metrics!

## Testing Firebase

After setup, test by:
1. Running `npx expo start`
2. Fill out the form with an email
3. Click "BUILD MY BIRTH ANNOUNCEMENT"
4. Check Firebase Console → Firestore Database
5. You should see new documents in `survey_responses` and `announcements_created` collections

## What Data is Collected:

### survey_responses collection:
```json
{
  "surveyQ1": "friend",
  "surveyQ2": "gift", 
  "surveyQ3": "print_own",
  "mode": "baby",
  "email": "user@example.com",
  "babyCount": 1,
  "hometown": "Springfield, MO",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### announcements_created collection:
```json
{
  "email": "user@example.com",
  "mode": "baby",
  "babyCount": 1,
  "orientation": "portrait",
  "theme": "green",
  "timestamp": "2025-01-15T10:30:15Z"
}
```

## Cost Breakdown (FREE for your use case):

- **Firestore Reads**: 50,000/day FREE
- **Firestore Writes**: 20,000/day FREE
- **Storage**: 1GB FREE
- **Analytics**: UNLIMITED FREE

Even with 500 users/day, you'll only use ~1,000 writes/day (well under limit).

## Viewing Your Data:

1. Go to Firebase Console → Firestore Database
2. Click on `survey_responses` or `announcements_created`
3. Export to CSV for marketing analysis
4. Use Analytics dashboard for user behavior insights

## Privacy Note:

Add this to your app's privacy policy:
- Email addresses are collected for marketing purposes
- Usage data is collected via Firebase Analytics
- No personal photos are stored (processed locally only)
- Users can request data deletion by emailing you
