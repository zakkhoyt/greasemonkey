/**
 * @file link_cleaner.js
 * @description Cleans and builds Amazon URLs and titles
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Links.Cleaner
 * 
 * Provides functions to:
 * - Remove tracking parameters from URLs
 * - Preserve variant parameters (th, psc, smid)
 * - Build clean URLs in short/long/medium formats
 * - Clean and shorten titles
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL MDN URL API}
 */

'use strict';

/**
 * Cleans an Amazon URL by removing tracking parameters
 * 
 * @param {string} urlString - URL to clean
 * @param {Object} [options={}] - Cleaning options
 * @param {boolean} [options.preserveVariants=true] - Keep variant parameters (th, psc)
 * @param {boolean} [options.preserveSeller=false] - Keep seller parameter (smid)
 * @returns {string|null} Cleaned URL or null
 * 
 * @example
 * cleanAmazonURL('https://amazon.com/dp/B08N5WRWNW?th=1&pd_rd_w=abc&psc=1')
 * // Returns: 'https://amazon.com/dp/B08N5WRWNW?th=1&psc=1'
 * 
 * cleanAmazonURL('https://amazon.com/dp/B08N5WRWNW?th=1&psc=1', { preserveVariants: false })
 * // Returns: 'https://amazon.com/dp/B08N5WRWNW'
 */
function cleanAmazonURL(urlString, options = {}) {
    const { preserveVariants = true, preserveSeller = false } = options;

    try {
        const urlObj = new URL(urlString);
        
        // Build clean URL with base path
        let cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
        
        // Add back variant parameters if requested
        if (preserveVariants || preserveSeller) {
            const paramsToKeep = [];
            
            if (preserveVariants) {
                const th = urlObj.searchParams.get('th');
                const psc = urlObj.searchParams.get('psc');
                if (th) paramsToKeep.push(`th=${th}`);
                if (psc) paramsToKeep.push(`psc=${psc}`);
            }
            
            if (preserveSeller) {
                const smid = urlObj.searchParams.get('smid');
                if (smid) paramsToKeep.push(`smid=${smid}`);
            }
            
            if (paramsToKeep.length > 0) {
                cleanUrl += '?' + paramsToKeep.join('&');
            }
        }
        
        return cleanUrl;
    } catch (error) {
        logError('Failed to clean URL:', error);
        return null;
    }
}

/**
 * Builds Amazon URL from components
 * 
 * @param {Object} components - URL components
 * @param {string} components.asin - Product ASIN
 * @param {string} [components.hostname='www.amazon.com'] - Amazon hostname
 * @param {string} [components.protocol='https:'] - Protocol
 * @param {Object} [components.queryParams={}] - Query parameters
 * @param {string} [format='short'] - URL format: 'short', 'long', 'medium'
 * @returns {string|null} Built URL or null
 * 
 * @example
 * buildAmazonURL({ asin: 'B08N5WRWNW' }, 'short')
 * // Returns: 'https://www.amazon.com/dp/B08N5WRWNW'
 * 
 * buildAmazonURL({ asin: 'B08N5WRWNW', queryParams: { th: '1', psc: '1' } }, 'medium')
 * // Returns: 'https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1'
 */
function buildAmazonURL(components, format = 'short') {
    const {
        asin,
        hostname = 'www.amazon.com',
        protocol = 'https:',
        queryParams = {}
    } = components;

    if (!asin || !isValidASIN(asin)) {
        logWarn('Invalid ASIN provided to buildAmazonURL');
        return null;
    }

    // Build base URL
    let url = `${protocol}//${hostname}/dp/${asin}`;

    // Add parameters based on format
    if (format === 'short') {
        // No parameters
        return url;
    }

    if (format === 'medium') {
        // Only variant parameters
        const variantParams = [];
        if (queryParams.th) variantParams.push(`th=${queryParams.th}`);
        if (queryParams.psc) variantParams.push(`psc=${queryParams.psc}`);
        
        if (variantParams.length > 0) {
            url += '?' + variantParams.join('&');
        }
        return url;
    }

    if (format === 'long') {
        // All parameters
        const paramStr = Object.entries(queryParams)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        
        if (paramStr) {
            url += '?' + paramStr;
        }
        return url;
    }

    return url;
}

/**
 * Cleans product title by removing Amazon-specific text
 * 
 * @param {string} title - Raw title
 * @returns {string} Cleaned title
 * 
 * @example
 * cleanProductTitle('Amazon.com: Nintendo Switch – OLED Model : Video Games')
 * // Returns: 'Nintendo Switch – OLED Model'
 */
function cleanProductTitle(title) {
    if (!title) return '';
    
    let cleaned = title.trim();
    
    // Remove "Amazon.com:" prefix
    cleaned = cleaned.replace(/^Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*:\s*/i, '');
    
    // Remove "at Amazon.*" suffix
    cleaned = cleaned.replace(/\s+at\s+Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*$/i, '');
    
    // Remove category after " : "
    const colonIndex = cleaned.indexOf(' : ');
    if (colonIndex > 0) {
        cleaned = cleaned.substring(0, colonIndex);
    }
    
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    return cleaned.trim();
}

/**
 * Shortens title if it exceeds maximum length
 * 
 * @param {string} title - Title to shorten
 * @param {number} [maxLength=80] - Maximum length
 * @param {string} [ellipsis='...'] - Ellipsis to add
 * @returns {string} Shortened title
 * 
 * @example
 * shortenTitle('Very Long Product Title That Goes On And On', 30)
 * // Returns: 'Very Long Product Title...'
 */
function shortenTitle(title, maxLength = 80, ellipsis = '...') {
    if (!title || title.length <= maxLength) {
        return title || '';
    }
    
    // Try to break at word boundary
    const truncated = title.substring(0, maxLength - ellipsis.length);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength / 2) {
        return truncated.substring(0, lastSpace) + ellipsis;
    }
    
    return truncated + ellipsis;
}

/**
 * Removes tracking parameters from URL
 * @param {string} urlString - URL with potential tracking params
 * @returns {string|null} URL without tracking params
 */
function removeTrackingParams(urlString) {
    try {
        const urlObj = new URL(urlString);
        const trackingPrefixes = ['pd_rd_', 'pf_rd_', '_encoding', 'qid', 'sr', 'keywords', 'crid', 'sprefix', 'dib', 'tag', 'linkCode', 'linkId', 'ref', 'ref_'];
        
        // Remove tracking parameters
        for (const [key] of Array.from(urlObj.searchParams.entries())) {
            if (trackingPrefixes.some(prefix => key.toLowerCase().startsWith(prefix))) {
                urlObj.searchParams.delete(key);
            }
        }
        
        return urlObj.toString();
    } catch (error) {
        return null;
    }
}

/**
 * Normalizes Amazon hostname to preferred domain
 * @param {string} hostname - Current hostname
 * @param {string} [preferredDomain='com'] - Preferred TLD
 * @returns {string} Normalized hostname
 */
function normalizeAmazonHostname(hostname, preferredDomain = 'com') {
    // Remove 'www.' prefix if present
    const clean = hostname.replace(/^www\./, '');
    
    // If already on preferred domain, return with www
    if (clean === `amazon.${preferredDomain}`) {
        return `www.amazon.${preferredDomain}`;
    }
    
    // Otherwise return original with www
    return hostname.startsWith('www.') ? hostname : `www.${hostname}`;
}

// Placeholder functions
function isValidASIN(value) {
    if (!value || typeof value !== 'string') return false;
    return /^[A-Z0-9]{10}$/.test(value);
}

function logWarn(...args) { /* Implementation in logging_helpers.js */ }
function logError(...args) { /* Implementation in logging_helpers.js */ }

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        cleanAmazonURL,
        buildAmazonURL,
        cleanProductTitle,
        shortenTitle,
        removeTrackingParams,
        normalizeAmazonHostname
    };
}
