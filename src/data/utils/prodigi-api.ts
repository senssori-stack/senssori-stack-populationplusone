/**
 * Prodigi API Integration for PopulationPlusOne
 * Handles print-on-demand for postcards and trading/baseball cards
 *
 * API Documentation: https://www.prodigi.com/print-api/docs/
 *
 * Prodigi handles: Postcards (4×6, 5×7) and Trading Cards (2.5×3.5)
 * Printful handles: Posters, canvas, yard signs (see printful-api.ts)
 */

// Store token securely - in production, move to Firebase Cloud Functions environment config
const PRODIGI_API_KEY = 'fd3758c0-8519-4d80-9159-2920280a01a3';
const PRODIGI_API_BASE = 'https://api.prodigi.com/v4.0';
// For testing use sandbox: 'https://api.sandbox.prodigi.com/v4.0'
const PRODIGI_SANDBOX_BASE = 'https://api.sandbox.prodigi.com/v4.0';

// Set to true to use sandbox (no real orders/charges)
const USE_SANDBOX = true;

// Prodigi product SKUs for our offerings
export const PRODIGI_PRODUCTS = {
    // Postcards
    POSTCARD_4X6: 'GLOBAL-FAP-4x6',
    POSTCARD_5X7: 'GLOBAL-FAP-5x7',

    // Trading / Baseball Cards (2.5×3.5 standard playing card size)
    TRADING_CARD: 'GLOBAL-FAP-2.5x3.5',

    // Flat art prints (backup if needed)
    PRINT_8X10: 'GLOBAL-FAP-8x10',
    PRINT_11X14: 'GLOBAL-FAP-11x14',
};

// ============================================================
// TYPES
// ============================================================

interface ProdigiAddress {
    line1: string;
    line2?: string;
    postalOrZipCode: string;
    countryCode: string; // ISO 2-letter e.g. 'US'
    townOrCity: string;
    stateOrCounty?: string;
}

interface ProdigiRecipient {
    name: string;
    email?: string;
    phoneNumber?: string;
    address: ProdigiAddress;
}

interface ProdigiAsset {
    printArea: string; // 'default' for most products
    url: string; // Public URL to the print-ready image
}

interface ProdigiItem {
    sku: string;
    copies: number;
    sizing: 'fillPrintArea' | 'fitPrintArea' | 'stretchToPrintArea';
    assets: ProdigiAsset[];
}

interface ProdigiOrderRequest {
    shippingMethod: 'Budget' | 'Standard' | 'Express';
    recipient: ProdigiRecipient;
    items: ProdigiItem[];
    idempotencyKey?: string;
    metadata?: Record<string, string>;
}

interface ProdigiQuoteRequest {
    shippingMethod: 'Budget' | 'Standard' | 'Express';
    destinationCountryCode: string;
    items: {
        sku: string;
        copies: number;
        assets: ProdigiAsset[];
    }[];
}

// ============================================================
// CORE API
// ============================================================

/**
 * Make authenticated request to Prodigi API
 */
async function prodigiRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
): Promise<any> {
    const base = USE_SANDBOX ? PRODIGI_SANDBOX_BASE : PRODIGI_API_BASE;
    const url = `${base}${endpoint}`;

    const headers: HeadersInit = {
        'X-API-Key': PRODIGI_API_KEY,
        'Content-Type': 'application/json',
    };

    const options: RequestInit = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.traceParent || data.message || `Prodigi API error: ${response.status}`
            );
        }

        return data;
    } catch (error) {
        console.error('Prodigi API Error:', error);
        throw error;
    }
}

// ============================================================
// API ENDPOINTS
// ============================================================

/**
 * Get a shipping quote without creating an order
 */
export async function getQuote(quote: ProdigiQuoteRequest): Promise<any> {
    return prodigiRequest('/quotes', 'POST', quote);
}

/**
 * Create an order
 */
export async function createOrder(order: ProdigiOrderRequest): Promise<any> {
    return prodigiRequest('/orders', 'POST', order);
}

/**
 * Get order status by ID
 */
export async function getOrderStatus(orderId: string): Promise<any> {
    return prodigiRequest(`/orders/${orderId}`);
}

/**
 * Get list of orders
 */
export async function getOrders(top = 10, skip = 0): Promise<any> {
    return prodigiRequest(`/orders?top=${top}&skip=${skip}`);
}

/**
 * Cancel an order (only if status allows)
 */
export async function cancelOrder(orderId: string): Promise<any> {
    return prodigiRequest(`/orders/${orderId}/actions/cancel`, 'POST');
}

/**
 * Get available products from Prodigi catalog
 */
export async function getProducts(sku?: string): Promise<any> {
    const endpoint = sku ? `/products?sku=${sku}` : '/products';
    return prodigiRequest(endpoint);
}

// ============================================================
// HIGH-LEVEL FUNCTIONS FOR OUR APP
// ============================================================

export interface PostcardOrderDetails {
    size: '4x6' | '5x7';
    quantity: number;
    imageUrl: string; // Public URL to the captured postcard image
    customer: {
        name: string;
        email?: string;
        phone?: string;
        address: {
            street1: string;
            street2?: string;
            city: string;
            state: string;
            zip: string;
            country: string; // ISO 2-letter code e.g. 'US'
        };
    };
}

export interface TradingCardOrderDetails {
    quantity: number; // Number of cards
    imageUrl: string; // Public URL to the captured card image
    customer: {
        name: string;
        email?: string;
        phone?: string;
        address: {
            street1: string;
            street2?: string;
            city: string;
            state: string;
            zip: string;
            country: string;
        };
    };
}

/**
 * Get the Prodigi SKU for a given product type and size
 */
function getSku(productType: 'postcard' | 'tradingcard', size?: string): string {
    if (productType === 'tradingcard') {
        return PRODIGI_PRODUCTS.TRADING_CARD;
    }
    if (size === '5x7') {
        return PRODIGI_PRODUCTS.POSTCARD_5X7;
    }
    return PRODIGI_PRODUCTS.POSTCARD_4X6;
}

/**
 * Get a shipping quote for postcards or trading cards
 */
export async function getShippingQuote(
    productType: 'postcard' | 'tradingcard',
    size: string,
    quantity: number,
    countryCode: string = 'US'
): Promise<any> {
    return getQuote({
        shippingMethod: 'Standard',
        destinationCountryCode: countryCode,
        items: [
            {
                sku: getSku(productType, size),
                copies: quantity,
                assets: [{ printArea: 'default', url: 'https://placeholder.com/temp.png' }],
            },
        ],
    });
}

/**
 * Create a postcard print order
 */
export async function createPostcardOrder(details: PostcardOrderDetails): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
}> {
    try {
        const order: ProdigiOrderRequest = {
            shippingMethod: 'Standard',
            recipient: {
                name: details.customer.name,
                email: details.customer.email,
                phoneNumber: details.customer.phone,
                address: {
                    line1: details.customer.address.street1,
                    line2: details.customer.address.street2,
                    townOrCity: details.customer.address.city,
                    stateOrCounty: details.customer.address.state,
                    postalOrZipCode: details.customer.address.zip,
                    countryCode: details.customer.address.country || 'US',
                },
            },
            items: [
                {
                    sku: getSku('postcard', details.size),
                    copies: details.quantity,
                    sizing: 'fillPrintArea',
                    assets: [
                        {
                            printArea: 'default',
                            url: details.imageUrl,
                        },
                    ],
                },
            ],
            metadata: {
                source: 'PopulationPlusOne',
                productType: 'postcard',
                size: details.size,
            },
        };

        const result = await createOrder(order);
        return {
            success: true,
            orderId: result.order?.id,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to create postcard order',
        };
    }
}

/**
 * Create a trading/baseball card print order
 */
export async function createTradingCardOrder(details: TradingCardOrderDetails): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
}> {
    try {
        const order: ProdigiOrderRequest = {
            shippingMethod: 'Standard',
            recipient: {
                name: details.customer.name,
                email: details.customer.email,
                phoneNumber: details.customer.phone,
                address: {
                    line1: details.customer.address.street1,
                    line2: details.customer.address.street2,
                    townOrCity: details.customer.address.city,
                    stateOrCounty: details.customer.address.state,
                    postalOrZipCode: details.customer.address.zip,
                    countryCode: details.customer.address.country || 'US',
                },
            },
            items: [
                {
                    sku: PRODIGI_PRODUCTS.TRADING_CARD,
                    copies: details.quantity,
                    sizing: 'fillPrintArea',
                    assets: [
                        {
                            printArea: 'default',
                            url: details.imageUrl,
                        },
                    ],
                },
            ],
            metadata: {
                source: 'PopulationPlusOne',
                productType: 'tradingcard',
            },
        };

        const result = await createOrder(order);
        return {
            success: true,
            orderId: result.order?.id,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to create trading card order',
        };
    }
}
