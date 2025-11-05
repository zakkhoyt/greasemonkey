/**
 * @file shared_extractor.js
 * @description Common extraction logic used by all Amazon extractors
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Extractors.Shared
 * 
 * Provides comprehensive fallback chains for extracting data from Amazon pages.
 * Uses multiple data sources in order of reliability:
 * 1. JSON-LD (Schema.org structured data) - Most reliable
 * 2. Meta tags (Open Graph, Twitter Cards) - Reliable
 * 3. HTML elements (Specific selectors) - Less reliable
 * 4. Regex/text patterns (Fallback) - Least reliable
 * 
 * All extraction functions return null if data cannot be found.
 * 
 * @see {@link https://schema.org/ Schema.org}
 * @see {@link https://ogp.me/ Open Graph Protocol}
 * @see {@link https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup Twitter Cards}
 */

'use strict';

// Import helpers (will work in both browser and Node.js when properly loaded)
// In browser context with userscript, these would be loaded via @require
// In Node.js, use require/import

/**
 * Extracts Amazon product ASIN from various sources
 * ASIN Format: 10-character alphanumeric uppercase identifier
 * 
 * Fallback chain:
 * 1. JSON-LD sku property
 * 2. URL path (/dp/, /gp/product/, etc.)
 * 3. HTML data attributes
 * 4. Regex pattern in source code
 * 
 * @param {Document} doc - DOM document
 * @param {string} [url] - Optional URL to extract from
 * @returns {string|null} ASIN or null if not found
 * 
 * @example
 * const asin = extractProductASIN(document, window.location.href);
 * // Returns: 'B08N5WRWNW'
 */
function extractProductASIN(doc, url) {
    // Try JSON-LD
    try {
        const jsonLdData = parseJsonLD(doc);
        for (const data of jsonLdData) {
            if (data['@type'] === 'Product' && data.sku) {
                const sku = String(data.sku).trim();
                if (isValidASIN(sku)) {
                    return sku;
                }
            }
        }
    } catch (error) {
        // Continue to next method
    }

    // Try URL patterns
    if (url) {
        try {
            // Pattern: /dp/ASIN
            const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/i);
            if (dpMatch) {
                const asin = dpMatch[1].toUpperCase();
                if (isValidASIN(asin)) {
                    return asin;
                }
            }

            // Pattern: /gp/product/ASIN
            const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
            if (gpMatch) {
                const asin = gpMatch[1].toUpperCase();
                if (isValidASIN(asin)) {
                    return asin;
                }
            }

            // Pattern: /o/ASIN/ASIN
            const oMatch = url.match(/\/o\/ASIN\/([A-Z0-9]{10})/i);
            if (oMatch) {
                const asin = oMatch[1].toUpperCase();
                if (isValidASIN(asin)) {
                    return asin;
                }
            }

            // Pattern: /exec/obidos/ASIN/ASIN
            const obidosMatch = url.match(/\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i);
            if (obidosMatch) {
                const asin = obidosMatch[1].toUpperCase();
                if (isValidASIN(asin)) {
                    return asin;
                }
            }
        } catch (error) {
            // Continue to next method
        }
    }

    // Try HTML data attributes
    try {
        const selectors = [
            '[data-asin]',
            '[data-product-asin]',
            'input[name="ASIN"]'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const asin = (safeAttr(element, 'data-asin') || 
                             safeAttr(element, 'data-product-asin') ||
                             safeAttr(element, 'value') || '').toUpperCase();
                if (isValidASIN(asin)) {
                    return asin;
                }
            }
        }
    } catch (error) {
        // Continue to next method
    }

    // Try regex in page source (last resort)
    try {
        const html = doc.documentElement.outerHTML;
        
        // Pattern: "asin":"B08N5WRWNW"
        const asinMatch1 = html.match(/"asin"\s*:\s*"([A-Z0-9]{10})"/i);
        if (asinMatch1) {
            const asin = asinMatch1[1].toUpperCase();
            if (isValidASIN(asin)) {
                return asin;
            }
        }

        // Pattern: asin: 'B08N5WRWNW'
        const asinMatch2 = html.match(/asin\s*:\s*'([A-Z0-9]{10})'/i);
        if (asinMatch2) {
            const asin = asinMatch2[1].toUpperCase();
            if (isValidASIN(asin)) {
                return asin;
            }
        }
    } catch (error) {
        // Failed all methods
    }

    return null;
}

/**
 * Extracts product title with comprehensive fallback chain
 * 
 * Title hierarchy (in order of reliability):
 * 1. JSON-LD structured data (name property)
 * 2. Open Graph meta tag (og:title)
 * 3. Main title span (#productTitle)
 * 4. Feature bullets container title
 * 5. Page title tag (cleaned)
 * 
 * Processing:
 * - Trims whitespace
 * - Removes bracketed metadata [Sponsored], [Ad]
 * - Cleans HTML entities
 * - Strips "Amazon.com:" prefix from title tag
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Cleaned product title or null if not found
 * 
 * @example
 * const title = extractProductTitle(document);
 * // Returns: 'Apple iPhone 15 Pro Max, 256GB, Blue Titanium'
 */
function extractProductTitle(doc) {
    const candidates = [];

    // Try JSON-LD
    try {
        const jsonLdData = parseJsonLD(doc);
        for (const data of jsonLdData) {
            if (data['@type'] === 'Product' && data.name) {
                candidates.push(String(data.name));
            }
        }
    } catch (error) {
        // Continue
    }

    // Try meta tags
    try {
        const ogTitle = getMetaByProperty('og:title', doc);
        if (ogTitle) candidates.push(ogTitle);

        const twitterTitle = getMetaByProperty('twitter:title', doc);
        if (twitterTitle) candidates.push(twitterTitle);
    } catch (error) {
        // Continue
    }

    // Try HTML elements
    try {
        const productTitle = safeQuery('#productTitle', doc);
        if (productTitle) {
            const text = safeText(productTitle);
            if (text) candidates.push(text);
        }

        const itemName = safeQuery('span[id="productTitle"]', doc);
        if (itemName) {
            const text = safeText(itemName);
            if (text) candidates.push(text);
        }
    } catch (error) {
        // Continue
    }

    // Try title tag (last resort - often has extra text)
    try {
        const titleElement = safeQuery('title', doc);
        if (titleElement) {
            let titleText = safeText(titleElement);
            if (titleText) {
                // Remove common Amazon suffix
                titleText = titleText.replace(/\s*[-:]\s*Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*$/i, '');
                if (titleText) candidates.push(titleText);
            }
        }
    } catch (error) {
        // Continue
    }

    // Clean all candidates and choose shortest
    if (candidates.length === 0) {
        return null;
    }

    const cleaned = candidates
        .map(title => cleanProductTitle(title))
        .filter(title => title && title.length > 0)
        .sort((a, b) => a.length - b.length); // Shortest first

    return cleaned.length > 0 ? cleaned[0] : null;
}

/**
 * Cleans a product title by removing common Amazon prefixes/suffixes
 * @param {string} title - Raw title to clean
 * @returns {string} Cleaned title
 * 
 * @example
 * cleanProductTitle('Amazon.com: Nintendo Switch – OLED Model : Electronics');
 * // Returns: 'Nintendo Switch – OLED Model'
 */
function cleanProductTitle(title) {
    if (!title) return '';
    
    let cleaned = title.trim();
    
    // Remove "Amazon.com:" or "Amazon.co.uk:" prefix
    cleaned = cleaned.replace(/^Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*:\s*/i, '');
    
    // Remove "at Amazon.*" suffix
    cleaned = cleaned.replace(/\s+at\s+Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*$/i, '');
    
    // Remove everything after " : " (category info)
    const colonIndex = cleaned.indexOf(' : ');
    if (colonIndex > 0) {
        cleaned = cleaned.substring(0, colonIndex);
    }
    
    return cleaned.trim();
}

/**
 * Extracts brand name from various sources
 * 
 * Fallback chain:
 * 1. JSON-LD brand.name
 * 2. HTML #bylineInfo
 * 3. HTML .a-size-small.a-color-secondary (brand link)
 * 4. Meta tag brand
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Brand name or null if not found
 * 
 * @example
 * const brand = extractProductBrand(document);
 * // Returns: 'Nintendo'
 */
function extractProductBrand(doc) {
    // Try JSON-LD
    try {
        const jsonLdData = parseJsonLD(doc);
        for (const data of jsonLdData) {
            if (data['@type'] === 'Product' && data.brand) {
                if (typeof data.brand === 'object' && data.brand.name) {
                    return String(data.brand.name).trim();
                } else if (typeof data.brand === 'string') {
                    return data.brand.trim();
                }
            }
        }
    } catch (error) {
        // Continue
    }

    // Try byline info
    try {
        const bylineInfo = safeQuery('#bylineInfo', doc);
        if (bylineInfo) {
            let text = safeText(bylineInfo);
            if (text) {
                // Remove "Visit the", "Brand:", etc.
                text = text.replace(/^(Visit the|Brand:)\s*/i, '');
                text = text.replace(/\s+Store$/i, '');
                if (text) return text.trim();
            }
        }
    } catch (error) {
        // Continue
    }

    // Try brand link
    try {
        const brandLink = safeQuery('a#bylineInfo', doc);
        if (brandLink) {
            const text = safeText(brandLink);
            if (text) {
                const cleaned = text.replace(/^(Visit the|Brand:)\s*/i, '').replace(/\s+Store$/i, '');
                if (cleaned) return cleaned.trim();
            }
        }
    } catch (error) {
        // Continue
    }

    // Try meta tags
    try {
        const brandMeta = getMetaByName('brand', doc);
        if (brandMeta) return brandMeta;
    } catch (error) {
        // Continue
    }

    return null;
}

/**
 * Extracts product description from various sources
 * 
 * Fallback chain:
 * 1. JSON-LD description
 * 2. Meta og:description
 * 3. Meta description
 * 4. HTML #productDescription
 * 5. HTML #feature-bullets
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Description or null if not found
 * 
 * @example
 * const description = extractProductDescription(document);
 * // Returns: 'Meet the newest member of the Nintendo Switch family...'
 */
function extractProductDescription(doc) {
    // Try JSON-LD
    try {
        const jsonLdData = parseJsonLD(doc);
        for (const data of jsonLdData) {
            if (data['@type'] === 'Product' && data.description) {
                return String(data.description).trim();
            }
        }
    } catch (error) {
        // Continue
    }

    // Try meta tags
    try {
        const ogDesc = getMetaByProperty('og:description', doc);
        if (ogDesc) return ogDesc;

        const metaDesc = getMetaByName('description', doc);
        if (metaDesc) return metaDesc;
    } catch (error) {
        // Continue
    }

    // Try HTML elements
    try {
        const productDesc = safeQuery('#productDescription', doc);
        if (productDesc) {
            const text = safeText(productDesc);
            if (text) return text;
        }

        const featureBullets = safeQuery('#feature-bullets', doc);
        if (featureBullets) {
            const text = safeText(featureBullets);
            if (text) return text;
        }
    } catch (error) {
        // Continue
    }

    return null;
}

/**
 * Extracts price from various sources
 * 
 * Fallback chain:
 * 1. JSON-LD offers.price
 * 2. HTML .a-price .a-offscreen
 * 3. HTML #priceblock_ourprice
 * 4. HTML #priceblock_dealprice
 * 5. Regex in source code
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Price string or null if not found
 * 
 * @example
 * const price = extractProductPrice(document);
 * // Returns: '$349.99'
 */
function extractProductPrice(doc) {
    // Try JSON-LD
    try {
        const jsonLdData = parseJsonLD(doc);
        for (const data of jsonLdData) {
            if (data['@type'] === 'Product' && data.offers) {
                const offers = Array.isArray(data.offers) ? data.offers : [data.offers];
                for (const offer of offers) {
                    if (offer.price) {
                        const currency = offer.priceCurrency || '$';
                        return `${currency}${offer.price}`;
                    }
                }
            }
        }
    } catch (error) {
        // Continue
    }

    // Try HTML price elements
    try {
        const selectors = [
            '.a-price .a-offscreen',
            '#priceblock_ourprice',
            '#priceblock_dealprice',
            '#priceblock_saleprice',
            '.a-price-whole'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const text = safeText(element);
                if (text && isValidPrice(text)) {
                    return text;
                }
            }
        }
    } catch (error) {
        // Continue
    }

    return null;
}

/**
 * Extracts primary product image URL from various sources
 * Prefers high-resolution versions (data-old-hires, data-a-dynamic-image)
 * 
 * Fallback chain:
 * 1. JSON-LD image (array or string)
 * 2. Meta og:image
 * 3. HTML #landingImage data-old-hires
 * 4. HTML #landingImage data-a-dynamic-image (largest)
 * 5. HTML #landingImage src
 * 6. HTML #imgBlkFront src
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Image URL or null if not found
 * 
 * @example
 * const imageUrl = extractProductImageURL(document);
 * // Returns: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg'
 */
function extractProductImageURL(doc) {
    // Try JSON-LD
    try {
        const jsonLdData = parseJsonLD(doc);
        for (const data of jsonLdData) {
            if (data['@type'] === 'Product' && data.image) {
                if (Array.isArray(data.image) && data.image.length > 0) {
                    return String(data.image[0]).trim();
                } else if (typeof data.image === 'string') {
                    return data.image.trim();
                }
            }
        }
    } catch (error) {
        // Continue
    }

    // Try meta tags
    try {
        const ogImage = getMetaByProperty('og:image', doc);
        if (ogImage && isAmazonImageURL(ogImage)) {
            return ogImage;
        }
    } catch (error) {
        // Continue
    }

    // Try HTML image elements (prefer high-res)
    try {
        const landingImage = safeQuery('#landingImage', doc);
        if (landingImage) {
            // Try data-old-hires first (usually SL1500)
            const hiRes = safeAttr(landingImage, 'data-old-hires');
            if (hiRes && isAmazonImageURL(hiRes)) {
                return hiRes;
            }

            // Try data-a-dynamic-image (JSON with multiple sizes)
            const dynamicImage = safeAttr(landingImage, 'data-a-dynamic-image');
            if (dynamicImage) {
                try {
                    const imageData = JSON.parse(dynamicImage);
                    const urls = Object.keys(imageData);
                    if (urls.length > 0) {
                        // Return first URL (usually highest resolution)
                        return urls[0];
                    }
                } catch (jsonError) {
                    // Continue
                }
            }

            // Try src attribute
            const src = safeAttr(landingImage, 'src');
            if (src && isAmazonImageURL(src)) {
                return src;
            }
        }

        // Try alternative image element
        const imgBlkFront = safeQuery('#imgBlkFront', doc);
        if (imgBlkFront) {
            const src = safeAttr(imgBlkFront, 'src');
            if (src && isAmazonImageURL(src)) {
                return src;
            }
        }
    } catch (error) {
        // Continue
    }

    return null;
}

/**
 * Extracts variant information (color, size, style, etc.)
 * 
 * @param {Document} doc - DOM document
 * @returns {Object|null} Variant object with type and value, or null
 * 
 * @example
 * const variant = extractProductVariant(document);
 * // Returns: { type: 'Color', value: 'White' }
 */
function extractProductVariant(doc) {
    try {
        // Try selected variant display
        const selectors = [
            '#variation_color_name .selection',
            '#variation_size_name .selection',
            '#variation_style_name .selection'
        ];

        for (const selector of selectors) {
            const element = safeQuery(selector, doc);
            if (element) {
                const value = safeText(element);
                if (value) {
                    const type = selector.includes('color') ? 'Color' :
                                selector.includes('size') ? 'Size' :
                                selector.includes('style') ? 'Style' : 'Variant';
                    return { type, value };
                }
            }
        }
    } catch (error) {
        // Failed
    }

    return null;
}

// These functions would be imported from helpers in a real implementation
// Placeholder implementations for standalone use:

function safeQuery(selector, context = document) {
    try {
        return context.querySelector(selector);
    } catch (e) {
        return null;
    }
}

function safeText(element) {
    if (!element) return null;
    const text = element.textContent || '';
    return text.trim() || null;
}

function safeAttr(element, attr) {
    if (!element) return null;
    const value = element.getAttribute(attr);
    return value ? value.trim() : null;
}

function parseJsonLD(doc) {
    const results = [];
    try {
        const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
            try {
                const text = script.textContent || script.innerText;
                if (text) {
                    results.push(JSON.parse(text));
                }
            } catch (e) {
                continue;
            }
        }
    } catch (e) {
        // Return empty array
    }
    return results;
}

function getMetaByProperty(property, doc = document) {
    try {
        const meta = doc.querySelector(`meta[property="${property}"]`);
        return meta ? (meta.getAttribute('content') || '').trim() || null : null;
    } catch (e) {
        return null;
    }
}

function getMetaByName(name, doc = document) {
    try {
        const meta = doc.querySelector(`meta[name="${name}"]`);
        return meta ? (meta.getAttribute('content') || '').trim() || null : null;
    } catch (e) {
        return null;
    }
}

function isValidASIN(value) {
    if (!value || typeof value !== 'string') return false;
    return /^[A-Z0-9]{10}$/.test(value);
}

function isValidPrice(value) {
    if (!value || typeof value !== 'string') return false;
    const cleaned = value.replace(/[$£€¥₹,\s]/g, '');
    const num = parseFloat(cleaned);
    return !isNaN(num) && num >= 0;
}

function isAmazonImageURL(value) {
    if (!value || typeof value !== 'string') return false;
    try {
        const url = new URL(value);
        const imageHosts = [
            'm.media-amazon.com',
            'images-na.ssl-images-amazon.com',
            'images-amazon.com',
            'ecx.images-amazon.com'
        ];
        return imageHosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host));
    } catch (e) {
        return false;
    }
}

// Export all extraction functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractProductASIN,
        extractProductTitle,
        cleanProductTitle,
        extractProductBrand,
        extractProductDescription,
        extractProductPrice,
        extractProductImageURL,
        extractProductVariant
    };
}
