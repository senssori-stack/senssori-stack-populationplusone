/**
 * Printful API Integration for PopulationPlusOne
 * Handles print-on-demand orders for birth announcements
 * 
 * API Documentation: https://developers.printful.com/docs/
 */

// Store token securely - in production, use environment variables
const PRINTFUL_API_TOKEN = 'x1lJgXLBTh2VRkh0H9D2JjpSaIzxVJlI7477VcKg';
const PRINTFUL_API_BASE = 'https://api.printful.com';

// Printful product IDs for our offerings
export const PRINTFUL_PRODUCTS = {
    // Posters
    POSTER_12X18: 1, // Enhanced Matte Paper Poster 12×18
    POSTER_18X24: 1, // Enhanced Matte Paper Poster 18×24
    POSTER_24X36: 1, // Enhanced Matte Paper Poster 24×36

    // Canvas
    CANVAS_8X10: 2,
    CANVAS_12X12: 2,
    CANVAS_16X20: 2,

    // Photo Prints (use poster with glossy option)
    PHOTO_PRINT: 1,

    // Postcards
    POSTCARD_4X6: 534, // Postcards
    POSTCARD_5X7: 534,

    // Stickers
    STICKER_SHEET: 505, // Kiss-cut stickers
    STICKER_CIRCLE: 358, // Circle stickers

    // For yard signs and trading cards - we'll use custom/external fulfillment
    // Printful doesn't do corrugated yard signs, so we note that
};

// Printful variant IDs (size-specific)
export const PRINTFUL_VARIANTS = {
    // Enhanced Matte Posters
    'POSTER_12X18': 9699,
    'POSTER_18X24': 9700,
    'POSTER_24X36': 9879,

    // Canvas
    'CANVAS_8X10': 1642,
    'CANVAS_12X12': 1646,
    'CANVAS_16X20': 1647,
    'CANVAS_20X24': 1649,

    // Postcards (4×6)
    'POSTCARD_4X6': 13882,

    // Stickers
    'STICKER_3X3': 10163,
    'STICKER_4X4': 10164,
};

interface PrintfulFile {
    url: string;
    filename?: string;
}

interface PrintfulRecipient {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
    phone?: string;
    email?: string;
}

interface PrintfulOrderItem {
    variant_id: number;
    quantity: number;
    files: PrintfulFile[];
}

interface PrintfulOrder {
    recipient: PrintfulRecipient;
    items: PrintfulOrderItem[];
}

/**
 * Make authenticated request to Printful API
 */
async function printfulRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
): Promise<any> {
    const url = `${PRINTFUL_API_BASE}${endpoint}`;

    const headers: HeadersInit = {
        'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`,
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
            throw new Error(data.error?.message || `Printful API error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Printful API Error:', error);
        throw error;
    }
}

/**
 * Get available products from Printful catalog
 */
export async function getProducts(): Promise<any> {
    return printfulRequest('/store/products');
}

/**
 * Get product variants and pricing
 */
export async function getProductVariants(productId: number): Promise<any> {
    return printfulRequest(`/products/${productId}`);
}

/**
 * Upload a file to Printful (for print-ready designs)
 */
export async function uploadFile(imageUrl: string, filename: string): Promise<any> {
    return printfulRequest('/files', 'POST', {
        url: imageUrl,
        filename,
    });
}

/**
 * Calculate shipping costs for an order
 */
export async function calculateShipping(
    recipient: PrintfulRecipient,
    items: { variant_id: number; quantity: number }[]
): Promise<any> {
    return printfulRequest('/shipping/rates', 'POST', {
        recipient,
        items,
    });
}

/**
 * Create a draft order (for review before payment)
 */
export async function createDraftOrder(order: PrintfulOrder): Promise<any> {
    return printfulRequest('/orders', 'POST', {
        ...order,
        confirm: false, // Draft mode - don't charge yet
    });
}

/**
 * Create and confirm an order (charges the account)
 */
export async function createOrder(order: PrintfulOrder): Promise<any> {
    return printfulRequest('/orders', 'POST', {
        ...order,
        confirm: true, // Confirm and charge
    });
}

/**
 * Get order status
 */
export async function getOrderStatus(orderId: number): Promise<any> {
    return printfulRequest(`/orders/${orderId}`);
}

/**
 * Estimate order cost (without creating the order)
 */
export async function estimateOrderCost(order: PrintfulOrder): Promise<any> {
    return printfulRequest('/orders/estimate-costs', 'POST', order);
}

/**
 * Cancel an order (only works for pending orders)
 */
export async function cancelOrder(orderId: number): Promise<any> {
    return printfulRequest(`/orders/${orderId}`, 'DELETE');
}

// ============================================================
// HIGH-LEVEL FUNCTIONS FOR OUR APP
// ============================================================

export interface OrderDetails {
    productType: 'poster' | 'canvas' | 'postcard' | 'sticker' | 'photo';
    size: string;
    quantity: number;
    imageUrl: string; // URL to the generated announcement image
    customer: {
        name: string;
        email: string;
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
 * Get variant ID based on product type and size
 */
function getVariantId(productType: string, size: string): number {
    const key = `${productType.toUpperCase()}_${size.replace(/[×"]/g, 'X').replace(/\s/g, '')}`;
    return PRINTFUL_VARIANTS[key as keyof typeof PRINTFUL_VARIANTS] || 9700; // Default to 18×24 poster
}

/**
 * Create a complete print order for a birth announcement
 */
export async function createBirthAnnouncementOrder(details: OrderDetails): Promise<{
    success: boolean;
    orderId?: number;
    estimatedCost?: number;
    error?: string;
}> {
    try {
        const variantId = getVariantId(details.productType, details.size);

        const order: PrintfulOrder = {
            recipient: {
                name: details.customer.name,
                address1: details.customer.address.street1,
                address2: details.customer.address.street2,
                city: details.customer.address.city,
                state_code: details.customer.address.state,
                country_code: details.customer.address.country || 'US',
                zip: details.customer.address.zip,
                phone: details.customer.phone,
                email: details.customer.email,
            },
            items: [
                {
                    variant_id: variantId,
                    quantity: details.quantity,
                    files: [
                        {
                            url: details.imageUrl,
                            filename: `birth-announcement-${Date.now()}.png`,
                        },
                    ],
                },
            ],
        };

        // First estimate the cost
        const estimate = await estimateOrderCost(order);

        // Create draft order for review
        const draftOrder = await createDraftOrder(order);

        return {
            success: true,
            orderId: draftOrder.result.id,
            estimatedCost: estimate.result.costs.total,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to create order',
        };
    }
}

/**
 * Test the API connection
 */
export async function testConnection(): Promise<boolean> {
    try {
        const response = await printfulRequest('/store');
        console.log('✅ Printful connected:', response.result.name);
        return true;
    } catch (error) {
        console.error('❌ Printful connection failed:', error);
        return false;
    }
}

export default {
    testConnection,
    getProducts,
    getProductVariants,
    uploadFile,
    calculateShipping,
    createDraftOrder,
    createOrder,
    getOrderStatus,
    estimateOrderCost,
    cancelOrder,
    createBirthAnnouncementOrder,
};
