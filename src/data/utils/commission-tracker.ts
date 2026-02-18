/**
 * Commission Tracker for PopulationPlusOne
 * ==========================================
 * 
 * Tracks all commission/revenue events locally using AsyncStorage.
 * In production, this should sync to a backend (Firebase, etc.) for
 * real-time dashboards and accounting.
 * 
 * Two types of commissions tracked:
 * 
 * 1. PRINT ORDERS (retail markup)
 *    - Customer pays our retail price
 *    - We pay Printful wholesale price
 *    - Commission = retail − wholesale − shipping
 * 
 * 2. GIFT AFFILIATES (referral commissions)
 *    - Customer clicks our affiliate link to buy a gift
 *    - Platform (Amazon, Etsy, etc.) pays us a % of the sale
 *    - We log the click; actual commission confirmed by the platform
 * 
 * SWITCH: All tracking respects FEATURE_FLAGS.COMMISSION_TRACKING_ENABLED
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FEATURE_FLAGS } from './affiliate-config';

// ============================================================
// TYPES
// ============================================================

export type CommissionType = 'print_markup' | 'gift_affiliate';

export type CommissionStatus =
    | 'pending'      // Order placed, awaiting fulfillment
    | 'confirmed'    // Order fulfilled / affiliate sale confirmed
    | 'paid'         // Commission received in our account
    | 'cancelled'    // Order cancelled or returned
    | 'clicked';     // Affiliate link clicked (gift), awaiting conversion

export interface CommissionRecord {
    /** Unique ID for this commission event */
    id: string;
    /** When this event occurred */
    timestamp: string; // ISO date string
    /** Type of commission */
    type: CommissionType;
    /** Current status */
    status: CommissionStatus;

    // ─── Order details ───
    /** What was ordered (e.g., 'POSTER_18X24', 'gift-blanket') */
    productId: string;
    /** Human-readable product name */
    productName: string;
    /** Quantity ordered */
    quantity: number;

    // ─── Financial details ───
    /** What the customer paid us (retail price × quantity) */
    retailTotal: number;
    /** What we paid the vendor (wholesale × quantity) — 0 for gifts */
    wholesaleCost: number;
    /** Shipping cost we absorbed (if any) */
    shippingCost: number;
    /** Our commission/margin on this transaction */
    commission: number;

    // ─── Source tracking ───
    /** Which platform fulfilled this ('printful', 'fedex', 'amazon', 'etsy', etc.) */
    platform: string;
    /** External order ID from the platform (Printful order ID, etc.) */
    externalOrderId?: string;
    /** Which app mode the customer was in */
    appMode?: string;
    /** Baby/person name (for reference) */
    recipientName?: string;
}

// Storage key
const STORAGE_KEY = '@populationplusone/commissions';

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Generate a unique commission ID
 */
function generateId(): string {
    return `comm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Get all commission records from local storage
 */
export async function getAllCommissions(): Promise<CommissionRecord[]> {
    try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : [];
    } catch (error) {
        console.error('[CommissionTracker] Failed to read commissions:', error);
        return [];
    }
}

/**
 * Save all commission records to local storage
 */
async function saveCommissions(records: CommissionRecord[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
        console.error('[CommissionTracker] Failed to save commissions:', error);
    }
}

/**
 * Log a PRINT ORDER commission (retail markup).
 * Called when a customer completes a print order.
 */
export async function logPrintCommission(params: {
    productId: string;
    productName: string;
    quantity: number;
    retailTotal: number;
    wholesaleCost: number;
    shippingCost?: number;
    platform: 'printful' | 'fedex' | 'staples' | 'ups_store' | 'other';
    externalOrderId?: string;
    appMode?: string;
    recipientName?: string;
}): Promise<CommissionRecord | null> {
    if (!FEATURE_FLAGS.COMMISSION_TRACKING_ENABLED) {
        console.log('[CommissionTracker] Tracking OFF — would log print commission:', params.productName);
        return null;
    }

    const commission = params.retailTotal - params.wholesaleCost - (params.shippingCost || 0);

    const record: CommissionRecord = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'print_markup',
        status: 'pending',
        productId: params.productId,
        productName: params.productName,
        quantity: params.quantity,
        retailTotal: params.retailTotal,
        wholesaleCost: params.wholesaleCost,
        shippingCost: params.shippingCost || 0,
        commission,
        platform: params.platform,
        externalOrderId: params.externalOrderId,
        appMode: params.appMode,
        recipientName: params.recipientName,
    };

    const existing = await getAllCommissions();
    existing.push(record);
    await saveCommissions(existing);

    console.log(`[CommissionTracker] 🖨️ Print commission logged: $${commission.toFixed(2)} on ${params.productName}`);
    return record;
}

/**
 * Log a GIFT AFFILIATE click.
 * Called when a customer taps a gift affiliate link.
 * Actual commission is confirmed later by the affiliate platform.
 */
export async function logGiftAffiliateClick(params: {
    productId: string;
    productName: string;
    platform: 'amazon' | 'babylist' | 'etsy' | 'target';
    estimatedCommissionRate: number;
    estimatedProductPrice?: number;
    appMode?: string;
    recipientName?: string;
}): Promise<CommissionRecord | null> {
    if (!FEATURE_FLAGS.COMMISSION_TRACKING_ENABLED) {
        console.log('[CommissionTracker] Tracking OFF — would log gift click:', params.productName);
        return null;
    }

    const estimatedCommission = params.estimatedProductPrice
        ? params.estimatedProductPrice * params.estimatedCommissionRate
        : 0;

    const record: CommissionRecord = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'gift_affiliate',
        status: 'clicked',
        productId: params.productId,
        productName: params.productName,
        quantity: 1,
        retailTotal: params.estimatedProductPrice || 0,
        wholesaleCost: 0, // We don't pay anything for affiliate clicks
        shippingCost: 0,
        commission: estimatedCommission,
        platform: params.platform,
        appMode: params.appMode,
        recipientName: params.recipientName,
    };

    const existing = await getAllCommissions();
    existing.push(record);
    await saveCommissions(existing);

    console.log(`[CommissionTracker] 🎁 Gift affiliate click logged: ${params.platform} — ${params.productName}`);
    return record;
}

/**
 * Update the status of a commission record (e.g., pending → confirmed → paid)
 */
export async function updateCommissionStatus(
    commissionId: string,
    newStatus: CommissionStatus,
    updates?: Partial<Pick<CommissionRecord, 'commission' | 'externalOrderId' | 'wholesaleCost' | 'shippingCost'>>
): Promise<boolean> {
    const records = await getAllCommissions();
    const index = records.findIndex(r => r.id === commissionId);

    if (index === -1) return false;

    records[index].status = newStatus;

    // Apply any financial updates (e.g., actual wholesale cost from Printful)
    if (updates) {
        if (updates.commission !== undefined) records[index].commission = updates.commission;
        if (updates.externalOrderId !== undefined) records[index].externalOrderId = updates.externalOrderId;
        if (updates.wholesaleCost !== undefined) {
            records[index].wholesaleCost = updates.wholesaleCost;
            // Recalculate commission with actual wholesale cost
            records[index].commission =
                records[index].retailTotal - updates.wholesaleCost - records[index].shippingCost;
        }
        if (updates.shippingCost !== undefined) {
            records[index].shippingCost = updates.shippingCost;
            records[index].commission =
                records[index].retailTotal - records[index].wholesaleCost - updates.shippingCost;
        }
    }

    await saveCommissions(records);
    console.log(`[CommissionTracker] Updated ${commissionId} → ${newStatus}`);
    return true;
}

// ============================================================
// REPORTING / SUMMARY
// ============================================================

export interface CommissionSummary {
    totalOrders: number;
    totalRevenue: number;
    totalWholesale: number;
    totalShipping: number;
    totalCommission: number;
    pendingCommission: number;
    confirmedCommission: number;
    paidCommission: number;
    printOrders: number;
    giftClicks: number;
    byPlatform: Record<string, { orders: number; commission: number }>;
}

/**
 * Get a summary of all commission activity.
 */
export async function getCommissionSummary(): Promise<CommissionSummary> {
    const records = await getAllCommissions();

    const summary: CommissionSummary = {
        totalOrders: records.length,
        totalRevenue: 0,
        totalWholesale: 0,
        totalShipping: 0,
        totalCommission: 0,
        pendingCommission: 0,
        confirmedCommission: 0,
        paidCommission: 0,
        printOrders: 0,
        giftClicks: 0,
        byPlatform: {},
    };

    for (const record of records) {
        summary.totalRevenue += record.retailTotal;
        summary.totalWholesale += record.wholesaleCost;
        summary.totalShipping += record.shippingCost;
        summary.totalCommission += record.commission;

        if (record.status === 'pending' || record.status === 'clicked') {
            summary.pendingCommission += record.commission;
        } else if (record.status === 'confirmed') {
            summary.confirmedCommission += record.commission;
        } else if (record.status === 'paid') {
            summary.paidCommission += record.commission;
        }

        if (record.type === 'print_markup') summary.printOrders++;
        if (record.type === 'gift_affiliate') summary.giftClicks++;

        // By platform
        if (!summary.byPlatform[record.platform]) {
            summary.byPlatform[record.platform] = { orders: 0, commission: 0 };
        }
        summary.byPlatform[record.platform].orders++;
        summary.byPlatform[record.platform].commission += record.commission;
    }

    return summary;
}

/**
 * Get commission records filtered by date range
 */
export async function getCommissionsByDateRange(
    startDate: Date,
    endDate: Date
): Promise<CommissionRecord[]> {
    const records = await getAllCommissions();
    return records.filter(r => {
        const date = new Date(r.timestamp);
        return date >= startDate && date <= endDate;
    });
}

/**
 * Clear all commission records (for testing/reset)
 */
export async function clearAllCommissions(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[CommissionTracker] All commission records cleared');
}

export default {
    logPrintCommission,
    logGiftAffiliateClick,
    updateCommissionStatus,
    getAllCommissions,
    getCommissionSummary,
    getCommissionsByDateRange,
    clearAllCommissions,
};
