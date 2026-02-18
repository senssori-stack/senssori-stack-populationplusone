// src/data/utils/firebase-config.ts
// Firebase configuration for snapshot data fetching

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './api-keys';

// Initialize Firebase with your credentials
let app: any;
let db: any;

try {
    const firebaseConfig = {
        apiKey: FIREBASE_CONFIG.apiKey,
        authDomain: FIREBASE_CONFIG.authDomain,
        projectId: FIREBASE_CONFIG.projectId,
        storageBucket: FIREBASE_CONFIG.storageBucket,
        messagingSenderId: FIREBASE_CONFIG.messagingSenderId,
        appId: FIREBASE_CONFIG.appId,
    };

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully with project:', FIREBASE_CONFIG.projectId);
} catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error);
    console.warn('The app will fall back to local snapshot data');
}

const auth = null; // Auth placeholder - initialize when needed
export { app, auth, db };

