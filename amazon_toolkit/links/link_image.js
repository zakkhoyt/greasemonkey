/**
 * @file link_image.js
 * @description Compose and manipulate Amazon image URLs
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Links.Image
 * 
 * Provides functions to:
 * - Extract image IDs from Amazon image URLs
 * - Build image URLs with specific sizes and formats
 * - Resize existing image URLs
 * - Generate variant image URLs
 * 
 * Amazon image URL format:
 * https://m.media-amazon.com/images/I/{IMAGE_ID}._{MODIFIERS}.{EXT}
 * 
 * Common modifiers:
 * - SL500 - Side Length 500px (square crop)
 * - SX500 - Side X (width) 500px
 * - SY500 - Side Y (height) 500px
 * - QL95 - Quality Level 95%
 * - AC - Auto Crop
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL MDN URL API}
 */

'use strict';

/**
 * Extracts image ID from Amazon image URL
 * 
 * @param {string} imageUrl - Amazon image URL
 * @returns {string|null} Image ID or null
 * 
 * @example
 * extractImageID('https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg')
 * // Returns: '61CGHv6kmWL'
 */
function extractImageID(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
        return null;
    }

    // Pattern: /images/I/{IMAGE_ID}.
    const match = imageUrl.match(/\/images\/[ISP]\/([A-Za-z0-9+_-]+)\./);
    return match ? match[1] : null;
}

/**
 * Builds Amazon image URL from image ID
 * 
 * @param {string} imageId - Amazon image ID
 * @param {Object} [options={}] - Image options
 * @param {number} [options.size=500] - Image size (used for SL modifier)
 * @param {number} [options.width] - Width (SX modifier)
 * @param {number} [options.height] - Height (SY modifier)
 * @param {number} [options.quality=95] - Quality level (1-100)
 * @param {string} [options.format='jpg'] - Image format (jpg, png, gif)
 * @param {boolean} [options.autoCrop=false] - Enable auto crop (AC modifier)
 * @param {string} [options.host='m.media-amazon.com'] - Image host
 * @returns {string|null} Image URL or null
 * 
 * @example
 * buildImageURL('61CGHv6kmWL')
 * // Returns: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL500_.jpg'
 * 
 * buildImageURL('61CGHv6kmWL', { size: 1500, quality: 100 })
 * // Returns: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_QL100_.jpg'
 * 
 * buildImageURL('61CGHv6kmWL', { width: 800, height: 600, autoCrop: true })
 * // Returns: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SX800_SY600_AC_.jpg'
 */
function buildImageURL(imageId, options = {}) {
    if (!imageId) {
        return null;
    }

    const {
        size,
        width,
        height,
        quality = 95,
        format = 'jpg',
        autoCrop = false,
        host = 'm.media-amazon.com'
    } = options;

    // Build modifiers
    const modifiers = [];

    if (width) {
        modifiers.push(`SX${width}`);
    }
    if (height) {
        modifiers.push(`SY${height}`);
    }
    if (size && !width && !height) {
        modifiers.push(`SL${size}`);
    }
    if (!size && !width && !height) {
        // Default size
        modifiers.push('SL500');
    }
    if (quality && quality !== 95) {
        modifiers.push(`QL${quality}`);
    }
    if (autoCrop) {
        modifiers.push('AC');
    }

    const modifierString = modifiers.length > 0 ? `_${modifiers.join('_')}_` : '';
    return `https://${host}/images/I/${imageId}.${modifierString}.${format}`;
}

/**
 * Resizes an existing Amazon image URL
 * 
 * @param {string} imageUrl - Existing Amazon image URL
 * @param {number|Object} sizeOrOptions - New size (number) or options object
 * @returns {string|null} Resized image URL or null
 * 
 * @example
 * resizeImageURL('https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg', 500)
 * // Returns: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL500_.jpg'
 * 
 * resizeImageURL('https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg', { width: 800, height: 600 })
 * // Returns: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SX800_SY600_.jpg'
 */
function resizeImageURL(imageUrl, sizeOrOptions) {
    const imageId = extractImageID(imageUrl);
    if (!imageId) {
        return null;
    }

    // Parse options
    let options;
    if (typeof sizeOrOptions === 'number') {
        options = { size: sizeOrOptions };
    } else if (typeof sizeOrOptions === 'object') {
        options = sizeOrOptions;
    } else {
        options = {};
    }

    // Extract format from original URL if not specified
    if (!options.format) {
        const formatMatch = imageUrl.match(/\.([a-z]{3,4})$/i);
        if (formatMatch) {
            options.format = formatMatch[1].toLowerCase();
        }
    }

    return buildImageURL(imageId, options);
}

/**
 * Generates multiple image URLs at different sizes
 * 
 * @param {string} imageIdOrUrl - Image ID or URL
 * @param {Array<number>} [sizes=[75, 160, 500, 1000, 1500]] - Array of sizes
 * @returns {Object} Object mapping size to URL
 * 
 * @example
 * generateImageVariants('61CGHv6kmWL')
 * // Returns:
 * {
 *   75: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL75_.jpg',
 *   160: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL160_.jpg',
 *   500: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL500_.jpg',
 *   1000: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1000_.jpg',
 *   1500: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_.jpg'
 * }
 */
function generateImageVariants(imageIdOrUrl, sizes = [75, 160, 500, 1000, 1500]) {
    // Extract image ID if URL provided
    const imageId = imageIdOrUrl.includes('/')
        ? extractImageID(imageIdOrUrl)
        : imageIdOrUrl;

    if (!imageId) {
        return {};
    }

    const variants = {};
    for (const size of sizes) {
        variants[size] = buildImageURL(imageId, { size });
    }

    return variants;
}

/**
 * Parses image URL to extract components
 * 
 * @param {string} imageUrl - Amazon image URL
 * @returns {Object|null} Parsed components or null
 * 
 * @example
 * parseImageURL('https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1500_QL95_AC_.jpg')
 * // Returns:
 * {
 *   imageId: '61CGHv6kmWL',
 *   host: 'm.media-amazon.com',
 *   modifiers: ['SL1500', 'QL95', 'AC'],
 *   size: 1500,
 *   quality: 95,
 *   autoCrop: true,
 *   format: 'jpg'
 * }
 */
function parseImageURL(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
        return null;
    }

    const imageId = extractImageID(imageUrl);
    if (!imageId) {
        return null;
    }

    try {
        const url = new URL(imageUrl);
        const host = url.hostname;
        
        // Extract modifiers and format
        const match = imageUrl.match(/\.([^.]+)\.([a-z]{3,4})$/i);
        if (!match) {
            return { imageId, host, modifiers: [], format: 'jpg' };
        }

        const modifierString = match[1];
        const format = match[2].toLowerCase();
        const modifiers = modifierString.split('_').filter(m => m.length > 0);

        // Parse specific modifiers
        let size = null;
        let width = null;
        let height = null;
        let quality = null;
        let autoCrop = false;

        for (const mod of modifiers) {
            if (mod.startsWith('SL')) {
                size = parseInt(mod.substring(2));
            } else if (mod.startsWith('SX')) {
                width = parseInt(mod.substring(2));
            } else if (mod.startsWith('SY')) {
                height = parseInt(mod.substring(2));
            } else if (mod.startsWith('QL')) {
                quality = parseInt(mod.substring(2));
            } else if (mod === 'AC') {
                autoCrop = true;
            }
        }

        return {
            imageId,
            host,
            modifiers,
            size,
            width,
            height,
            quality,
            autoCrop,
            format
        };
    } catch (error) {
        return { imageId, host: null, modifiers: [], format: 'jpg' };
    }
}

/**
 * Checks if URL is a valid Amazon image URL
 * @param {string} url - URL to check
 * @returns {boolean} True if valid Amazon image URL
 */
function isAmazonImageURL(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const urlObj = new URL(url);
        const imageHosts = [
            'm.media-amazon.com',
            'images-na.ssl-images-amazon.com',
            'images-amazon.com',
            'ecx.images-amazon.com'
        ];
        return imageHosts.some(host => urlObj.hostname === host || urlObj.hostname.endsWith('.' + host));
    } catch (error) {
        return false;
    }
}

/**
 * Gets the highest resolution version of an image URL
 * @param {string} imageUrl - Amazon image URL
 * @param {number} [maxSize=1500] - Maximum size to try
 * @returns {string|null} Highest resolution URL or null
 */
function getHighestResolution(imageUrl, maxSize = 1500) {
    const imageId = extractImageID(imageUrl);
    if (!imageId) {
        return null;
    }

    // Try common high-res sizes
    return buildImageURL(imageId, { size: maxSize });
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractImageID,
        buildImageURL,
        resizeImageURL,
        generateImageVariants,
        parseImageURL,
        isAmazonImageURL,
        getHighestResolution
    };
}
