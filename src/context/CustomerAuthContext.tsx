import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../data/utils/firebase-config';

// ─── Future-Proof Customer Profile ───────────────────────────────
// Designed to support: keepsake storage, milestone vault, registry,
// photo/video storage, grandparent sharing — all down the road.

export interface CustomerProfile {
    uid: string;
    email: string;
    displayName: string;
    createdAt: string;

    // V1: Basic info
    phone?: string;

    // V1.5: Saved keepsakes (digital copies of purchases)
    keepsakeCount?: number;

    // V2: Milestone tracking
    children?: ChildProfile[];

    // V3: Photo/video vault
    storageUsedBytes?: number;
    storageMaxBytes?: number; // 5GB free = 5_368_709_120

    // V4: Registry & gifting
    registryId?: string;
    registryUrl?: string;
}

export interface ChildProfile {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO
    photoUri?: string;
    milestones?: MilestoneEntry[];
}

export interface MilestoneEntry {
    id: string;
    type: string; // 'first_smile', 'first_steps', 'first_birthday', etc.
    date: string; // ISO
    note?: string;
    photoUri?: string;
    keepsakeId?: string; // linked to a purchased keepsake
}

// ─── Auth Context ────────────────────────────────────────────────

interface CustomerAuthContextType {
    user: User | null;
    profile: CustomerProfile | null;
    isLoading: boolean;
    isLoggedIn: boolean;

    // Auth actions
    signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
    logIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const CustomerAuthProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        if (!auth) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser && db) {
                // Load profile from Firestore
                try {
                    const profileDoc = await getDoc(doc(db, 'customers', firebaseUser.uid));
                    if (profileDoc.exists()) {
                        setProfile(profileDoc.data() as CustomerProfile);
                    }
                } catch (error) {
                    console.warn('⚠️ Could not load customer profile:', error);
                }
            } else {
                setProfile(null);
            }

            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    // ─── Sign Up ─────────────────────────────────────────────────

    const signUp = async (email: string, password: string, displayName: string) => {
        if (!auth) return { success: false, error: 'Account system not configured yet' };

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName });

            // Create customer profile in Firestore
            const newProfile: CustomerProfile = {
                uid: result.user.uid,
                email,
                displayName,
                createdAt: new Date().toISOString(),
                keepsakeCount: 0,
                storageUsedBytes: 0,
                storageMaxBytes: 5_368_709_120, // 5GB free
                children: [],
            };

            if (db) {
                await setDoc(doc(db, 'customers', result.user.uid), newProfile);
                setProfile(newProfile);
            }

            console.log('✅ Customer account created:', email);
            return { success: true };
        } catch (error: any) {
            console.warn('❌ Sign up failed:', error.message);

            // Friendly error messages
            const code = error.code || '';
            if (code === 'auth/email-already-in-use') {
                return { success: false, error: 'An account with this email already exists. Try logging in.' };
            }
            if (code === 'auth/weak-password') {
                return { success: false, error: 'Password must be at least 6 characters.' };
            }
            if (code === 'auth/invalid-email') {
                return { success: false, error: 'Please enter a valid email address.' };
            }
            return { success: false, error: error.message || 'Sign up failed. Please try again.' };
        }
    };

    // ─── Log In ──────────────────────────────────────────────────

    const logIn = async (email: string, password: string) => {
        if (!auth) return { success: false, error: 'Account system not configured yet' };

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ Customer logged in:', email);
            return { success: true };
        } catch (error: any) {
            console.warn('❌ Login failed:', error.message);

            const code = error.code || '';
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                return { success: false, error: 'Invalid email or password.' };
            }
            if (code === 'auth/too-many-requests') {
                return { success: false, error: 'Too many attempts. Please try again later.' };
            }
            return { success: false, error: error.message || 'Login failed. Please try again.' };
        }
    };

    // ─── Log Out ─────────────────────────────────────────────────

    const logOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            setProfile(null);
            console.log('✅ Customer logged out');
        } catch (error) {
            console.warn('❌ Logout failed:', error);
        }
    };

    // ─── Reset Password ─────────────────────────────────────────

    const resetPassword = async (email: string) => {
        if (!auth) return { success: false, error: 'Account system not configured yet' };

        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: 'Could not send reset email. Check your email address.' };
        }
    };

    // ─── Provider ────────────────────────────────────────────────

    const value: CustomerAuthContextType = {
        user,
        profile,
        isLoading,
        isLoggedIn: user !== null,
        signUp,
        logIn,
        logOut,
        resetPassword,
    };

    return (
        <CustomerAuthContext.Provider value={value}>
            {children}
        </CustomerAuthContext.Provider>
    );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
    const context = useContext(CustomerAuthContext);
    if (context === undefined) {
        throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
    }
    return context;
};

export default CustomerAuthContext;
