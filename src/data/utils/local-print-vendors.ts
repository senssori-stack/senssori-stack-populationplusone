/**
 * FedEx Office Print Integration for PopulationPlusOne
 * Handles yard signs and local pickup print orders
 * 
 * FedEx Office has 2,000+ locations for local pickup
 * Products: Yard Signs, Banners, Posters, Business Cards
 */

// FedEx Office print product URLs
const FEDEX_BASE_URL = 'https://www.fedex.com/en-us/printing';

// Product categories with direct links
export const FEDEX_PRODUCTS = {
    YARD_SIGN: {
        name: 'Yard Signs',
        url: 'https://www.fedex.com/en-us/printing/signs-posters-banners/yard-signs.html',
        description: 'Corrugated plastic with H-stake, weatherproof',
        sizes: [
            { size: '12×18"', price: 24.99 },
            { size: '18×24"', price: 34.99 },
            { size: '24×36"', price: 49.99 },
        ],
        turnaround: 'Same day - 2 days',
        pickup: true,
    },
    POSTER: {
        name: 'Posters',
        url: 'https://www.fedex.com/en-us/printing/signs-posters-banners/posters.html',
        description: 'High-quality poster prints',
        sizes: [
            { size: '11×17"', price: 12.99 },
            { size: '18×24"', price: 19.99 },
            { size: '24×36"', price: 29.99 },
        ],
        turnaround: 'Same day - 1 day',
        pickup: true,
    },
    BANNER: {
        name: 'Vinyl Banner',
        url: 'https://www.fedex.com/en-us/printing/signs-posters-banners/banners.html',
        description: 'Indoor/outdoor vinyl banner with grommets',
        sizes: [
            { size: '2×4 ft', price: 39.99 },
            { size: '3×6 ft', price: 69.99 },
            { size: '4×8 ft', price: 99.99 },
        ],
        turnaround: '1-3 days',
        pickup: true,
    },
};

// Alternative national chains for redundancy
export const ALTERNATIVE_VENDORS = {
    STAPLES: {
        name: 'Staples',
        url: 'https://www.staples.com/services/printing/',
        yardSigns: 'https://www.staples.com/services/printing/signs-posters/yard-signs/',
        locations: '1,000+',
    },
    OFFICE_DEPOT: {
        name: 'Office Depot',
        url: 'https://www.officedepot.com/cm/print-and-copy/home',
        yardSigns: 'https://www.officedepot.com/cm/print-and-copy/signs-posters',
        locations: '1,300+',
    },
    UPS_STORE: {
        name: 'The UPS Store',
        url: 'https://www.theupsstore.com/print',
        locations: '5,000+',
    },
};

/**
 * Find nearest FedEx Office location
 */
export function getFedExLocationFinderUrl(zipCode?: string): string {
    const baseUrl = 'https://local.fedex.com/en-us/search';
    return zipCode ? `${baseUrl}?q=${zipCode}` : baseUrl;
}

/**
 * Generate a FedEx Office order URL with pre-selected product
 */
export function getFedExOrderUrl(productType: keyof typeof FEDEX_PRODUCTS): string {
    return FEDEX_PRODUCTS[productType]?.url || FEDEX_BASE_URL;
}

/**
 * Get yard sign ordering info for display
 */
export function getYardSignInfo() {
    return {
        vendor: 'FedEx Office',
        vendorLogo: '📦',
        product: FEDEX_PRODUCTS.YARD_SIGN,
        benefits: [
            '🏪 2,000+ locations nationwide',
            '⚡ Same-day pickup available',
            '🌧️ Weatherproof corrugated plastic',
            '📍 H-stake included for easy install',
            '🚗 Drive to pick up, no shipping wait!',
        ],
        instructions: [
            '1. Save your design image to your phone',
            '2. Visit FedEx Office website or app',
            '3. Upload your design for yard sign',
            '4. Select your nearest location',
            '5. Pick up same day or next day!',
        ],
        locationFinder: getFedExLocationFinderUrl(),
        orderUrl: FEDEX_PRODUCTS.YARD_SIGN.url,
    };
}

/**
 * Get all local pickup options
 */
export function getLocalPickupVendors() {
    return [
        {
            name: 'FedEx Office',
            logo: '📦',
            locations: '2,000+',
            url: FEDEX_BASE_URL,
            locationFinder: getFedExLocationFinderUrl(),
            products: ['Yard Signs', 'Posters', 'Banners', 'Photo Prints'],
            turnaround: 'Same day available',
            recommended: true,
        },
        {
            name: 'Staples',
            logo: '📎',
            locations: '1,000+',
            url: ALTERNATIVE_VENDORS.STAPLES.url,
            products: ['Yard Signs', 'Posters', 'Banners'],
            turnaround: '1-2 days',
            recommended: false,
        },
        {
            name: 'Office Depot',
            logo: '🏢',
            locations: '1,300+',
            url: ALTERNATIVE_VENDORS.OFFICE_DEPOT.url,
            products: ['Yard Signs', 'Posters', 'Signs'],
            turnaround: '1-2 days',
            recommended: false,
        },
        {
            name: 'The UPS Store',
            logo: '📬',
            locations: '5,000+',
            url: ALTERNATIVE_VENDORS.UPS_STORE.url,
            products: ['Posters', 'Banners', 'Prints'],
            turnaround: '1-3 days',
            recommended: false,
        },
    ];
}

export default {
    FEDEX_PRODUCTS,
    ALTERNATIVE_VENDORS,
    getFedExLocationFinderUrl,
    getFedExOrderUrl,
    getYardSignInfo,
    getLocalPickupVendors,
};
