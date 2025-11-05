/**
 * @file markdown_generator.js
 * @description Generates markdown links from Amazon data structures
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Markdown.Generator
 * 
 * Generates markdown formatted links from product and store data structures.
 * Supports multiple markdown formats:
 * - Text link: [Title](url)
 * - Image: ![Alt](image_url)
 * - Image link: [![Alt](image_url)](url)
 * - Combined: [Title](url) with image
 * 
 * @see {@link https://www.markdownguide.org/basic-syntax/#links Markdown Links}
 * @see {@link https://www.markdownguide.org/basic-syntax/#images Markdown Images}
 */

'use strict';

/**
 * Generates a markdown text link from product data
 * 
 * @param {Object} productData - Product data structure
 * @param {Object} [options={}] - Generation options
 * @param {string} [options.urlFormat='short'] - URL format: 'short', 'medium', 'long'
 * @param {number} [options.maxTitleLength] - Maximum title length
 * @param {boolean} [options.includeBrand=true] - Include brand in title
 * @param {boolean} [options.includeVariant=true] - Include variant in title
 * @returns {string} Markdown link
 * 
 * @example
 * generateProductLink(productData)
 * // Returns: '[Nintendo Switch – OLED Model (White)](https://www.amazon.com/dp/B08N5WRWNW)'
 * 
 * generateProductLink(productData, { urlFormat: 'medium', includeBrand: false })
 * // Returns: '[Switch – OLED Model (White)](https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1)'
 */
function generateProductLink(productData, options = {}) {
    if (!productData || !productData.asin) {
        return '';
    }

    const {
        urlFormat = 'short',
        maxTitleLength,
        includeBrand = true,
        includeVariant = true
    } = options;

    // Build title
    let title = '';
    if (includeBrand && productData.brand) {
        title += formatBrand(productData.brand) + ' ';
    }
    if (productData.titleCleaned || productData.title) {
        title += formatTitle(productData.titleCleaned || productData.title, {
            maxLength: maxTitleLength,
            escape: true
        });
    }
    if (includeVariant && productData.variant) {
        title += ' ' + formatVariant(productData.variant);
    }

    title = title.trim();
    if (!title) {
        title = 'Amazon Product';
    }

    // Build URL
    const url = buildProductURL(productData, urlFormat);
    if (!url) {
        return title; // Return just title if URL building fails
    }

    return `[${title}](${url})`;
}

/**
 * Generates a markdown image from product data
 * 
 * @param {Object} productData - Product data structure
 * @param {Object} [options={}] - Image options
 * @param {number} [options.imageSize=500] - Image size
 * @param {string} [options.alt] - Alt text (defaults to title)
 * @returns {string} Markdown image
 * 
 * @example
 * generateProductImage(productData)
 * // Returns: '![Nintendo Switch – OLED Model](https://m.media-amazon.com/images/I/61CGHv6kmWL._SL500_.jpg)'
 * 
 * generateProductImage(productData, { imageSize: 1000 })
 * // Returns: '![Nintendo Switch – OLED Model](https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1000_.jpg)'
 */
function generateProductImage(productData, options = {}) {
    if (!productData || !productData.images || !productData.images.primaryId) {
        return '';
    }

    const {
        imageSize = 500,
        alt
    } = options;

    const altText = alt || formatCompleteTitle({
        brand: productData.brand,
        title: productData.titleCleaned || productData.title,
        variant: productData.variant
    });

    const imageUrl = buildImageURL(productData.images.primaryId, { size: imageSize });
    if (!imageUrl) {
        return '';
    }

    return `![${altText}](${imageUrl})`;
}

/**
 * Generates a markdown image link (clickable image) from product data
 * 
 * @param {Object} productData - Product data structure
 * @param {Object} [options={}] - Generation options
 * @param {string} [options.urlFormat='short'] - URL format
 * @param {number} [options.imageSize=500] - Image size
 * @param {string} [options.alt] - Alt text
 * @returns {string} Markdown image link
 * 
 * @example
 * generateProductImageLink(productData)
 * // Returns: '[![Nintendo Switch – OLED Model](image_url)](product_url)'
 */
function generateProductImageLink(productData, options = {}) {
    if (!productData || !productData.asin) {
        return '';
    }

    const {
        urlFormat = 'short',
        imageSize = 500,
        alt
    } = options;

    const image = generateProductImage(productData, { imageSize, alt });
    if (!image) {
        return '';
    }

    const url = buildProductURL(productData, urlFormat);
    if (!url) {
        return image;
    }

    return `[${image}](${url})`;
}

/**
 * Generates a combined markdown with both text link and image
 * 
 * @param {Object} productData - Product data structure
 * @param {Object} [options={}] - Generation options
 * @param {string} [options.format='inline'] - Layout: 'inline', 'block', 'table'
 * @param {string} [options.urlFormat='short'] - URL format
 * @param {number} [options.imageSize=160] - Image size
 * @returns {string} Combined markdown
 * 
 * @example
 * generateProductCombined(productData, { format: 'inline' })
 * // Returns: '[![...](image)](url) [Title](url)'
 * 
 * generateProductCombined(productData, { format: 'block' })
 * // Returns: multi-line markdown with image and link on separate lines
 */
function generateProductCombined(productData, options = {}) {
    if (!productData || !productData.asin) {
        return '';
    }

    const {
        format = 'inline',
        urlFormat = 'short',
        imageSize = 160
    } = options;

    const textLink = generateProductLink(productData, { urlFormat });
    const imageLink = generateProductImageLink(productData, { urlFormat, imageSize });

    if (format === 'inline') {
        return `${imageLink} ${textLink}`;
    }

    if (format === 'block') {
        return `${imageLink}\n\n${textLink}`;
    }

    if (format === 'table') {
        return `| ${imageLink} | ${textLink} |`;
    }

    return `${imageLink} ${textLink}`;
}

/**
 * Generates a markdown link from store data
 * 
 * @param {Object} storeData - Store data structure
 * @param {Object} [options={}] - Generation options
 * @returns {string} Markdown link
 * 
 * @example
 * generateStoreLink(storeData)
 * // Returns: '[Nintendo Store](https://www.amazon.com/stores/page/ABC-123)'
 */
function generateStoreLink(storeData, options = {}) {
    if (!storeData || !storeData.url) {
        return '';
    }

    const title = formatBrand(storeData.storeNameCleaned || storeData.storeName || 'Amazon Store');
    const url = storeData.url.originalClean || storeData.url.original;

    if (!url) {
        return title;
    }

    return `[${title}](${url})`;
}

/**
 * Generates markdown from generic anchor data
 * 
 * @param {Object} anchorData - Anchor data from link_parser
 * @param {Object} [options={}] - Generation options
 * @returns {string} Markdown link
 * 
 * @example
 * generateAnchorLink(anchorData)
 * // Returns: '[Link Text](url)'
 */
function generateAnchorLink(anchorData, options = {}) {
    if (!anchorData) {
        return '';
    }

    const title = formatTitle(
        anchorData.textCleaned || 
        anchorData.text || 
        anchorData.title || 
        'Amazon Link',
        { escape: true }
    );

    const url = anchorData.url?.clean || anchorData.href;

    if (!url) {
        return title;
    }

    return `[${title}](${url})`;
}

/**
 * Builds product URL from product data
 * @param {Object} productData - Product data
 * @param {string} format - URL format
 * @returns {string|null} URL or null
 */
function buildProductURL(productData, format = 'short') {
    if (!productData.asin) {
        return null;
    }

    const hostname = productData.url?.hostname || 'www.amazon.com';
    const protocol = productData.url?.protocol || 'https:';
    const queryParams = productData.url?.queryParams || {};

    return buildAmazonURL(
        { asin: productData.asin, hostname, protocol, queryParams },
        format
    );
}

// Placeholder functions - these would be imported from other modules
function formatBrand(brand) {
    if (!brand) return '';
    return brand.trim().replace(/\s+Store$/i, '');
}

function formatTitle(title, options = {}) {
    if (!title) return '';
    let formatted = title.trim();
    if (options.maxLength && formatted.length > options.maxLength) {
        formatted = formatted.substring(0, options.maxLength - 3) + '...';
    }
    if (options.escape) {
        formatted = formatted.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    }
    return formatted;
}

function formatVariant(variant) {
    if (!variant) return '';
    const text = typeof variant === 'object' ? variant.value : variant;
    return text ? `(${text})` : '';
}

function formatCompleteTitle(components) {
    const parts = [];
    if (components.brand) parts.push(components.brand);
    if (components.title) parts.push(components.title);
    let result = parts.join(' ');
    if (components.variant) result += ' ' + formatVariant(components.variant);
    return result;
}

function buildImageURL(imageId, options = {}) {
    if (!imageId) return null;
    const size = options.size || 500;
    return `https://m.media-amazon.com/images/I/${imageId}._SL${size}_.jpg`;
}

function buildAmazonURL(components, format = 'short') {
    const { asin, hostname = 'www.amazon.com', protocol = 'https:', queryParams = {} } = components;
    if (!asin) return null;

    let url = `${protocol}//${hostname}/dp/${asin}`;

    if (format === 'medium') {
        const params = [];
        if (queryParams.th) params.push(`th=${queryParams.th}`);
        if (queryParams.psc) params.push(`psc=${queryParams.psc}`);
        if (params.length > 0) url += '?' + params.join('&');
    } else if (format === 'long') {
        const paramStr = Object.entries(queryParams).map(([k, v]) => `${k}=${v}`).join('&');
        if (paramStr) url += '?' + paramStr;
    }

    return url;
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateProductLink,
        generateProductImage,
        generateProductImageLink,
        generateProductCombined,
        generateStoreLink,
        generateAnchorLink
    };
}
