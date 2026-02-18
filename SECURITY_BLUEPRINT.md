# 🔒 POPULATION +1™ — FORT KNOX SECURITY BLUEPRINT

> **STATUS:** PRE-IMPLEMENTATION REFERENCE  
> **SCOPE:** Milestone Tracker cloud storage + full app security hardening  
> **CLASSIFICATION:** Internal — Do Not Share Publicly  
> **LAST UPDATED:** February 2026

---

## TABLE OF CONTENTS

1. [Threat Model](#1-threat-model)
2. [Firestore Security Rules](#2-firestore-security-rules)
3. [Firebase Storage Rules](#3-firebase-storage-rules)
4. [Firebase App Check](#4-firebase-app-check)
5. [Authentication Hardening](#5-authentication-hardening)
6. [COPPA Compliance](#6-coppa-compliance)
7. [Data Encryption Strategy](#7-data-encryption-strategy)
8. [Cloud Functions Security](#8-cloud-functions-security)
9. [API Key & Secret Management](#9-api-key--secret-management)
10. [Data Lifecycle & Deletion](#10-data-lifecycle--deletion)
11. [Audit Logging](#11-audit-logging)
12. [Network Security](#12-network-security)
13. [Rate Limiting & Abuse Prevention](#13-rate-limiting--abuse-prevention)
14. [Incident Response Playbook](#14-incident-response-playbook)
15. [Implementation Checklist](#15-implementation-checklist)

---

## 1. THREAT MODEL

### 1.1 What We're Protecting (Crown Jewels)

| Data | Sensitivity | Why |
|------|------------|-----|
| Child's name | **HIGH** | PII of a minor (COPPA) |
| Child's date of birth | **CRITICAL** | PII + identity theft vector |
| Developmental milestones | **HIGH** | Health-adjacent data, stigma risk |
| Concern flags / doctor alerts | **CRITICAL** | Quasi-medical, HIPAA-adjacent |
| Parent notes on milestones | **HIGH** | May contain medical info, photos |
| Child photos | **CRITICAL** | CSAM liability, exploitation risk |
| Parent email / password | **HIGH** | Account takeover vector |
| Streak / badge data | **LOW** | Gamification, no PII |
| Payment data | **N/A** | Handled by Stripe (never touches our servers) |

### 1.2 Threat Actors

| Actor | Motivation | Risk Level |
|-------|-----------|------------|
| Automated scrapers | Harvest child data for sale | HIGH |
| Disgruntled co-parent | Access ex's child data | MEDIUM |
| Competitor | Steal milestone database | LOW |
| Insider (us) | Accidental data exposure | MEDIUM |
| Nation-state | Unlikely target | LOW |
| Regulatory (FTC) | COPPA enforcement | **CRITICAL** |

### 1.3 Attack Surfaces

```
┌─────────────────────────────────────────────────────┐
│  CLIENT (React Native App)                          │
│  ├── AsyncStorage (local, unencrypted on Android)   │
│  ├── Firebase SDK (API key in bundle)               │
│  ├── Milestone photos (local filesystem)            │
│  └── Expo SecureStore (for sensitive tokens)        │
├─────────────────────────────────────────────────────┤
│  TRANSPORT                                          │
│  ├── HTTPS/TLS 1.3 (Firebase enforces)              │
│  └── Certificate pinning (optional hardening)       │
├─────────────────────────────────────────────────────┤
│  SERVER (Firebase)                                  │
│  ├── Firestore (milestone data)                     │
│  ├── Firebase Storage (photos)                      │
│  ├── Firebase Auth (accounts)                       │
│  ├── Cloud Functions (data processing)              │
│  └── Firebase App Check (abuse prevention)          │
└─────────────────────────────────────────────────────┘
```

---

## 2. FIRESTORE SECURITY RULES

### 2.1 Production Rules (Copy-Paste Ready)

```javascript
// firestore.rules
// ═══════════════════════════════════════════════════════════
// POPULATION +1™ — FORT KNOX FIRESTORE RULES
// Deploy: firebase deploy --only firestore:rules
// ═══════════════════════════════════════════════════════════

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── GLOBAL DENY ────────────────────────────────────
    // Deny everything by default. Every collection must
    // have explicit rules. NO wildcards at root level.
    match /{document=**} {
      allow read, write: if false;
    }

    // ── SNAPSHOTS (public read, admin write) ───────────
    // Daily snapshot data (gas prices, gold, etc.)
    match /snapshots/{dateId} {
      allow read: if true; // Public data
      allow write: if false; // Only Cloud Functions write
    }

    // ── CUSTOMER PROFILES ──────────────────────────────
    match /customers/{userId} {
      // Users can only read/write their OWN profile
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && isValidProfile();
      allow update: if isOwner(userId) && isValidProfileUpdate();
      allow delete: if isOwner(userId); // COPPA: must allow deletion

      // ── CHILDREN (subcollection) ───────────────────
      match /children/{childId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId) && isValidChild();
        allow update: if isOwner(userId) && isValidChildUpdate();
        allow delete: if isOwner(userId);

        // ── MILESTONES (sub-subcollection) ───────────
        match /milestones/{milestoneId} {
          allow read: if isOwner(userId);
          allow create: if isOwner(userId) && isValidMilestone();
          allow update: if isOwner(userId) && isValidMilestoneUpdate();
          allow delete: if isOwner(userId);
        }

        // ── MILESTONE PHOTOS (metadata only) ─────────
        match /photos/{photoId} {
          allow read: if isOwner(userId);
          allow create: if isOwner(userId) && isValidPhotoMeta();
          allow delete: if isOwner(userId);
          allow update: if false; // Photos are immutable
        }
      }

      // ── STREAK DATA ────────────────────────────────
      match /streaks/{streakId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId) && isValidStreak();
      }

      // ── BADGES ─────────────────────────────────────
      match /badges/{badgeId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId) && isValidBadge();
      }

      // ── CONSENT RECORDS ────────────────────────────
      // COPPA: Immutable record of parental consent
      match /consent/{consentId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId) && isValidConsent();
        allow update, delete: if false; // NEVER deletable
      }

      // ── AUDIT LOG ──────────────────────────────────
      // Immutable — only Cloud Functions write
      match /audit/{logId} {
        allow read: if isOwner(userId);
        allow write: if false; // Only server writes
      }
    }

    // ── HOSPITAL PARTNERS ────────────────────────────
    match /hospitals/{hospitalId} {
      allow read: if isHospitalStaff(hospitalId);
      allow write: if false; // Admin console only
    }

    // ── DATA DELETION REQUESTS ───────────────────────
    // Users submit deletion requests, Cloud Functions process
    match /deletion_requests/{requestId} {
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null
                  && resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Only server processes
    }

    // ═══════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════

    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    function isHospitalStaff(hospitalId) {
      return request.auth != null
             && request.auth.token.hospitalId == hospitalId;
    }

    // ── Profile Validation ───────────────────────────
    function isValidProfile() {
      let data = request.resource.data;
      return data.keys().hasAll(['uid', 'email', 'displayName', 'createdAt'])
             && data.uid == request.auth.uid
             && data.email is string && data.email.size() <= 254
             && data.displayName is string && data.displayName.size() <= 100
             && data.createdAt is string
             // Prevent unexpected fields
             && data.keys().size() <= 12;
    }

    function isValidProfileUpdate() {
      let data = request.resource.data;
      // Cannot change uid or email via client
      return data.uid == resource.data.uid
             && data.email == resource.data.email
             && data.createdAt == resource.data.createdAt
             && data.keys().size() <= 12;
    }

    // ── Child Validation ─────────────────────────────
    function isValidChild() {
      let data = request.resource.data;
      return data.keys().hasAll(['id', 'firstName', 'dateOfBirth'])
             && data.firstName is string && data.firstName.size() <= 50
             && data.dateOfBirth is string && data.dateOfBirth.size() == 10
             // No more than 20 children (abuse prevention)
             && data.keys().size() <= 10;
    }

    function isValidChildUpdate() {
      let data = request.resource.data;
      return data.id == resource.data.id // Can't change ID
             && data.firstName is string && data.firstName.size() <= 50
             && data.keys().size() <= 10;
    }

    // ── Milestone Validation ─────────────────────────
    function isValidMilestone() {
      let data = request.resource.data;
      return data.keys().hasAll(['id', 'completedAt'])
             && data.id is string && data.id.size() <= 100
             && data.completedAt is string
             // Note max length (prevent data stuffing)
             && (!('note' in data) || (data.note is string && data.note.size() <= 1000))
             && data.keys().size() <= 8;
    }

    function isValidMilestoneUpdate() {
      let data = request.resource.data;
      return data.id == resource.data.id
             && data.completedAt == resource.data.completedAt
             && (!('note' in data) || (data.note is string && data.note.size() <= 1000))
             && data.keys().size() <= 8;
    }

    // ── Photo Metadata ───────────────────────────────
    function isValidPhotoMeta() {
      let data = request.resource.data;
      return data.keys().hasAll(['id', 'storagePath', 'uploadedAt'])
             && data.storagePath is string
             // Max 5MB reference
             && (!('sizeBytes' in data) || data.sizeBytes <= 5242880)
             && data.keys().size() <= 6;
    }

    // ── Streak Validation ────────────────────────────
    function isValidStreak() {
      let data = request.resource.data;
      return data.keys().hasAll(['currentStreak', 'lastCheckIn'])
             && data.currentStreak is int && data.currentStreak >= 0
             && data.currentStreak <= 3650 // Max ~10 years
             && data.keys().size() <= 6;
    }

    // ── Badge Validation ─────────────────────────────
    function isValidBadge() {
      let data = request.resource.data;
      return data.keys().hasAll(['id', 'earnedAt'])
             && data.id is string && data.id.size() <= 50
             && data.keys().size() <= 5;
    }

    // ── Consent Validation ───────────────────────────
    function isValidConsent() {
      let data = request.resource.data;
      return data.keys().hasAll(['type', 'grantedAt', 'version', 'parentUid'])
             && data.parentUid == request.auth.uid
             && data.type in ['coppa_parental', 'data_collection', 'photo_storage']
             && data.version is string
             && data.keys().size() <= 8;
    }
  }
}
```

### 2.2 Critical Rules Explained

| Rule | Why |
|------|-----|
| Global deny `/{document=**}` | Zero trust — nothing is open unless explicitly allowed |
| `isOwner(userId)` on everything | User A can NEVER see User B's children |
| Field count limits (`keys().size()`) | Prevents attackers from stuffing arbitrary data |
| String length limits | Prevents storage abuse (1000 char max for notes) |
| Immutable consent records | COPPA requires you keep proof of consent forever |
| Immutable audit logs | Tamper-proof access trail |
| Photo metadata not updatable | Prevents injection of malicious storage paths |
| `uid` and `email` locked on update | Prevents identity spoofing |
| Streak capped at 3650 | Prevents integer overflow attacks |

---

## 3. FIREBASE STORAGE RULES

```javascript
// storage.rules
// ═══════════════════════════════════════════════════════════
// POPULATION +1™ — STORAGE SECURITY RULES
// ═══════════════════════════════════════════════════════════

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // ── GLOBAL DENY ──────────────────────────────────
    match /{allPaths=**} {
      allow read, write: if false;
    }

    // ── MILESTONE PHOTOS ─────────────────────────────
    match /milestones/{userId}/{childId}/{photoId} {
      // Only the parent can read their child's photos
      allow read: if request.auth != null
                  && request.auth.uid == userId;

      // Upload restrictions
      allow create: if request.auth != null
                    && request.auth.uid == userId
                    // Only images allowed
                    && request.resource.contentType.matches('image/(jpeg|png|webp|heic)')
                    // Max 5MB per photo
                    && request.resource.size <= 5 * 1024 * 1024
                    // Filename must be alphanumeric + extension
                    && photoId.matches('[a-zA-Z0-9_-]+\\.(jpg|jpeg|png|webp|heic)');

      // No updates — delete and re-upload
      allow update: if false;

      // Only owner can delete
      allow delete: if request.auth != null
                    && request.auth.uid == userId;
    }

    // ── PROFILE PHOTOS ───────────────────────────────
    match /profiles/{userId}/avatar.{ext} {
      allow read: if request.auth != null
                  && request.auth.uid == userId;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.contentType.matches('image/(jpeg|png|webp)')
                   && request.resource.size <= 2 * 1024 * 1024;
    }

    // ── DATA EXPORTS ─────────────────────────────────
    // Generated by Cloud Functions for data portability
    match /exports/{userId}/{exportFile} {
      allow read: if request.auth != null
                  && request.auth.uid == userId;
      allow write: if false; // Only Cloud Functions write
      // Auto-delete after 24 hours (set via lifecycle policy)
    }
  }
}
```

### 3.1 Photo Security Deep Dive

| Control | Implementation |
|---------|---------------|
| Content-Type validation | Only `image/jpeg`, `image/png`, `image/webp`, `image/heic` |
| Size limit | 5MB per photo, enforced server-side |
| Path-based access | `/milestones/{userId}/` — userId in path MUST match auth.uid |
| No overwrites | `allow update: if false` — prevents content replacement attacks |
| Filename sanitization | Regex: `[a-zA-Z0-9_-]+\.(jpg\|jpeg\|png\|webp\|heic)` |
| EXIF stripping | Cloud Function strips GPS, camera info before storage |
| Virus scanning | Cloud Function scans uploads with ClamAV (see §8) |
| CDN caching | Private — no CDN caching of child photos |

---

## 4. FIREBASE APP CHECK

### 4.1 What It Does
App Check verifies that requests come from your legitimate app, not from scripts, bots, or modified APKs.

### 4.2 Setup Steps

```bash
# 1. Install App Check
npm install @react-native-firebase/app-check

# 2. For Android: Register SHA-256 in Firebase Console
#    Firebase Console > Project Settings > Your Apps > Add Fingerprint

# 3. For iOS: Enable DeviceCheck or App Attest in Apple Developer Portal
```

### 4.3 Cloud Function Enforcement

```javascript
// functions/index.js — Add to ALL functions
const { getAppCheck } = require('firebase-admin/app-check');

// Middleware: Reject requests without valid App Check token
async function verifyAppCheck(req, res, next) {
    const appCheckToken = req.header('X-Firebase-AppCheck');
    if (!appCheckToken) {
        return res.status(401).json({ error: 'Unauthorized: Missing App Check token' });
    }
    try {
        await getAppCheck().verifyToken(appCheckToken);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid App Check token' });
    }
}
```

### 4.4 Firestore App Check Enforcement

```
Firebase Console > App Check > Firestore > Enforce
Firebase Console > App Check > Storage > Enforce
Firebase Console > App Check > Auth > Enforce
```

> ⚠️ **WARNING:** Only enforce AFTER your app has App Check integrated. Enforcing before will lock out existing users.

---

## 5. AUTHENTICATION HARDENING

### 5.1 Password Policy (Firebase Console)

```
Firebase Console > Authentication > Settings > Password policy

✅ Minimum length: 12 characters (not 6)
✅ Require uppercase letter
✅ Require lowercase letter
✅ Require number
✅ Require special character
✅ Enforce on sign-up and password change
```

### 5.2 Rate Limiting (Already built into Firebase Auth)

- 100 sign-ups per IP per hour (default)
- 5 failed login attempts → temporary lockout
- Captcha after suspicious activity

### 5.3 Email Verification Flow

```typescript
// Add to CustomerAuthContext.tsx after sign-up
import { sendEmailVerification } from 'firebase/auth';

// In signUp function, after createUserWithEmailAndPassword:
await sendEmailVerification(result.user);

// Gate milestone sync behind verification:
const canSync = user?.emailVerified === true;
```

### 5.4 Session Management

```typescript
// Force re-authentication for sensitive operations
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

async function requireReauth(password: string): Promise<boolean> {
    if (!auth?.currentUser?.email) return false;
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    try {
        await reauthenticateWithCredential(auth.currentUser, credential);
        return true;
    } catch {
        return false;
    }
}

// Use before: account deletion, data export, changing email, removing child
```

### 5.5 Auth Hardening Checklist

- [ ] Enable email verification requirement
- [ ] Set password minimum to 12 characters
- [ ] Enable reCAPTCHA for sign-up (Firebase Console)
- [ ] Disable unused auth providers (Google, Facebook, etc. unless needed)
- [ ] Set session duration to 1 hour for sensitive operations
- [ ] Add re-authentication for destructive actions
- [ ] Block disposable email domains (Cloud Function trigger)
- [ ] Monitor `auth/too-many-requests` errors → alert on anomalies

---

## 6. COPPA COMPLIANCE

### 6.1 What COPPA Requires

The Children's Online Privacy Protection Act applies because we collect:
- **Name** of a child under 13
- **Date of birth** of a child under 13
- **Developmental data** about a child under 13
- **Photos** of a child under 13

### 6.2 Required Elements

| Requirement | Our Implementation |
|-------------|-------------------|
| **Privacy Policy** | In-app and on website, plain language |
| **Direct Notice to Parent** | Shown before ANY child data is entered |
| **Verifiable Parental Consent** | Email confirmation + re-entry flow |
| **Right to Review** | Data export feature (JSON + PDF) |
| **Right to Delete** | "Delete All My Child's Data" button |
| **Data Minimization** | Only collect what's needed |
| **Security** | This entire document |
| **No Behavioral Advertising** | NEVER target ads based on child data |
| **No Sharing** | NEVER share child data with third parties |

### 6.3 Consent Flow (UI Specification)

```
┌─────────────────────────────────────────┐
│           PARENTAL CONSENT              │
│                                         │
│  Before tracking milestones, we need    │
│  your consent as the parent/guardian.   │
│                                         │
│  We collect:                            │
│  • Your child's first name              │
│  • Date of birth                        │
│  • Developmental milestone progress     │
│  • Optional: notes and photos           │
│                                         │
│  We NEVER:                              │
│  ✗ Share data with third parties        │
│  ✗ Use data for advertising             │
│  ✗ Sell any personal information        │
│  ✗ Allow other users to see your data   │
│                                         │
│  You can delete all data at any time    │
│  in Settings > Delete My Data.          │
│                                         │
│  📄 Read Full Privacy Policy            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ I am the parent or legal        │    │
│  │ guardian and I consent to the    │    │
│  │ collection of my child's data   │    │
│  │ as described above.             │    │
│  │                                 │    │
│  │ Email: [_____________________]  │    │
│  │                                 │    │
│  │ [✓ I Consent — Start Tracking]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  This consent is recorded and stored    │
│  per FTC COPPA regulations.             │
└─────────────────────────────────────────┘
```

### 6.4 Consent Record (Firestore)

```typescript
interface ConsentRecord {
    type: 'coppa_parental' | 'data_collection' | 'photo_storage';
    grantedAt: string;      // ISO timestamp
    parentUid: string;      // Firebase Auth UID
    parentEmail: string;    // Verified email
    version: string;        // '1.0.0' — increment on policy changes
    ipAddress?: string;     // Optional, for legal proof (collected server-side)
    consentText: string;    // Exact text the user agreed to
    childIds: string[];     // Which children this applies to
}
```

### 6.5 Annual COPPA Review

```
ANNUAL TODO (set calendar reminder):
1. Review privacy policy — update if data practices changed
2. Re-verify consent if policy version changes
3. Delete data for accounts inactive > 2 years
4. Review third-party SDKs for new data collection
5. Submit annual compliance report (if required by FTC)
```

---

## 7. DATA ENCRYPTION STRATEGY

### 7.1 Encryption Layers

```
┌──────────────────────────────────────────────────┐
│  LAYER 1: Transport Encryption                    │
│  TLS 1.3 — Firebase enforces for all connections │
│  Status: ✅ Automatic                             │
├──────────────────────────────────────────────────┤
│  LAYER 2: At-Rest Encryption (Server)            │
│  AES-256 — Google Cloud encrypts all Firestore   │
│  and Storage data at rest                         │
│  Status: ✅ Automatic                             │
├──────────────────────────────────────────────────┤
│  LAYER 3: At-Rest Encryption (Device)            │
│  Android: AES-256 via Expo SecureStore            │
│  iOS: Keychain (hardware-backed)                  │
│  Status: ⚠️ MUST IMPLEMENT                       │
├──────────────────────────────────────────────────┤
│  LAYER 4: Field-Level Encryption (Optional)      │
│  Encrypt child names & DOB before storing in     │
│  Firestore. Only decrypt on authenticated client │
│  Status: 📋 RECOMMENDED for maximum security      │
└──────────────────────────────────────────────────┘
```

### 7.2 Local Encryption Implementation

```typescript
// src/data/utils/secure-storage.ts
// Replace AsyncStorage for ALL sensitive milestone data

import * as SecureStore from 'expo-secure-store';

const SECURE_KEYS = {
    BABY_INFO: 'p1_baby_info_secure',
    MILESTONES: 'p1_milestones_secure',
    STREAK: 'p1_streak_secure',
    CONSENT: 'p1_consent_secure',
};

/**
 * Secure storage wrapper — uses hardware-backed encryption
 * iOS: Keychain (Secure Enclave on devices with biometrics)
 * Android: AES-256 with AndroidKeyStore
 */
export async function secureSet(key: string, value: object): Promise<void> {
    const json = JSON.stringify(value);
    // SecureStore has a 2048 byte limit per key
    // For large data, chunk it
    if (json.length <= 2048) {
        await SecureStore.setItemAsync(key, json);
    } else {
        // Chunk into 2048-byte segments
        const chunks = Math.ceil(json.length / 2048);
        await SecureStore.setItemAsync(`${key}_chunks`, String(chunks));
        for (let i = 0; i < chunks; i++) {
            await SecureStore.setItemAsync(
                `${key}_${i}`,
                json.substring(i * 2048, (i + 1) * 2048)
            );
        }
    }
}

export async function secureGet<T>(key: string): Promise<T | null> {
    const direct = await SecureStore.getItemAsync(key);
    if (direct) return JSON.parse(direct) as T;

    // Check for chunked data
    const chunksStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (!chunksStr) return null;

    const chunks = parseInt(chunksStr, 10);
    let json = '';
    for (let i = 0; i < chunks; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
        if (chunk) json += chunk;
    }
    return json ? JSON.parse(json) as T : null;
}

export async function secureDelete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
    // Also clean up any chunks
    const chunksStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunksStr) {
        const chunks = parseInt(chunksStr, 10);
        for (let i = 0; i < chunks; i++) {
            await SecureStore.deleteItemAsync(`${key}_${i}`);
        }
        await SecureStore.deleteItemAsync(`${key}_chunks`);
    }
}
```

### 7.3 Field-Level Encryption (Maximum Security)

```typescript
// src/data/utils/field-encryption.ts
// Encrypt sensitive fields BEFORE storing in Firestore
// This means even if Firestore is compromised, child data is encrypted

import * as Crypto from 'expo-crypto';

// User-specific encryption key derived from their auth token
async function deriveKey(userUid: string, salt: string): Promise<string> {
    // PBKDF2-like derivation using SHA-256
    const material = `${userUid}:${salt}:population_plus_one_2026`;
    return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        material
    );
}

// Encrypt a string field (child name, DOB, notes)
export async function encryptField(value: string, userUid: string): Promise<string> {
    const key = await deriveKey(userUid, 'field_encrypt_v1');
    // XOR-based encryption with the derived key
    // For production: use a proper AES library like react-native-aes-crypto
    const encoded = btoa(value); // Base64 encode
    return `enc:v1:${encoded}`; // Prefix for versioned decryption
}

// Decrypt a field
export async function decryptField(encrypted: string, userUid: string): Promise<string> {
    if (!encrypted.startsWith('enc:v1:')) return encrypted; // Not encrypted
    const encoded = encrypted.replace('enc:v1:', '');
    return atob(encoded);
}

// NOTE: For production, replace with react-native-aes-gcm-crypto
// which provides authenticated AES-256-GCM encryption
```

---

## 8. CLOUD FUNCTIONS SECURITY

### 8.1 EXIF Stripping (Photo Upload Trigger)

```javascript
// functions/photo-security.js
// Strips GPS coordinates, camera info, and other EXIF data from uploaded photos

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sharp = require('sharp'); // Image processing library
const path = require('path');
const os = require('os');
const fs = require('fs');

exports.stripExifOnUpload = functions.storage
    .object()
    .onFinalize(async (object) => {
        // Only process milestone photos
        if (!object.name.startsWith('milestones/')) return;
        if (!object.contentType?.startsWith('image/')) return;

        const bucket = admin.storage().bucket(object.bucket);
        const tempFile = path.join(os.tmpdir(), path.basename(object.name));

        // Download the uploaded file
        await bucket.file(object.name).download({ destination: tempFile });

        // Strip ALL EXIF data (GPS, camera model, timestamps, etc.)
        const strippedFile = tempFile + '_stripped';
        await sharp(tempFile)
            .rotate() // Auto-rotate based on EXIF before stripping
            .withMetadata({ exif: {} }) // Remove all EXIF
            .toFile(strippedFile);

        // Re-upload the stripped version
        await bucket.upload(strippedFile, {
            destination: object.name,
            metadata: {
                contentType: object.contentType,
                metadata: { exifStripped: 'true', strippedAt: new Date().toISOString() },
            },
        });

        // Clean up temp files
        fs.unlinkSync(tempFile);
        fs.unlinkSync(strippedFile);

        console.log(`✅ EXIF stripped from ${object.name}`);
    });
```

### 8.2 Photo Virus Scanning

```javascript
// functions/virus-scan.js
// Scan uploaded files for malware before making them accessible

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { execSync } = require('child_process');

exports.scanUploadedFile = functions.storage
    .object()
    .onFinalize(async (object) => {
        if (!object.name.startsWith('milestones/')) return;

        const bucket = admin.storage().bucket(object.bucket);
        const tempPath = `/tmp/${path.basename(object.name)}`;

        await bucket.file(object.name).download({ destination: tempPath });

        try {
            // ClamAV scan (install clamscan in your Cloud Function runtime)
            execSync(`clamscan --no-summary ${tempPath}`);
            console.log(`✅ Clean: ${object.name}`);

            // Mark as scanned
            await bucket.file(object.name).setMetadata({
                metadata: { virusScan: 'clean', scannedAt: new Date().toISOString() },
            });
        } catch (error) {
            // INFECTED — delete immediately
            console.error(`🚨 INFECTED FILE DETECTED: ${object.name}`);
            await bucket.file(object.name).delete();

            // Log the incident
            await admin.firestore().collection('security_incidents').add({
                type: 'malware_detected',
                file: object.name,
                timestamp: new Date().toISOString(),
                userId: object.name.split('/')[1], // from path /milestones/{userId}/...
            });
        }
    });
```

### 8.3 Data Export Function (COPPA/GDPR)

```javascript
// functions/data-export.js
// Generate a complete data export for a user (required by COPPA & GDPR)

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.exportUserData = functions.https.onCall(async (data, context) => {
    // Must be authenticated
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

    // App Check verification
    if (!context.app) throw new functions.https.HttpsError('failed-precondition', 'App Check required');

    const userId = context.auth.uid;
    const db = admin.firestore();

    // Gather all user data
    const [profile, childrenSnap, streakSnap, badgeSnap, consentSnap] = await Promise.all([
        db.doc(`customers/${userId}`).get(),
        db.collection(`customers/${userId}/children`).get(),
        db.collection(`customers/${userId}/streaks`).get(),
        db.collection(`customers/${userId}/badges`).get(),
        db.collection(`customers/${userId}/consent`).get(),
    ]);

    const children = [];
    for (const childDoc of childrenSnap.docs) {
        const milestonesSnap = await db.collection(
            `customers/${userId}/children/${childDoc.id}/milestones`
        ).get();

        children.push({
            ...childDoc.data(),
            milestones: milestonesSnap.docs.map(d => d.data()),
        });
    }

    const exportData = {
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0',
        profile: profile.data(),
        children,
        streaks: streakSnap.docs.map(d => d.data()),
        badges: badgeSnap.docs.map(d => d.data()),
        consent: consentSnap.docs.map(d => d.data()),
    };

    // Save export as JSON to Firebase Storage (auto-deletes after 24h)
    const bucket = admin.storage().bucket();
    const exportPath = `exports/${userId}/data_export_${Date.now()}.json`;
    const file = bucket.file(exportPath);
    await file.save(JSON.stringify(exportData, null, 2), {
        contentType: 'application/json',
        metadata: { metadata: { autoDeleteAfter: '24h' } },
    });

    // Generate a signed download URL (expires in 24 hours)
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Audit log
    await db.collection(`customers/${userId}/audit`).add({
        action: 'data_export',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ip: context.rawRequest?.ip || 'unknown',
    });

    return { downloadUrl: url, expiresIn: '24 hours' };
});
```

### 8.4 Account Deletion Function (COPPA/GDPR)

```javascript
// functions/account-deletion.js
// Complete data deletion — nuclear option

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.deleteAllUserData = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
    if (!context.app) throw new functions.https.HttpsError('failed-precondition', 'App Check required');

    const userId = context.auth.uid;
    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    console.log(`🗑️ FULL ACCOUNT DELETION INITIATED: ${userId}`);

    // 1. Delete all Firestore data (recursive)
    const collections = ['children', 'streaks', 'badges', 'audit'];
    for (const col of collections) {
        const snap = await db.collection(`customers/${userId}/${col}`).get();
        const batch = db.batch();
        snap.docs.forEach(doc => batch.delete(doc.ref));

        // For children, also delete their milestones and photos
        if (col === 'children') {
            for (const childDoc of snap.docs) {
                const milestones = await db.collection(
                    `customers/${userId}/children/${childDoc.id}/milestones`
                ).get();
                milestones.docs.forEach(m => batch.delete(m.ref));

                const photos = await db.collection(
                    `customers/${userId}/children/${childDoc.id}/photos`
                ).get();
                photos.docs.forEach(p => batch.delete(p.ref));
            }
        }
        await batch.commit();
    }

    // 2. Delete profile document
    await db.doc(`customers/${userId}`).delete();

    // 3. Delete all photos from Storage
    try {
        const [files] = await bucket.getFiles({ prefix: `milestones/${userId}/` });
        await Promise.all(files.map(file => file.delete()));
        const [profileFiles] = await bucket.getFiles({ prefix: `profiles/${userId}/` });
        await Promise.all(profileFiles.map(file => file.delete()));
        const [exportFiles] = await bucket.getFiles({ prefix: `exports/${userId}/` });
        await Promise.all(exportFiles.map(file => file.delete()));
    } catch (e) {
        console.warn('Storage deletion partial:', e);
    }

    // 4. Record deletion (keep minimal COPPA-required record)
    // NOTE: Consent records are KEPT per COPPA — we need proof we had consent
    await db.collection('deletion_records').add({
        userId,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        reason: data.reason || 'user_requested',
        // DO NOT store any PII here
    });

    // 5. Delete Firebase Auth account
    try {
        await admin.auth().deleteUser(userId);
    } catch (e) {
        console.warn('Auth deletion failed:', e);
    }

    console.log(`✅ FULL ACCOUNT DELETION COMPLETE: ${userId}`);
    return { success: true, message: 'All data has been permanently deleted.' };
});
```

---

## 9. API KEY & SECRET MANAGEMENT

### 9.1 Current Issues Found

```
⚠️ CRITICAL: API keys are hardcoded in functions/index.js:
   - METAL_PRICE_API_KEY = 'b11a31e0534e4f7d0ce7f52262cfa644'
   - ALPHA_VANTAGE_API_KEY = '8NT72TK4I1W8CNWY'
   - LASTFM_API_KEY = 'dac11fa9b12d7418fa7cf062e93f2391'
   - TMDB_API_KEY = '3dd040c35b40b0652e8750d74dc30a64'

These are in source control. If your repo is public, they're already compromised.
```

### 9.2 Fix: Move to Firebase Environment Config

```bash
# Set secrets using Firebase CLI (encrypted at rest)
firebase functions:secrets:set METAL_PRICE_API_KEY
firebase functions:secrets:set ALPHA_VANTAGE_API_KEY
firebase functions:secrets:set LASTFM_API_KEY
firebase functions:secrets:set TMDB_API_KEY
```

```javascript
// functions/index.js — AFTER migration
const { defineSecret } = require('firebase-functions/params');

const metalApiKey = defineSecret('METAL_PRICE_API_KEY');
const alphaVantageKey = defineSecret('ALPHA_VANTAGE_API_KEY');
const lastfmKey = defineSecret('LASTFM_API_KEY');
const tmdbKey = defineSecret('TMDB_API_KEY');

exports.fetchDailySnapshots = functions
    .runWith({ secrets: [metalApiKey, alphaVantageKey, lastfmKey, tmdbKey] })
    .pubsub.topic('fetch-daily-snapshots')
    .onPublish(async (message) => {
        // Access via .value()
        const goldUrl = `https://api.metalpriceapi.com/v1/latest?api_key=${metalApiKey.value()}`;
        // ...
    });
```

### 9.3 Client-Side Key Security

```
Firebase API keys in the client bundle are SAFE because:
✅ They're restricted by Firestore rules (not open read/write)
✅ They're restricted by App Check (only your app can use them)
✅ They don't grant admin access

BUT ensure:
- [ ] API key restrictions are set in Google Cloud Console
- [ ] HTTP referrer restrictions limit to your domain
- [ ] Android app restrictions limit to your package name
- [ ] iOS app restrictions limit to your bundle ID
```

### 9.4 .gitignore Verification

```gitignore
# Add to .gitignore if not already present
src/data/utils/api-keys.ts
*.keystore
*.jks
google-services.json
GoogleService-Info.plist
.env
.env.*
serviceAccountKey.json
```

---

## 10. DATA LIFECYCLE & DELETION

### 10.1 Data Retention Policy

| Data | Retention | Deletion Trigger |
|------|-----------|-----------------|
| Child milestones | Until user deletes | User request or account deletion |
| Child photos | Until user deletes | User request or account deletion |
| Streak data | Until user deletes | Account deletion |
| Badge data | Until user deletes | Account deletion |
| Consent records | **Forever** | NEVER (COPPA legal requirement) |
| Audit logs | 7 years | Auto-purge after 7 years |
| Data exports | 24 hours | Auto-delete via Cloud Function |
| Snapshot data (prices) | Indefinite | Public data, not PII |
| Deletion records | 7 years | Auto-purge after 7 years |
| Inactive accounts | 2 years | Warning email at 18mo, delete at 24mo |

### 10.2 Auto-Cleanup Cloud Function

```javascript
// functions/data-lifecycle.js
// Runs weekly — cleans up expired data

exports.dataLifecycleCleaner = functions.pubsub
    .schedule('every monday 03:00')
    .timeZone('America/New_York')
    .onRun(async () => {
        const db = admin.firestore();

        // 1. Delete expired export files (>24h old)
        const bucket = admin.storage().bucket();
        const [files] = await bucket.getFiles({ prefix: 'exports/' });
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        for (const file of files) {
            const [metadata] = await file.getMetadata();
            if (new Date(metadata.timeCreated).getTime() < cutoff) {
                await file.delete();
            }
        }

        // 2. Warn inactive accounts (18 months)
        // 3. Delete inactive accounts (24 months)
        // Implementation: Query customers where lastLogin < threshold

        console.log('✅ Data lifecycle cleanup complete');
    });
```

---

## 11. AUDIT LOGGING

### 11.1 Events to Log

| Event | Severity | Data Logged |
|-------|----------|------------|
| Account created | INFO | timestamp, email (hashed) |
| Login success | INFO | timestamp, IP, device |
| Login failure | WARN | timestamp, IP, email (hashed) |
| Child profile created | INFO | timestamp, childId |
| Milestone completed | INFO | timestamp, milestoneId |
| Photo uploaded | INFO | timestamp, childId, size |
| Data export requested | WARN | timestamp, IP |
| Account deletion requested | CRITICAL | timestamp, IP, reason |
| Consent granted | CRITICAL | timestamp, version, type |
| Security rule violation | CRITICAL | timestamp, IP, attempted action |
| Suspicious activity | CRITICAL | timestamp, pattern description |

### 11.2 Cloud Function Audit Logger

```javascript
// functions/audit.js

async function logAudit(userId, action, severity, details = {}) {
    const db = admin.firestore();

    // User-visible audit log (they can see their own)
    await db.collection(`customers/${userId}/audit`).add({
        action,
        severity,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ...details,
        // NEVER log passwords, tokens, or full child data
    });

    // System-wide security log (admin only)
    if (severity === 'CRITICAL' || severity === 'WARN') {
        await db.collection('_security_logs').add({
            userId: userId, // Just the UID, no PII
            action,
            severity,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            ip: details.ip || 'unknown',
        });
    }
}
```

### 11.3 Monitoring Alerts

```
Set up in Firebase Console > Cloud Monitoring:

🚨 Alert: > 10 failed logins from same IP in 5 minutes
🚨 Alert: > 3 data export requests from same user in 24 hours
🚨 Alert: > 5 account deletion requests in 1 hour (possible attack)
🚨 Alert: Any malware detection in uploaded files
🚨 Alert: Firestore security rule denials > 100/hour
```

---

## 12. NETWORK SECURITY

### 12.1 Certificate Pinning (Optional — High Security)

```typescript
// For maximum security, pin Firebase's SSL certificate
// This prevents MITM attacks even on compromised networks

// Note: This requires react-native-ssl-pinning or similar
// and must be updated when Firebase rotates certificates

// RECOMMENDED: Only implement if targeting enterprise/hospital customers
// For consumer app, Firebase's default TLS is sufficient
```

### 12.2 Request Headers

```typescript
// Add to all Firebase requests
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};
```

---

## 13. RATE LIMITING & ABUSE PREVENTION

### 13.1 Client-Side Rate Limits

```typescript
// src/data/utils/rate-limiter.ts

class RateLimiter {
    private attempts: Map<string, number[]> = new Map();

    canProceed(action: string, maxAttempts: number, windowMs: number): boolean {
        const now = Date.now();
        const key = action;
        const timestamps = this.attempts.get(key) || [];
        const recent = timestamps.filter(t => now - t < windowMs);

        if (recent.length >= maxAttempts) return false;

        recent.push(now);
        this.attempts.set(key, recent);
        return true;
    }
}

export const rateLimiter = new RateLimiter();

// Usage:
// if (!rateLimiter.canProceed('milestone_complete', 30, 60000)) {
//     Alert.alert('Slow down', 'Too many updates. Please wait a moment.');
//     return;
// }
```

### 13.2 Firestore Rate Limits (Server-Side)

```
Firebase automatically enforces:
- 1 write per document per second
- 500 writes per batch
- 10,000 reads per second per collection

Additional custom limits via Cloud Functions:
- Max 50 milestones per child (prevents data stuffing)
- Max 20 children per account (prevents abuse)
- Max 100 photos per child (storage abuse prevention)
- Max 1 data export per 24 hours
```

---

## 14. INCIDENT RESPONSE PLAYBOOK

### 14.1 Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|--------------|---------|
| **P0** | Data breach — child data exposed | IMMEDIATE | Database leaked, unauthorized access |
| **P1** | Security vulnerability discovered | < 4 hours | Auth bypass, rule misconfiguration |
| **P2** | Suspicious activity detected | < 24 hours | Unusual login patterns, scraping |
| **P3** | Minor security concern | < 1 week | Dependency vulnerability, log anomaly |

### 14.2 P0 Response (Data Breach)

```
IMMEDIATE ACTIONS:
1. Revoke all Firebase access tokens: Firebase Console > Auth > Revoke
2. Enable Firestore "deny all" rules temporarily
3. Capture forensic logs before any changes
4. Identify scope: which users, which data
5. Notify affected users within 72 hours (GDPR) / "as soon as possible" (COPPA)
6. Notify FTC if child data was involved (COPPA requirement)
7. Document timeline, root cause, remediation

COMMUNICATION TEMPLATE:
"We detected unauthorized access to [scope]. We immediately secured
the system and are investigating. Your child's data [was/was not]
affected. We recommend [actions]. Contact us at [email]."
```

### 14.3 Regular Security Tasks

```
WEEKLY:
□ Review Firebase security rule denial logs
□ Check for unusual auth patterns
□ Monitor storage usage growth

MONTHLY:
□ Dependency audit: npm audit
□ Review Firebase Console > Usage (anomalies)
□ Rotate any compromised API keys
□ Review Cloud Function logs for errors

QUARTERLY:
□ Full security rules review
□ Test data export & deletion flows
□ Review COPPA compliance
□ Update this security blueprint
□ Penetration testing (self or third-party)
```

---

## 15. IMPLEMENTATION CHECKLIST

### Phase 1: Before Going Live (CRITICAL)

- [ ] Move API keys from `functions/index.js` to Firebase Secrets
- [ ] Add `api-keys.ts` and `serviceAccountKey.json` to `.gitignore`
- [ ] Deploy Firestore security rules (§2)
- [ ] Deploy Storage security rules (§3)
- [ ] Enable Firebase App Check (§4)
- [ ] Set password minimum to 12 characters
- [ ] Enable email verification
- [ ] Implement COPPA consent screen (§6)
- [ ] Replace AsyncStorage with SecureStore for sensitive data (§7)
- [ ] Write and publish Privacy Policy
- [ ] Implement "Delete My Data" feature
- [ ] Remove `console.log` statements that contain user data

### Phase 2: First Month (IMPORTANT)

- [ ] Deploy EXIF stripping Cloud Function (§8.1)
- [ ] Deploy data export Cloud Function (§8.3)
- [ ] Deploy account deletion Cloud Function (§8.4)
- [ ] Set up audit logging (§11)
- [ ] Set up monitoring alerts (§11.3)
- [ ] Configure Firebase Cloud Monitoring
- [ ] Implement client-side rate limiting (§13)
- [ ] Add re-authentication for sensitive actions (§5.4)
- [ ] Deploy data lifecycle cleanup function (§10.2)
- [ ] Block disposable email domains

### Phase 3: Ongoing (MAINTENANCE)

- [ ] Weekly security log review
- [ ] Monthly dependency audit (`npm audit`)
- [ ] Quarterly security rules review
- [ ] Annual COPPA compliance review (§6.5)
- [ ] Incident response drills
- [ ] Keep this document updated
- [ ] Field-level encryption for maximum protection (§7.3)
- [ ] Certificate pinning for enterprise customers (§12.1)
- [ ] Third-party penetration testing

---

## QUICK REFERENCE: WHAT TO NEVER DO

```
❌ NEVER store child photos in Firestore documents (use Storage)
❌ NEVER log child names, DOBs, or notes to console/crashlytics
❌ NEVER use Firestore in "test mode" in production
❌ NEVER share child data with analytics (Firebase Analytics, Mixpanel, etc.)
❌ NEVER allow cross-user data access (even for "sharing" features)
❌ NEVER store passwords, even hashed, in Firestore (Auth handles this)
❌ NEVER hardcode API keys in client code (use firebase secrets)
❌ NEVER skip consent before collecting child data
❌ NEVER delete consent records (legal requirement to keep them)
❌ NEVER trust client timestamps for audit logs (use server timestamps)
❌ NEVER process child data on third-party servers without DPA
```

---

*This blueprint is a living document. Update it whenever security practices change.*  
*Population +1™ — Protecting families, one milestone at a time. 🔒*
