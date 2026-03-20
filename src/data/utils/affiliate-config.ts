/**
 * Affiliate & Commission Configuration for PopulationPlusOne
 * ============================================================
 * 
 * MASTER FEATURE FLAGS — All switches OFF until ready to go live.
 * 
 * HOW THE APP EARNS ON PRINTING:
 * ──────────────────────────────
 * Printful is a print-on-demand fulfillment partner, NOT a traditional affiliate.
 * Revenue comes from the RETAIL MARKUP — the spread between what we charge the
 * customer and what Printful charges us (their wholesale/base price).
 * 
 * Example:
 *   Printful charges us:  $8.95 (18×24 poster, wholesale)
 *   We charge customer:  $24.99 (our retail price)
 *   Our margin:          $16.04 per order
 * 
 * HOW THE APP EARNS ON GIFTING:
 * ─────────────────────────────
 * When a customer sends a birth announcement (via mail, social, or hand-delivery),
 * they can optionally attach a gift recommendation. If the recipient (or sender)
 * buys the gift through our affiliate link, we earn a commission.
 * 
 * Affiliate Program:
 *   • Amazon Associates — ~4% on baby products (ACTIVE)
 *
 * SETUP:
 * ──────
 * 1. PRINTFUL (retail markup — already connected):
 *    - Dashboard: https://www.printful.com/dashboard
 *    - API token already in printful-api.ts
 *    - Set retail prices in PRINT_PRICING below
 *
 * 2. AMAZON ASSOCIATES (gift affiliate — ACTIVE):
 *    - Dashboard: https://affiliate-program.amazon.com/
 *    - Associate Tag: populationplu-20
 *    - Link format: https://www.amazon.com/dp/ASIN?tag=populationplu-20
 *    - Commission: ~1-4% depending on category
 *    - Baby products: 3-4%
 *    - 24-hour cookie: earn on EVERYTHING they buy in 24 hours
 */

// ============================================================
// MASTER FEATURE FLAGS — All OFF until ready
// ============================================================

export const FEATURE_FLAGS = {
    /** Enable Printful print ordering (retail markup model) */
    PRINTING_ENABLED: true,

    /** Enable gifting affiliate links (Amazon, Babylist, etc.) */
    GIFTING_ENABLED: true,

    /** Enable commission tracking/logging locally */
    COMMISSION_TRACKING_ENABLED: true,

    /** Show print prices to customers (false = show "Coming Soon") */
    SHOW_PRINT_PRICES: true,

    /** Show gift suggestions on sharing screens */
    SHOW_GIFT_SUGGESTIONS: true,

    /** Enable actual Printful API calls (false = mock/dry-run mode) */
    PRINTFUL_LIVE_MODE: false,

    /** Enable actual affiliate link redirects (false = log only) */
    AFFILIATE_LINKS_LIVE: true,
};

// ============================================================
// AFFILIATE IDS — Fill in when accounts are approved
// ============================================================

export const AFFILIATE_IDS = {
    /** Amazon Associates tag — ACTIVE */
    AMAZON: 'populationplu-20',

    /** FedEx Office affiliate ID (for local pickup referrals) */
    FEDEX: 'BIRTHSTUDIO',
};

// ============================================================
// COMMISSION RATES — What we earn on each channel
// ============================================================

export const COMMISSION_RATES = {
    // ─── PRINTING (our retail markup) ───
    PRINTING: {
        /** Our markup percentage over Printful wholesale cost */
        DEFAULT_MARKUP_PERCENT: 0.60, // 60% markup over wholesale
        /** Minimum margin we require per order (dollars) */
        MIN_MARGIN_DOLLARS: 5.00,
        /** Platform fee we add on top (for app maintenance) */
        PLATFORM_FEE_PERCENT: 0.00, // 0% for now
    },

    // ─── GIFTING AFFILIATES (what the programs pay us) ───
    GIFTING: {
        AMAZON: 0.04,     // ~4% on baby category
    },
};

// ============================================================
// PRINTFUL PRICING — Wholesale costs & our retail prices
// ============================================================

/**
 * Printful wholesale costs (approximate — real costs come from API at order time)
 * These are used for margin estimation before the customer places an order.
 * 
 * IMPORTANT: Always confirm actual wholesale cost via Printful API
 * estimateOrderCost() before charging the customer.
 */
export const PRINT_PRICING = {
    // ─── POSTERS ───
    'POSTER_12X18': {
        wholesaleEstimate: 7.50,    // Printful charges us ~$7.50
        retailPrice: 16.99,         // We charge customer $16.99
        estimatedMargin: 9.49,      // We keep ~$9.49 before shipping
        printfulVariant: 9699,
    },
    'POSTER_18X24': {
        wholesaleEstimate: 8.95,
        retailPrice: 24.99,
        estimatedMargin: 16.04,
        printfulVariant: 9700,
    },
    'POSTER_24X36': {
        wholesaleEstimate: 12.95,
        retailPrice: 34.99,
        estimatedMargin: 22.04,
        printfulVariant: 9879,
    },

    // ─── CANVAS ───
    'CANVAS_8X10': {
        wholesaleEstimate: 14.50,
        retailPrice: 35.99,
        estimatedMargin: 21.49,
        printfulVariant: 1642,
    },
    'CANVAS_12X12': {
        wholesaleEstimate: 18.00,
        retailPrice: 49.99,
        estimatedMargin: 31.99,
        printfulVariant: 1646,
    },
    'CANVAS_16X20': {
        wholesaleEstimate: 22.00,
        retailPrice: 79.99,
        estimatedMargin: 57.99,
        printfulVariant: 1647,
    },
    'CANVAS_20X24': {
        wholesaleEstimate: 28.00,
        retailPrice: 119.99,
        estimatedMargin: 91.99,
        printfulVariant: 1649,
    },

    // ─── POSTCARDS ───
    'POSTCARD_4X6': {
        wholesaleEstimate: 1.50,    // Per card
        retailPrice: 2.99,          // Per card (sold in packs)
        estimatedMargin: 1.49,
        printfulVariant: 13882,
    },

    // ─── STICKERS ───
    'STICKER_3X3': {
        wholesaleEstimate: 2.00,
        retailPrice: 4.99,
        estimatedMargin: 2.99,
        printfulVariant: 10163,
    },
    'STICKER_4X4': {
        wholesaleEstimate: 2.50,
        retailPrice: 5.99,
        estimatedMargin: 3.49,
        printfulVariant: 10164,
    },

    // ─── YARD SIGNS (not via Printful — external fulfillment) ───
    'YARDSIGN_12X18': {
        wholesaleEstimate: 12.00,   // External vendor cost
        retailPrice: 24.99,
        estimatedMargin: 12.99,
        printfulVariant: null,      // Not a Printful product
        fulfillmentNote: 'FedEx Office or local vendor',
    },
    'YARDSIGN_18X24': {
        wholesaleEstimate: 17.00,
        retailPrice: 34.99,
        estimatedMargin: 17.99,
        printfulVariant: null,
        fulfillmentNote: 'FedEx Office or local vendor',
    },
    'YARDSIGN_24X36': {
        wholesaleEstimate: 25.00,
        retailPrice: 49.99,
        estimatedMargin: 24.99,
        printfulVariant: null,
        fulfillmentNote: 'FedEx Office or local vendor',
    },

    // ─── TRADING CARDS (not via Printful — external fulfillment) ───
    'TRADINGCARD_SINGLE': {
        wholesaleEstimate: 1.50,
        retailPrice: 4.99,
        estimatedMargin: 3.49,
        printfulVariant: null,
        fulfillmentNote: 'Specialty card printer',
    },
    'TRADINGCARD_10PACK': {
        wholesaleEstimate: 10.00,
        retailPrice: 19.99,
        estimatedMargin: 9.99,
        printfulVariant: null,
        fulfillmentNote: 'Specialty card printer',
    },
    'TRADINGCARD_25PACK': {
        wholesaleEstimate: 20.00,
        retailPrice: 39.99,
        estimatedMargin: 19.99,
        printfulVariant: null,
        fulfillmentNote: 'Specialty card printer',
    },

    // ─── FRAMED PRINTS ───
    'FRAMED_8X10': {
        wholesaleEstimate: 25.00,
        retailPrice: 54.99,
        estimatedMargin: 29.99,
        printfulVariant: null,
        fulfillmentNote: 'Printful or external framing vendor',
    },
    'FRAMED_11X14': {
        wholesaleEstimate: 32.00,
        retailPrice: 74.99,
        estimatedMargin: 42.99,
        printfulVariant: null,
        fulfillmentNote: 'Printful or external framing vendor',
    },
    'FRAMED_16X20': {
        wholesaleEstimate: 50.00,
        retailPrice: 124.99,
        estimatedMargin: 74.99,
        printfulVariant: null,
        fulfillmentNote: 'Printful or external framing vendor',
    },

    // ─── METAL PRINTS ───
    'METAL_8X10': {
        wholesaleEstimate: 20.00,
        retailPrice: 42.99,
        estimatedMargin: 22.99,
        printfulVariant: null,
        fulfillmentNote: 'Printful metal print',
    },
    'METAL_11X14': {
        wholesaleEstimate: 30.00,
        retailPrice: 64.99,
        estimatedMargin: 34.99,
        printfulVariant: null,
        fulfillmentNote: 'Printful metal print',
    },
    'METAL_16X20': {
        wholesaleEstimate: 50.00,
        retailPrice: 109.99,
        estimatedMargin: 59.99,
        printfulVariant: null,
        fulfillmentNote: 'Printful metal print',
    },

    // ─── MAGNETS ───
    'MAGNET_3X4': {
        wholesaleEstimate: 3.00,
        retailPrice: 6.99,
        estimatedMargin: 3.99,
        printfulVariant: null,
        fulfillmentNote: 'Printful or external vendor',
    },
    'MAGNET_4X6': {
        wholesaleEstimate: 4.50,
        retailPrice: 9.99,
        estimatedMargin: 5.49,
        printfulVariant: null,
        fulfillmentNote: 'Printful or external vendor',
    },
};

// ============================================================
// GIFT AFFILIATE PRODUCT SUGGESTIONS
// ============================================================

/**
 * Curated gift suggestions with affiliate links.
 * Each category maps to products that make great gifts to pair
 * with a birth announcement, birthday, graduation, etc.
 * 
 * Link format:
 *   Amazon: https://www.amazon.com/dp/{ASIN}?tag={AFFILIATE_IDS.AMAZON}
 */
export interface GiftSuggestion {
    id: string;
    name: string;
    description: string;
    emoji: string;
    priceRange: string;
    platform: 'amazon';
    /** Amazon ASIN */
    productId: string;
    /** Category for filtering */
    category: 'baby' | 'mom' | 'keepsake' | 'practical' | 'milestone' | 'memorial';
    /** Which app modes this gift is relevant for */
    modes: Array<'baby' | 'birthday' | 'graduation' | 'anniversary' | 'milestone' | 'memorial'>;
}

export const GIFT_SUGGESTIONS: GiftSuggestion[] = [
    // ─── BABY GIFTS ───
    // TODO: Replace '' productId with real Amazon ASINs
    // Find ASINs at amazon.com — the 10-char code after /dp/ in the URL
    {
        id: 'gift-blanket',
        name: 'Personalized Baby Blanket',
        description: 'Soft, embroidered with baby\'s name and birthdate',
        emoji: '🧸',
        priceRange: '$25-45',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'baby',
        modes: ['baby'],
    },
    {
        id: 'gift-memory-book',
        name: 'Baby Memory Book',
        description: 'First year milestone journal with photo pages',
        emoji: '📖',
        priceRange: '$20-35',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'keepsake',
        modes: ['baby'],
    },
    {
        id: 'gift-onesie-set',
        name: 'Monthly Milestone Onesies',
        description: '12-pack of monthly milestone number onesies',
        emoji: '👶',
        priceRange: '$15-25',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'baby',
        modes: ['baby'],
    },
    {
        id: 'gift-diaper-caddy',
        name: 'Nursery Organizer Caddy',
        description: 'Portable diaper caddy for the nursery',
        emoji: '🧺',
        priceRange: '$20-35',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'practical',
        modes: ['baby'],
    },
    {
        id: 'gift-handprint-kit',
        name: 'Baby Handprint & Footprint Kit',
        description: 'Clay impression frame kit — capture tiny hands & feet',
        emoji: '🖐️',
        priceRange: '$15-30',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'keepsake',
        modes: ['baby'],
    },
    {
        id: 'gift-night-light',
        name: 'Star Projector Night Light',
        description: 'Soothing constellation projector for the nursery',
        emoji: '🌙',
        priceRange: '$20-40',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'practical',
        modes: ['baby'],
    },

    // ─── MOM GIFTS ───
    {
        id: 'gift-mom-robe',
        name: 'Luxury Postpartum Robe',
        description: 'Soft bamboo robe perfect for new moms & nursing',
        emoji: '👗',
        priceRange: '$30-55',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'mom',
        modes: ['baby'],
    },
    // ─── BIRTHDAY GIFTS ───
    {
        id: 'gift-stress-squishy',
        name: 'Stress Relief Squishy Set',
        description: 'Fun filled squishy stress relief toys — great for all ages',
        emoji: '🧡',
        priceRange: '$10-20',
        platform: 'amazon',
        productId: 'B0DZVKP1X5',
        category: 'practical',
        modes: ['baby', 'birthday', 'graduation', 'anniversary', 'milestone'],
    },
    {
        id: 'gift-reading-glasses',
        name: 'Stylish Reading Glasses',
        description: 'Fashionable readers in tortoise — great practical gift',
        emoji: '👓',
        priceRange: '$10-20',
        platform: 'amazon',
        productId: 'B07TQJ775S',
        category: 'practical',
        modes: ['birthday', 'anniversary', 'milestone'],
    },
    {
        id: 'gift-keychain-tracker',
        name: 'Keychain Tracker Case',
        description: 'Protective silicone case for tracking — never lose your keys',
        emoji: '🔑',
        priceRange: '$5-15',
        platform: 'amazon',
        productId: 'B0DS1PX96H',
        category: 'practical',
        modes: ['baby', 'birthday', 'graduation', 'anniversary', 'milestone'],
    },
    {
        id: 'gift-trending-1',
        name: 'Trending Gift Pick',
        description: 'Top-rated gift — a great surprise for any occasion',
        emoji: '⭐',
        priceRange: '$15-30',
        platform: 'amazon',
        productId: 'B0DB794BKQ',
        category: 'practical',
        modes: ['baby', 'birthday', 'graduation', 'anniversary', 'milestone'],
    },
    {
        id: 'gift-trending-2',
        name: 'Popular Gift Find',
        description: 'Highly rated and loved — perfect for gifting',
        emoji: '🎯',
        priceRange: '$15-30',
        platform: 'amazon',
        productId: 'B0F9W34NXC',
        category: 'practical',
        modes: ['baby', 'birthday', 'graduation', 'anniversary', 'milestone'],
    },
    {
        id: 'gift-funny-slippers',
        name: 'Funny Animal Slippers',
        description: 'Cartoon animal slippers — cozy and hilarious',
        emoji: '🐾',
        priceRange: '$15-25',
        platform: 'amazon',
        productId: 'B09P4WSXYW',
        category: 'practical',
        modes: ['birthday', 'graduation', 'anniversary', 'milestone'],
    },
    {
        id: 'gift-flashlight',
        name: 'Rechargeable Flashlight',
        description: 'Ultra-light waterproof LED flashlight — always handy',
        emoji: '🔦',
        priceRange: '$15-25',
        platform: 'amazon',
        productId: 'B08D66HCXW',
        category: 'practical',
        modes: ['birthday', 'graduation', 'anniversary', 'milestone'],
    },
    {
        id: 'gift-gag-survival',
        name: 'Shart Survival Kit',
        description: 'Hilarious gag gift set — guaranteed laughs',
        emoji: '😂',
        priceRange: '$15-25',
        platform: 'amazon',
        productId: 'B0DWDSKX8P',
        category: 'practical',
        modes: ['birthday', 'graduation', 'milestone'],
    },

    // ─── BIRTHDAY GIFTS ───
    {
        id: 'gift-photo-frame',
        name: 'Digital Photo Frame',
        description: 'WiFi photo frame — family can send photos remotely',
        emoji: '📸',
        priceRange: '$50-120',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'milestone',
        modes: ['birthday', 'anniversary', 'milestone'],
    },
    {
        id: 'gift-birthday-basket',
        name: 'Birthday Gift Basket',
        description: 'Curated birthday treats & goodies',
        emoji: '🎂',
        priceRange: '$30-60',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'milestone',
        modes: ['birthday'],
    },

    // ─── GRADUATION GIFTS ───
    {
        id: 'gift-grad-journal',
        name: 'Leather Journal',
        description: 'Premium leather-bound journal for their next chapter',
        emoji: '📓',
        priceRange: '$20-40',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'keepsake',
        modes: ['graduation'],
    },

    // ─── MEMORIAL / SYMPATHY GIFTS ───
    {
        id: 'gift-sympathy-candle',
        name: 'Memorial Candle',
        description: 'Comforting remembrance candle with heartfelt message',
        emoji: '🕯️',
        priceRange: '$20-35',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'memorial',
        modes: ['memorial'],
    },
    {
        id: 'gift-memorial-frame',
        name: 'Memorial Picture Frame',
        description: 'Beautiful frame to honor a cherished memory',
        emoji: '🖼️',
        priceRange: '$20-40',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'memorial',
        modes: ['memorial'],
    },

    // ─── KEEPSAKE (multi-mode) ───
    {
        id: 'gift-keepsake-box',
        name: 'Keepsake Memory Box',
        description: 'Beautiful wooden box to store mementos from the day',
        emoji: '📦',
        priceRange: '$25-45',
        platform: 'amazon',
        productId: '', // ASIN needed
        category: 'keepsake',
        modes: ['baby', 'birthday', 'graduation', 'milestone'],
    },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Build an affiliate-tagged URL for a gift product.
 * Returns null if the affiliate program is not configured.
 */
export function buildAffiliateUrl(suggestion: GiftSuggestion): string | null {
    if (!FEATURE_FLAGS.AFFILIATE_LINKS_LIVE) {
        console.log(`[Affiliate] Link not live — would open amazon/${suggestion.productId}`);
        return null;
    }

    const tag = AFFILIATE_IDS.AMAZON;
    if (!tag || !suggestion.productId) return null;
    return `https://www.amazon.com/dp/${suggestion.productId}?tag=${tag}`;
}

/**
 * Get gift suggestions filtered by app mode and category.
 */
export function getGiftSuggestions(
    mode: GiftSuggestion['modes'][0],
    category?: GiftSuggestion['category']
): GiftSuggestion[] {
    if (!FEATURE_FLAGS.GIFTING_ENABLED) return [];

    return GIFT_SUGGESTIONS.filter(gift => {
        const modeMatch = gift.modes.includes(mode);
        const categoryMatch = !category || gift.category === category;
        const hasProduct = gift.productId.length > 0;
        return modeMatch && categoryMatch && hasProduct;
    });
}

/**
 * Check if any affiliate program is fully set up and ready.
 */
export function getActiveAffiliatePrograms(): string[] {
    const active: string[] = [];
    if (AFFILIATE_IDS.AMAZON) active.push('Amazon Associates');
    return active;
}

/**
 * Calculate estimated margin on a print order.
 * Uses the pricing table for estimation; actual margin determined at order time
 * when Printful returns the real wholesale cost.
 */
export function estimatePrintMargin(
    productKey: keyof typeof PRINT_PRICING,
    quantity: number = 1
): {
    retailTotal: number;
    wholesaleEstimate: number;
    estimatedMargin: number;
} {
    const pricing = PRINT_PRICING[productKey];
    if (!pricing) {
        return { retailTotal: 0, wholesaleEstimate: 0, estimatedMargin: 0 };
    }

    return {
        retailTotal: pricing.retailPrice * quantity,
        wholesaleEstimate: pricing.wholesaleEstimate * quantity,
        estimatedMargin: pricing.estimatedMargin * quantity,
    };
}

export default {
    FEATURE_FLAGS,
    AFFILIATE_IDS,
    COMMISSION_RATES,
    PRINT_PRICING,
    GIFT_SUGGESTIONS,
    buildAffiliateUrl,
    getGiftSuggestions,
    getActiveAffiliatePrograms,
    estimatePrintMargin,
};
