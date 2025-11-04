/**
 * @file store_extractor.js
 * @description Extracts storefront data from Amazon store pages
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Extractors.Store
 * 
 * Extracts store/brand information from Amazon storefront pages including:
 * - Store name/brand name
 * - Store description
 * - Store logo/image
 * - URL data for cleaning and linking
 * 
 * Does NOT extract product data - use product_extractor for products.
 * 
 * Supports multiple store URL formats:
 * - /stores/BrandName/page/UUID
 * - /s?me=SELLER_ID
 * - /s?marketplaceID=...&me=...
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL MDN URL API}
 */

'use strict';

/**
 * Extracts complete store/storefront data from an Amazon store page
 * 
 * @param {Document|string} source - DOM document or HTML string
 * @param {string} [url] - Original URL (optional but recommended)
 * @returns {Object|null} Store data structure or null if extraction fails
 * 
 * @example
 * // Browser context
 * const storeData = extractStoreData(document, window.location.href);
 * 
 * // Node.js context with HTML string
 * const storeData = extractStoreData(htmlString, url);
 * 
 * // Returns:
 * {
 *   storeName: 'Nintendo Store',
 *   storeNameCleaned: 'Nintendo Store',
 *   brandName: 'Nintendo',
 *   description: 'Official Nintendo products...',
 *   logo: {
 *     url: 'https://m.media-amazon.com/images/S/stores-image-uploads-...',
 *     imageId: '...'
 *   },
 *   sellerId: 'A2VIGQ35RCS4UG',
 *   storeId: 'page/ABC-123-DEF',
 *   url: {
 *     original: 'https://www.amazon.com/stores/page/ABC-123?...',
 *     originalClean: 'https://www.amazon.com/stores/Nintendo/page/ABC-123',
 *     protocol: 'https:',
 *     hostname: 'www.amazon.com',
 *     pathname: '/stores/Nintendo/page/ABC-123',
 *     queryParams: {...},
 *     trackingParams: {...}
 *   },
 *   metadata: {
 *     extractedAt: '2025-11-04T12:34:56.789Z',
 *     extractionMethod: 'store_extractor',
 *     pageType: 'store'
 *   }
 * }
 */
function extractStoreData(source, url) {
    // Convert source to document if string
    let doc;
    if (typeof source === 'string') {
        doc = parseHTMLString(source);
        if (!doc) {
            logError('Failed to parse HTML string');
            return null;
        }
    } else {
        doc = source;
    }

    // Verify this is a store page
    if (!isStorePage(doc, url)) {
        logWarn('Not a store page - extraction may fail');
    }

    // Extract store properties
    const storeName = extractStoreName(doc);
    const brandName = extractStoreBrandName(doc);
    const description = extractStoreDescription(doc);
    const logo = extractStoreLogo(doc);
    const sellerId = extractSellerId(doc, url);
    const storeId = extractStoreId(url);
    const urlData = parseStoreURLData(url, doc);

    // Build comprehensive data structure
    const storeData = {
        storeName,
        storeNameCleaned: storeName ? cleanStoreName(storeName) : null,
        brandName,
        description,
        logo,
        sellerId,
        storeId,
        url: urlData,
        metadata: {
            extractedAt: new Date().toISOString(),
            extractionMethod: 'store_extractor',
            pageType: 'store'
        }
    };

    return storeData;
}

/**
 * Checks if page is a store page
 * @param {Document} doc - DOM document
 * @param {string} [url] - URL to check
 * @returns {boolean} True if store page
 */
function isStorePage(doc, url) {
    // Check URL patterns
    if (url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.pathname.includes('/stores/')) {
                return true;
            }
            if (urlObj.searchParams.has('me') || urlObj.searchParams.has('marketplaceID')) {
                return true;
            }
        } catch (error) {
            // Continue to DOM check
        }
    }

    // Check DOM indicators
    try {
        if (safeQuery('[data-component-type="s-store-hub"]', doc)) {
            return true;
        }
        if (safeQuery('.store-header', doc)) {
            return true;
        }
        if (safeQuery('[data-card-metrics-id*="store"]', doc)) {
            return true;
        }
    } catch (error) {
        // No DOM indicators found
    }

    return false;
}

/**
 * Extracts store name from various sources
 * 
 * Fallback chain:
 * 1. HTML store header/title
 * 2. Meta tags (og:site_name, og:title)
 * 3. Page title
 * 4. URL path
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Store name or null
 * 
 * @example
 * extractStoreName(document)
 * // Returns: 'Nintendo Store'
 */
function extractStoreName(doc) {
    // Try store header elements
    try {
        const selectors = [
            '.store-header h1',
            '[data-component-type="s-store-hub"] h1',
            '.store-brand-title',
            '#store-name'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const text = safeText(element);
                if (text) return text;
            }
        }
    } catch (error) {
        // Continue to next method
    }

    // Try meta tags
    try {
        const ogSiteName = getMetaByProperty('og:site_name', doc);
        if (ogSiteName && ogSiteName.toLowerCase() !== 'amazon') {
            return ogSiteName;
        }

        const ogTitle = getMetaByProperty('og:title', doc);
        if (ogTitle && !ogTitle.toLowerCase().includes('amazon')) {
            return ogTitle;
        }
    } catch (error) {
        // Continue to next method
    }

    // Try page title
    try {
        const titleElement = safeQuery('title', doc);
        if (titleElement) {
            let titleText = safeText(titleElement);
            if (titleText) {
                // Remove Amazon suffix
                titleText = titleText.replace(/\s*[-:]\s*Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*$/i, '');
                titleText = titleText.replace(/\s+Store\s*$/i, '');
                if (titleText) return titleText;
            }
        }
    } catch (error) {
        // Continue to next method
    }

    return null;
}

/**
 * Cleans store name by removing common suffixes and prefixes
 * @param {string} name - Raw store name
 * @returns {string} Cleaned store name
 * 
 * @example
 * cleanStoreName('Nintendo Official Store')
 * // Returns: 'Nintendo'
 */
function cleanStoreName(name) {
    if (!name) return '';
    
    let cleaned = name.trim();
    
    // Remove common suffixes
    cleaned = cleaned.replace(/\s+(Official\s+)?Store$/i, '');
    cleaned = cleaned.replace(/\s+on\s+Amazon$/i, '');
    
    // Remove "Visit the ... Store" prefix
    cleaned = cleaned.replace(/^Visit the\s+/i, '');
    
    return cleaned.trim();
}

/**
 * Extracts brand name (often same as store name but may differ)
 * @param {Document} doc - DOM document
 * @returns {string|null} Brand name or null
 */
function extractStoreBrandName(doc) {
    try {
        const bylineInfo = safeQuery('#bylineInfo', doc);
        if (bylineInfo) {
            let text = safeText(bylineInfo);
            if (text) {
                text = text.replace(/^(Visit the|Brand:)\s*/i, '');
                text = text.replace(/\s+Store$/i, '');
                if (text) return text.trim();
            }
        }
    } catch (error) {
        // Brand name is optional
    }

    return null;
}

/**
 * Extracts store description
 * @param {Document} doc - DOM document
 * @returns {string|null} Store description or null
 */
function extractStoreDescription(doc) {
    try {
        const selectors = [
            '.store-description',
            '[data-component-type="s-store-hub"] p',
            'meta[name="description"]'
        ];

        for (const selector of selectors) {
            if (selector.startsWith('meta')) {
                const desc = getMetaByName('description', doc);
                if (desc) return desc;
            } else {
                const element = safeQuery(selector, doc);
                if (element) {
                    const text = safeText(element);
                    if (text) return text;
                }
            }
        }
    } catch (error) {
        // Description is optional
    }

    return null;
}

/**
 * Extracts store logo/image
 * @param {Document} doc - DOM document
 * @returns {Object|null} Logo data object with url and imageId
 * 
 * @example
 * // Returns:
 * {
 *   url: 'https://m.media-amazon.com/images/S/stores-image-uploads-...',
 *   imageId: '...'
 * }
 */
function extractStoreLogo(doc) {
    try {
        const selectors = [
            '.store-logo img',
            '.store-header img',
            '[data-component-type="s-store-hub"] img'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const src = safeAttr(element, 'src');
                if (src) {
                    return {
                        url: src,
                        imageId: extractImageID(src)
                    };
                }
            }
        }

        // Try og:image
        const ogImage = getMetaByProperty('og:image', doc);
        if (ogImage) {
            return {
                url: ogImage,
                imageId: extractImageID(ogImage)
            };
        }
    } catch (error) {
        // Logo is optional
    }

    return null;
}

/**
 * Extracts seller ID from URL or page
 * @param {Document} doc - DOM document
 * @param {string} [url] - URL to parse
 * @returns {string|null} Seller ID or null
 * 
 * @example
 * extractSellerId(document, 'https://www.amazon.com/s?me=A2VIGQ35RCS4UG')
 * // Returns: 'A2VIGQ35RCS4UG'
 */
function extractSellerId(doc, url) {
    // Try URL parameter
    if (url) {
        try {
            const urlObj = new URL(url);
            const meParam = urlObj.searchParams.get('me');
            if (meParam) return meParam;
        } catch (error) {
            // Continue to next method
        }
    }

    // Try page data attributes
    try {
        const selectors = [
            '[data-seller-id]',
            '[data-me]',
            'input[name="me"]'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const sellerId = safeAttr(element, 'data-seller-id') ||
                                safeAttr(element, 'data-me') ||
                                safeAttr(element, 'value');
                if (sellerId) return sellerId;
            }
        }
    } catch (error) {
        // Seller ID is optional
    }

    return null;
}

/**
 * Extracts store ID from URL
 * @param {string} [url] - URL to parse
 * @returns {string|null} Store ID or null
 * 
 * @example
 * extractStoreId('https://www.amazon.com/stores/page/ABC-123-DEF')
 * // Returns: 'ABC-123-DEF'
 */
function extractStoreId(url) {
    if (!url) return null;

    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        // Pattern: /stores/BrandName/page/STORE_ID
        const match = pathname.match(/\/stores\/[^\/]+\/page\/([A-Z0-9-]+)/i);
        if (match) {
            return match[1];
        }

        // Pattern: /stores/page/STORE_ID
        const match2 = pathname.match(/\/stores\/page\/([A-Z0-9-]+)/i);
        if (match2) {
            return match2[1];
        }
    } catch (error) {
        // Failed to extract
    }

    return null;
}

/**
 * Parses store URL into comprehensive data structure
 * Similar to product URL parsing but for store pages
 * 
 * @param {string} [url] - URL to parse
 * @param {Document} [doc] - Document (fallback to extract URL from canonical)
 * @returns {Object|null} URL data object
 * 
 * @example
 * // Returns:
 * {
 *   original: 'https://www.amazon.com/stores/page/ABC-123?...',
 *   originalClean: 'https://www.amazon.com/stores/page/ABC-123',
 *   protocol: 'https:',
 *   hostname: 'www.amazon.com',
 *   pathname: '/stores/page/ABC-123',
 *   queryParams: {...},
 *   trackingParams: {...}
 * }
 */
function parseStoreURLData(url, doc) {
    // Try to get URL from parameter or canonical link
    let urlString = url;
    if (!urlString && doc) {
        const canonical = safeQuery('link[rel="canonical"]', doc);
        if (canonical) {
            urlString = safeAttr(canonical, 'href');
        }
    }

    if (!urlString) {
        return null;
    }

    try {
        const urlObj = new URL(urlString);
        const queryParams = {};
        const trackingParams = {};

        // Parse all query parameters
        for (const [key, value] of urlObj.searchParams.entries()) {
            queryParams[key] = value;

            // Categorize tracking parameters
            if (isTrackingParameter(key)) {
                trackingParams[key] = value;
            }
        }

        // Build clean URL (no tracking params)
        const cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;

        return {
            original: urlString,
            originalClean: cleanUrl,
            protocol: urlObj.protocol,
            hostname: urlObj.hostname,
            pathname: urlObj.pathname,
            queryParams,
            trackingParams
        };
    } catch (error) {
        logError('Failed to parse store URL:', error);
        return null;
    }
}

/**
 * Checks if a query parameter is a tracking parameter
 * @param {string} key - Parameter key
 * @returns {boolean} True if tracking parameter
 */
function isTrackingParameter(key) {
    const trackingPrefixes = ['pd_rd_', 'pf_rd_', '_encoding', 'qid', 'sr', 'keywords', 'crid', 'sprefix', 'dib', 'tag', 'linkCode', 'linkId', 'ref', 'ref_'];
    return trackingPrefixes.some(prefix => key.toLowerCase().startsWith(prefix));
}

/**
 * Extracts image ID from URL (stores and products use same format)
 * @param {string} imageUrl - Image URL
 * @returns {string|null} Image ID or null
 */
function extractImageID(imageUrl) {
    if (!imageUrl) return null;
    const match = imageUrl.match(/\/images\/[SI]\/([A-Za-z0-9+_-]+)\./);
    return match ? match[1] : null;
}

/**
 * Parses HTML string into DOM document
 * @param {string} htmlString - HTML string
 * @returns {Document|null} Parsed document
 */
function parseHTMLString(htmlString) {
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        return parser.parseFromString(htmlString, 'text/html');
    }
    return null;
}

// Placeholder functions - these would be imported from helpers
function safeQuery(selector, context) { /* Implementation in dom_helpers.js */ return null; }
function safeText(element) { /* Implementation in dom_helpers.js */ return null; }
function safeAttr(element, attr) { /* Implementation in dom_helpers.js */ return null; }
function getMetaByProperty(property, doc) { /* Implementation in dom_helpers.js */ return null; }
function getMetaByName(name, doc) { /* Implementation in dom_helpers.js */ return null; }
function logWarn(...args) { /* Implementation in logging_helpers.js */ }
function logError(...args) { /* Implementation in logging_helpers.js */ }

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractStoreData,
        isStorePage,
        extractStoreName,
        cleanStoreName,
        extractStoreBrandName,
        extractStoreDescription,
        extractStoreLogo,
        extractSellerId,
        extractStoreId,
        parseStoreURLData,
        isTrackingParameter,
        extractImageID
    };
}
