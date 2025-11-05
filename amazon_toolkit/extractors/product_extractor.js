/**
 * @file product_extractor.js
 * @description Extracts comprehensive product data from Amazon product pages
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Extractors.Product
 * 
 * Extracts all product-related data from Amazon product pages including:
 * - Basic info (ASIN, title, brand, description)
 * - Pricing (current price, list price, savings)
 * - Images (primary image, additional images, variant images)
 * - Variants (color, size, style options)
 * - Shipping and availability
 * - Rating and review count
 * - URL data (original URL, clean URL, query parameters)
 * 
 * Returns rich data structures that contain everything needed for:
 * - URL composition (short, long, medium versions)
 * - Image URL generation (various sizes)
 * - Markdown link generation
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL MDN URL API}
 */

'use strict';

/**
 * Extracts complete product data from an Amazon product page
 * 
 * @param {Document|string} source - DOM document or HTML string
 * @param {string} [url] - Original URL (optional but recommended)
 * @returns {Object|null} Product data structure or null if extraction fails
 * 
 * @example
 * // Browser context
 * const productData = extractProductData(document, window.location.href);
 * 
 * // Node.js context with HTML string
 * const productData = extractProductData(htmlString, url);
 * 
 * // Returns:
 * {
 *   asin: 'B08N5WRWNW',
 *   title: 'Nintendo Switch – OLED Model',
 *   titleCleaned: 'Nintendo Switch – OLED Model',
 *   brand: 'Nintendo',
 *   description: 'Meet the newest member...',
 *   price: {
 *     current: '$349.99',
 *     currentValue: 349.99,
 *     currency: 'USD',
 *     list: '$359.99',
 *     savings: '$10.00',
 *     savingsPercent: '3%'
 *   },
 *   images: {
 *     primary: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg',
 *     primaryId: '61CGHv6kmWL',
 *     additional: [...],
 *     variants: {...}
 *   },
 *   variant: {
 *     type: 'Color',
 *     value: 'White',
 *     selected: true
 *   },
 *   availability: 'In Stock',
 *   shipping: 'FREE delivery',
 *   rating: {
 *     value: 4.8,
 *     count: 15234,
 *     stars: '4.8 out of 5 stars'
 *   },
 *   url: {
 *     original: 'https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1&...',
 *     originalClean: 'https://www.amazon.com/dp/B08N5WRWNW',
 *     protocol: 'https:',
 *     hostname: 'www.amazon.com',
 *     pathname: '/dp/B08N5WRWNW',
 *     queryParams: {
 *       th: '1',
 *       psc: '1',
 *       // ... all original parameters
 *     },
 *     variantParams: {
 *       th: '1',
 *       psc: '1'
 *     },
 *     trackingParams: {
 *       pd_rd_w: '...',
 *       // ... all tracking parameters
 *     }
 *   },
 *   metadata: {
 *     extractedAt: '2025-11-04T12:34:56.789Z',
 *     extractionMethod: 'product_extractor',
 *     pageType: 'product'
 *   }
 * }
 */
function extractProductData(source, url) {
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

    // Extract basic data
    const asin = extractProductASIN(doc, url);
    if (!asin) {
        logWarn('Could not extract ASIN - may not be a product page');
        return null;
    }

    // Extract all product properties
    const title = extractProductTitle(doc);
    const brand = extractProductBrand(doc);
    const description = extractProductDescription(doc);
    const priceData = extractProductPriceData(doc);
    const imageData = extractProductImageData(doc);
    const variant = extractProductVariant(doc);
    const availability = extractProductAvailability(doc);
    const shipping = extractProductShipping(doc);
    const rating = extractProductRating(doc);
    const urlData = parseURLData(url, doc);

    // Build comprehensive data structure
    const productData = {
        asin,
        title,
        titleCleaned: title ? cleanProductTitle(title) : null,
        brand,
        description,
        price: priceData,
        images: imageData,
        variant,
        availability,
        shipping,
        rating,
        url: urlData,
        metadata: {
            extractedAt: new Date().toISOString(),
            extractionMethod: 'product_extractor',
            pageType: 'product'
        }
    };

    return productData;
}

/**
 * Extracts comprehensive price data including current, list, and savings
 * 
 * @param {Document} doc - DOM document
 * @returns {Object|null} Price data object or null
 * 
 * @example
 * // Returns:
 * {
 *   current: '$349.99',
 *   currentValue: 349.99,
 *   currency: 'USD',
 *   list: '$359.99',
 *   listValue: 359.99,
 *   savings: '$10.00',
 *   savingsValue: 10.00,
 *   savingsPercent: '3%'
 * }
 */
function extractProductPriceData(doc) {
    const currentPrice = extractProductPrice(doc);
    if (!currentPrice) {
        return null;
    }

    const priceData = {
        current: currentPrice,
        currentValue: parseProductPriceValue(currentPrice),
        currency: extractProductCurrency(currentPrice)
    };

    // Try to extract list price (if on sale)
    try {
        const listPriceElement = safeQuery('.a-price.a-text-price .a-offscreen', doc);
        if (listPriceElement) {
            const listPrice = safeText(listPriceElement);
            if (listPrice && listPrice !== currentPrice) {
                priceData.list = listPrice;
                priceData.listValue = parseProductPriceValue(listPrice);
                
                // Calculate savings
                if (priceData.listValue && priceData.currentValue) {
                    priceData.savingsValue = priceData.listValue - priceData.currentValue;
                    priceData.savings = `${priceData.currency}${priceData.savingsValue.toFixed(2)}`;
                    priceData.savingsPercent = `${Math.round((priceData.savingsValue / priceData.listValue) * 100)}%`;
                }
            }
        }
    } catch (error) {
        // Optional field, continue without
    }

    return priceData;
}

/**
 * Parses price string to numeric value
 * @param {string} priceStr - Price string like '$349.99'
 * @returns {number|null} Numeric price value
 */
function parseProductPriceValue(priceStr) {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[$£€¥₹,\s]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? null : value;
}

/**
 * Extracts currency symbol from price string
 * @param {string} priceStr - Price string like '$349.99'
 * @returns {string} Currency symbol or '$'
 */
function extractProductCurrency(priceStr) {
    if (!priceStr) return '$';
    const match = priceStr.match(/^([£€¥₹$])/);
    return match ? match[1] : '$';
}

/**
 * Extracts comprehensive image data including primary, additional, and variant images
 * 
 * @param {Document} doc - DOM document
 * @returns {Object} Image data object
 * 
 * @example
 * // Returns:
 * {
 *   primary: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg',
 *   primaryId: '61CGHv6kmWL',
 *   additional: [
 *     { url: 'https://...', imageId: '...' },
 *     ...
 *   ],
 *   variants: {
 *     'White': { url: '...', imageId: '...' },
 *     'Black': { url: '...', imageId: '...' }
 *   }
 * }
 */
function extractProductImageData(doc) {
    const imageData = {
        primary: null,
        primaryId: null,
        additional: [],
        variants: {}
    };

    // Extract primary image
    const primaryURL = extractProductImageURL(doc);
    if (primaryURL) {
        imageData.primary = primaryURL;
        imageData.primaryId = extractProductImageID(primaryURL);
    }

    // Extract additional images from image gallery
    try {
        const thumbnails = safeQueryAll('.imageThumbnail img', doc);
        for (const thumb of thumbnails) {
            const src = safeAttr(thumb, 'src');
            if (src && isAmazonImageURL(src)) {
                const imageId = extractProductImageID(src);
                if (imageId && imageId !== imageData.primaryId) {
                    imageData.additional.push({
                        url: src,
                        imageId
                    });
                }
            }
        }
    } catch (error) {
        // Additional images are optional
    }

    // Extract variant images
    try {
        const variantImages = safeQueryAll('.variation_color_name img', doc);
        for (const img of variantImages) {
            const src = safeAttr(img, 'src');
            const alt = safeAttr(img, 'alt');
            if (src && alt && isAmazonImageURL(src)) {
                const imageId = extractProductImageID(src);
                if (imageId) {
                    imageData.variants[alt] = {
                        url: src,
                        imageId,
                        variantName: alt
                    };
                }
            }
        }
    } catch (error) {
        // Variant images are optional
    }

    return imageData;
}

/**
 * Extracts image ID from Amazon image URL
 * @param {string} imageUrl - Amazon image URL
 * @returns {string|null} Image ID or null
 * 
 * @example
 * extractProductImageID('https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg')
 * // Returns: '61CGHv6kmWL'
 */
function extractProductImageID(imageUrl) {
    if (!imageUrl) return null;
    const match = imageUrl.match(/\/images\/I\/([A-Za-z0-9+_-]+)\./);
    return match ? match[1] : null;
}

/**
 * Extracts availability status
 * @param {Document} doc - DOM document
 * @returns {string|null} Availability status
 */
function extractProductAvailability(doc) {
    try {
        const selectors = [
            '#availability span',
            '#availability .a-declarative',
            '.a-color-success',
            '.a-color-price'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const text = safeText(element);
                if (text) return text;
            }
        }
    } catch (error) {
        // Optional field
    }
    return null;
}

/**
 * Extracts shipping information
 * @param {Document} doc - DOM document
 * @returns {string|null} Shipping information
 */
function extractProductShipping(doc) {
    try {
        const selectors = [
            '#deliveryBlockMessage',
            '#mir-layout-DELIVERY_BLOCK',
            '.a-color-success.a-text-bold'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const text = safeText(element);
                if (text && text.toLowerCase().includes('delivery')) {
                    return text;
                }
            }
        }
    } catch (error) {
        // Optional field
    }
    return null;
}

/**
 * Extracts rating and review information
 * @param {Document} doc - DOM document
 * @returns {Object|null} Rating data object
 * 
 * @example
 * // Returns:
 * {
 *   value: 4.8,
 *   count: 15234,
 *   stars: '4.8 out of 5 stars'
 * }
 */
function extractProductRating(doc) {
    try {
        // Extract rating value
        const ratingElement = safeQuery('[data-hook="rating-out-of-text"]', doc) ||
                             safeQuery('.a-icon-alt', doc);
        if (!ratingElement) return null;

        const ratingText = safeText(ratingElement);
        if (!ratingText) return null;

        const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*out of\s*5/i);
        if (!ratingMatch) return null;

        const ratingValue = parseFloat(ratingMatch[1]);

        // Extract review count
        let reviewCount = null;
        const countElement = safeQuery('[data-hook="total-review-count"]', doc) ||
                            safeQuery('#acrCustomerReviewText', doc);
        if (countElement) {
            const countText = safeText(countElement);
            if (countText) {
                const countMatch = countText.match(/([\d,]+)\s*ratings?/i);
                if (countMatch) {
                    reviewCount = parseInt(countMatch[1].replace(/,/g, ''));
                }
            }
        }

        return {
            value: ratingValue,
            count: reviewCount,
            stars: ratingText
        };
    } catch (error) {
        // Optional field
    }
    return null;
}

/**
 * Parses URL into comprehensive data structure
 * Separates original URL, query parameters, variant parameters, and tracking parameters
 * 
 * @param {string} [url] - URL to parse
 * @param {Document} [doc] - Document (fallback to extract URL from canonical)
 * @returns {Object|null} URL data object
 * 
 * @example
 * // Returns:
 * {
 *   original: 'https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1&pd_rd_w=...',
 *   originalClean: 'https://www.amazon.com/dp/B08N5WRWNW',
 *   protocol: 'https:',
 *   hostname: 'www.amazon.com',
 *   pathname: '/dp/B08N5WRWNW',
 *   queryParams: { th: '1', psc: '1', pd_rd_w: '...', ... },
 *   variantParams: { th: '1', psc: '1' },
 *   trackingParams: { pd_rd_w: '...', pd_rd_r: '...', ... }
 * }
 */
function parseURLData(url, doc) {
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
        const variantParams = {};
        const trackingParams = {};

        // Parse all query parameters
        for (const [key, value] of urlObj.searchParams.entries()) {
            queryParams[key] = value;

            // Categorize parameters
            if (isVariantParameter(key)) {
                variantParams[key] = value;
            } else if (isTrackingParameter(key)) {
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
            variantParams,
            trackingParams
        };
    } catch (error) {
        logError('Failed to parse URL:', error);
        return null;
    }
}

/**
 * Checks if a query parameter is a variant parameter
 * @param {string} key - Parameter key
 * @returns {boolean} True if variant parameter
 */
function isVariantParameter(key) {
    const variantParams = ['th', 'psc', 'smid'];
    return variantParams.includes(key.toLowerCase());
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

// Placeholder functions - these would be imported from shared_extractor and helpers
function extractProductASIN(doc, url) { /* Implementation in shared_extractor.js */ return null; }
function extractProductTitle(doc) { /* Implementation in shared_extractor.js */ return null; }
function cleanProductTitle(title) { /* Implementation in shared_extractor.js */ return title; }
function extractProductBrand(doc) { /* Implementation in shared_extractor.js */ return null; }
function extractProductDescription(doc) { /* Implementation in shared_extractor.js */ return null; }
function extractProductPrice(doc) { /* Implementation in shared_extractor.js */ return null; }
function extractProductImageURL(doc) { /* Implementation in shared_extractor.js */ return null; }
function extractProductVariant(doc) { /* Implementation in shared_extractor.js */ return null; }
function safeQuery(selector, context) { /* Implementation in dom_helpers.js */ return null; }
function safeQueryAll(selector, context) { /* Implementation in dom_helpers.js */ return []; }
function safeText(element) { /* Implementation in dom_helpers.js */ return null; }
function safeAttr(element, attr) { /* Implementation in dom_helpers.js */ return null; }
function isAmazonImageURL(url) { /* Implementation in validation_helpers.js */ return false; }
function logWarn(...args) { /* Implementation in logging_helpers.js */ }
function logError(...args) { /* Implementation in logging_helpers.js */ }

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractProductData,
        extractProductPriceData,
        extractProductImageData,
        extractProductImageID,
        extractProductAvailability,
        extractProductShipping,
        extractProductRating,
        parseProductPriceValue,
        extractProductCurrency,
        parseURLData,
        isVariantParameter,
        isTrackingParameter
    };
}
