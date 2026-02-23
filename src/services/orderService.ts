// src/services/orderService.ts
// Firebase order record service for tracking print orders

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../data/utils/firebase-config';

export type OrderRecord = {
    orderId: string;
    status: 'pending' | 'processing' | 'printed' | 'shipped' | 'delivered';
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    shipping: {
        address1: string;
        address2?: string;
        city: string;
        state: string;
        zipCode: string;
    };
    items: Array<{
        id: string;
        name: string;
        description?: string;
        quantity: number;
        price: number;
    }>;
    pricing: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    termsAccepted: boolean;
    termsAcceptedAt: string; // ISO timestamp
    createdAt: any; // Firestore server timestamp
};

/**
 * Save an order record to Firebase Firestore.
 * Called after successful payment (or during beta, after form validation).
 * Returns the Firestore document ID on success, null on failure.
 */
export async function saveOrderRecord(order: OrderRecord): Promise<string | null> {
    try {
        if (!db) {
            console.warn('⚠️ Firestore not available — order record not saved');
            return null;
        }

        const docRef = await addDoc(collection(db, 'orders'), {
            ...order,
            createdAt: serverTimestamp(),
        });

        console.log('✅ Order saved to Firestore:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Failed to save order record:', error);
        // Don't block the order flow — the order still went through
        return null;
    }
}
