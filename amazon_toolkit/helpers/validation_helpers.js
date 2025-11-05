/**
 * @file validation_helpers.js
 * @description Validation utilities for Amazon Toolkit
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Helpers.Validation
 * 
 * Provides validation functions for Amazon-specific data types and formats.
 * All validators return boolean values and handle null/undefined gracefully.
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions MDN RegExp}
 */

'use strict';

/**
 * Amazon ASIN format: 10 characters, alphanumeric (uppercase)
 * @constant {RegExp}
 * @see {@link https://www.amazon.com/gp/help/customer/display.html?nodeId=201889580 Amazon ASIN}
 */
const ASIN_PATTERN = /^[A-Z0-9]{10}$/;

/**
 * Amazon product URL patterns
 * @constant {Array<RegExp>}
 */
const PRODUCT_URL_PATTERNS = [
    /\/dp\/[A-Z0-9]{10}/i,
    /\/gp\/product\/[A-Z0-9]{10}/i,
    /\/o\/ASIN\/[A-Z0-9]{10}/i,
    /\/exec\/obidos\/ASIN\/[A-Z0-9]{10}/i
];

/**
 * Amazon store URL patterns
 * @constant {Array<RegExp>}
 */
const STORE_URL_PATTERNS = [
    /\/stores\/[^\/]+\/page\/[A-Z0-9-]+/i,
    /\/s\?me=/i,
    /\/s\?marketplaceID=/i
];

/**
 * Amazon domain patterns
 * @constant {RegExp}
 */
const AMAZON_DOMAIN_PATTERN = /^(www\.)?amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)$/i;

/**
 * Validates if a string is a valid Amazon ASIN
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid ASIN format
 * 
 * @example
 * isValidASIN('B08N5WRWNW');  // true
 * isValidASIN('12345');       // false (too short)
 * isValidASIN('B08n5wrwnw');  // false (lowercase not allowed)
 * isValidASIN(null);          // false
 */
function isValidASIN(value) {
    if (!value || typeof value !== 'string') {
        return false;
    }
    return ASIN_PATTERN.test(value);
}

/**
 * Validates if a URL string is a valid URL format
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid URL format
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL MDN URL}
 * 
 * @example
 * isValidURL('https://www.amazon.com/dp/B08N5WRWNW');  // true
 * isValidURL('not a url');                             // false
 * isValidURL(null);                                    // false
 */
function isValidURL(value) {
    if (!value || typeof value !== 'string') {
        return false;
    }
    try {
        new URL(value);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Validates if a URL is an Amazon URL
 * @param {*} value - Value to validate (string or URL object)
 * @returns {boolean} True if valid Amazon URL
 * 
 * @example
 * isAmazonURL('https://www.amazon.com/dp/B08N5WRWNW');  // true
 * isAmazonURL('https://www.google.com');                // false
 * isAmazonURL(null);                                    // false
 */
function isAmazonURL(value) {
    if (!value) {
        return false;
    }
    
    try {
        const url = typeof value === 'string' ? new URL(value) : value;
        return AMAZON_DOMAIN_PATTERN.test(url.hostname);
    } catch (error) {
        return false;
    }
}

/**
 * Validates if a URL is an Amazon product URL
 * @param {*} value - Value to validate (string or URL object)
 * @returns {boolean} True if valid Amazon product URL
 * 
 * @example
 * isAmazonProductURL('https://www.amazon.com/dp/B08N5WRWNW');  // true
 * isAmazonProductURL('https://www.amazon.com/s?k=headphones'); // false
 * isAmazonProductURL(null);                                    // false
 */
function isAmazonProductURL(value) {
    if (!isAmazonURL(value)) {
        return false;
    }
    
    try {
        const url = typeof value === 'string' ? new URL(value) : value;
        const pathname = url.pathname;
        return PRODUCT_URL_PATTERNS.some(pattern => pattern.test(pathname));
    } catch (error) {
        return false;
    }
}

/**
 * Validates if a URL is an Amazon store URL
 * @param {*} value - Value to validate (string or URL object)
 * @returns {boolean} True if valid Amazon store URL
 * 
 * @example
 * isAmazonStoreURL('https://www.amazon.com/stores/page/ABC-123');  // true
 * isAmazonStoreURL('https://www.amazon.com/dp/B08N5WRWNW');        // false
 * isAmazonStoreURL(null);                                          // false
 */
function isAmazonStoreURL(value) {
    if (!isAmazonURL(value)) {
        return false;
    }
    
    try {
        const url = typeof value === 'string' ? new URL(value) : value;
        const pathname = url.pathname;
        const search = url.search;
        return STORE_URL_PATTERNS.some(pattern => pattern.test(pathname) || pattern.test(search));
    } catch (error) {
        return false;
    }
}

/**
 * Validates if a string is a valid Amazon image URL
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid Amazon image URL
 * 
 * @example
 * isAmazonImageURL('https://m.media-amazon.com/images/I/71ABC123._SL500_.jpg');  // true
 * isAmazonImageURL('https://www.google.com/image.jpg');                          // false
 * isAmazonImageURL(null);                                                        // false
 */
function isAmazonImageURL(value) {
    if (!value || typeof value !== 'string') {
        return false;
    }
    
    try {
        const url = new URL(value);
        // Check for Amazon image domains
        const imageHosts = [
            'm.media-amazon.com',
            'images-na.ssl-images-amazon.com',
            'images-amazon.com',
            'ecx.images-amazon.com'
        ];
        return imageHosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host));
    } catch (error) {
        return false;
    }
}

/**
 * Validates if a string is not empty after trimming
 * @param {*} value - Value to validate
 * @returns {boolean} True if non-empty string
 * 
 * @example
 * isNonEmptyString('hello');      // true
 * isNonEmptyString('   ');        // false
 * isNonEmptyString('');           // false
 * isNonEmptyString(null);         // false
 */
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a value is a valid price string
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid price format
 * 
 * @example
 * isValidPrice('$19.99');         // true
 * isValidPrice('19.99');          // true
 * isValidPrice('£15.50');         // true
 * isValidPrice('invalid');        // false
 * isValidPrice(null);             // false
 */
function isValidPrice(value) {
    if (!isNonEmptyString(value)) {
        return false;
    }
    // Remove currency symbols and whitespace
    const cleaned = value.replace(/[$£€¥₹,\s]/g, '');
    // Check if remaining is a valid number
    const num = parseFloat(cleaned);
    return !isNaN(num) && num >= 0;
}

/**
 * Validates if a value is a valid array with at least one element
 * @param {*} value - Value to validate
 * @returns {boolean} True if non-empty array
 * 
 * @example
 * isNonEmptyArray([1, 2, 3]);     // true
 * isNonEmptyArray([]);            // false
 * isNonEmptyArray(null);          // false
 * isNonEmptyArray('not array');   // false
 */
function isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
}

/**
 * Validates if a value is a valid object with at least one property
 * @param {*} value - Value to validate
 * @returns {boolean} True if non-empty object
 * 
 * @example
 * isNonEmptyObject({ a: 1 });     // true
 * isNonEmptyObject({});           // false
 * isNonEmptyObject(null);         // false
 * isNonEmptyObject([]);           // false (arrays are not objects for this check)
 */
function isNonEmptyObject(value) {
    return value !== null && 
           typeof value === 'object' && 
           !Array.isArray(value) && 
           Object.keys(value).length > 0;
}

/**
 * Validates if an HTML element is valid (not null/undefined)
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid element
 * 
 * @example
 * const div = document.createElement('div');
 * isValidElement(div);            // true
 * isValidElement(null);           // false
 * isValidElement('not element');  // false
 */
function isValidElement(value) {
    return value instanceof Element;
}

/**
 * Validates if a value is a valid Document object
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid document
 * 
 * @example
 * isValidDocument(document);      // true
 * isValidDocument(null);          // false
 */
function isValidDocument(value) {
    if (typeof Document !== 'undefined') {
        return value instanceof Document;
    }
    // Fallback for environments without Document constructor
    return value && typeof value.querySelector === 'function';
}

// Export all validation functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js / CommonJS export
    module.exports = {
        ASIN_PATTERN,
        PRODUCT_URL_PATTERNS,
        STORE_URL_PATTERNS,
        AMAZON_DOMAIN_PATTERN,
        isValidASIN,
        isValidURL,
        isAmazonURL,
        isAmazonProductURL,
        isAmazonStoreURL,
        isAmazonImageURL,
        isNonEmptyString,
        isValidPrice,
        isNonEmptyArray,
        isNonEmptyObject,
        isValidElement,
        isValidDocument
    };
}
