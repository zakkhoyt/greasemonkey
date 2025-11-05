/**
 * @file dom_helpers.js
 * @description DOM manipulation and query utilities for Amazon Toolkit
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Helpers.DOM
 * 
 * Provides safe DOM query functions with fallbacks and error handling.
 * Works in both browser (userscript) and Node.js (jsdom) environments.
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document MDN Document API}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element MDN Element API}
 */

'use strict';

/**
 * Safely queries for a single element, returns null if not found
 * @param {string} selector - CSS selector string
 * @param {Document|Element} [context=document] - Context to query within (defaults to document)
 * @returns {Element|null} The first matching element or null
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector MDN querySelector}
 * 
 * @example
 * const title = safeQuery('#productTitle');
 * const price = safeQuery('.a-price-whole', priceContainer);
 */
function safeQuery(selector, context = document) {
    try {
        return context.querySelector(selector);
    } catch (error) {
        return null;
    }
}

/**
 * Safely queries for all matching elements, returns empty array if none found
 * @param {string} selector - CSS selector string
 * @param {Document|Element} [context=document] - Context to query within (defaults to document)
 * @returns {Array<Element>} Array of matching elements (empty if none found)
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll MDN querySelectorAll}
 * 
 * @example
 * const images = safeQueryAll('img.a-dynamic-image');
 * const variants = safeQueryAll('.variation_color_name img');
 */
function safeQueryAll(selector, context = document) {
    try {
        return Array.from(context.querySelectorAll(selector));
    } catch (error) {
        return [];
    }
}

/**
 * Safely gets the text content of an element
 * @param {Element|null} element - Element to get text from
 * @param {boolean} [trim=true] - Whether to trim whitespace
 * @returns {string|null} Text content or null if element is null/invalid
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent MDN textContent}
 * 
 * @example
 * const titleElement = safeQuery('#productTitle');
 * const title = safeText(titleElement); // Returns trimmed text or null
 */
function safeText(element, trim = true) {
    if (!element || !element.textContent) {
        return null;
    }
    try {
        const text = element.textContent;
        return trim ? text.trim() : text;
    } catch (error) {
        return null;
    }
}

/**
 * Safely gets an attribute value from an element
 * @param {Element|null} element - Element to get attribute from
 * @param {string} attributeName - Name of the attribute
 * @param {boolean} [trim=true] - Whether to trim whitespace
 * @returns {string|null} Attribute value or null if not found
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute MDN getAttribute}
 * 
 * @example
 * const img = safeQuery('#landingImage');
 * const src = safeAttr(img, 'src');
 * const dataOldHires = safeAttr(img, 'data-old-hires');
 */
function safeAttr(element, attributeName, trim = true) {
    if (!element || !attributeName) {
        return null;
    }
    try {
        const value = element.getAttribute(attributeName);
        if (!value) {
            return null;
        }
        return trim ? value.trim() : value;
    } catch (error) {
        return null;
    }
}

/**
 * Safely gets inner HTML of an element
 * @param {Element|null} element - Element to get HTML from
 * @returns {string|null} Inner HTML or null if element is null/invalid
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML MDN innerHTML}
 * 
 * @example
 * const container = safeQuery('#feature-bullets');
 * const html = safeInnerHTML(container);
 */
function safeInnerHTML(element) {
    if (!element) {
        return null;
    }
    try {
        return element.innerHTML;
    } catch (error) {
        return null;
    }
}

/**
 * Safely gets outer HTML of an element
 * @param {Element|null} element - Element to get HTML from
 * @returns {string|null} Outer HTML or null if element is null/invalid
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML MDN outerHTML}
 * 
 * @example
 * const anchor = safeQuery('a[href*="/dp/"]');
 * const html = safeOuterHTML(anchor);
 */
function safeOuterHTML(element) {
    if (!element) {
        return null;
    }
    try {
        return element.outerHTML;
    } catch (error) {
        return null;
    }
}

/**
 * Safely parses HTML string into a DOM document
 * @param {string} htmlString - HTML string to parse
 * @returns {Document|null} Parsed document or null on error
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMParser MDN DOMParser}
 * 
 * @example
 * const doc = parseHTML('<div><p>Test</p></div>');
 * const p = safeQuery('p', doc);
 */
function parseHTML(htmlString) {
    if (!htmlString || typeof htmlString !== 'string') {
        return null;
    }
    try {
        const parser = new DOMParser();
        return parser.parseFromString(htmlString, 'text/html');
    } catch (error) {
        return null;
    }
}

/**
 * Safely parses JSON-LD script tags from HTML
 * Returns array of parsed JSON objects
 * @param {Document|Element} [context=document] - Context to search within
 * @returns {Array<Object>} Array of parsed JSON-LD objects (empty if none found)
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script MDN script element}
 * @see {@link https://schema.org/docs/gs.html Schema.org Getting Started}
 * 
 * @example
 * const jsonLdData = parseJsonLD();
 * const productData = jsonLdData.find(obj => obj['@type'] === 'Product');
 */
function parseJsonLD(context = document) {
    const results = [];
    try {
        const scripts = safeQueryAll('script[type="application/ld+json"]', context);
        for (const script of scripts) {
            try {
                const text = safeText(script, false);
                if (text) {
                    const data = JSON.parse(text);
                    results.push(data);
                }
            } catch (parseError) {
                // Skip invalid JSON-LD blocks
                continue;
            }
        }
    } catch (error) {
        // Return empty array on error
    }
    return results;
}

/**
 * Safely gets meta tag content by name attribute
 * @param {string} name - Value of the name attribute
 * @param {Document} [context=document] - Context to search within
 * @returns {string|null} Meta tag content or null if not found
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta MDN meta element}
 * 
 * @example
 * const description = getMetaByName('description');
 * const ogTitle = getMetaByName('og:title');
 */
function getMetaByName(name, context = document) {
    const meta = safeQuery(`meta[name="${name}"]`, context);
    return safeAttr(meta, 'content');
}

/**
 * Safely gets meta tag content by property attribute
 * Used for Open Graph and Twitter Card meta tags
 * @param {string} property - Value of the property attribute
 * @param {Document} [context=document] - Context to search within
 * @returns {string|null} Meta tag content or null if not found
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta MDN meta element}
 * @see {@link https://ogp.me/ Open Graph Protocol}
 * 
 * @example
 * const ogImage = getMetaByProperty('og:image');
 * const twitterTitle = getMetaByProperty('twitter:title');
 */
function getMetaByProperty(property, context = document) {
    const meta = safeQuery(`meta[property="${property}"]`, context);
    return safeAttr(meta, 'content');
}

/**
 * Checks if an element exists and is visible
 * @param {Element|null} element - Element to check
 * @returns {boolean} True if element exists and is visible
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent MDN offsetParent}
 * 
 * @example
 * const priceElement = safeQuery('.a-price');
 * if (isElementVisible(priceElement)) {
 *     const price = safeText(priceElement);
 * }
 */
function isElementVisible(element) {
    if (!element) {
        return false;
    }
    try {
        // Check if element has offsetParent (null means element is not visible)
        return element.offsetParent !== null;
    } catch (error) {
        return false;
    }
}

/**
 * Gets the computed style of an element
 * @param {Element|null} element - Element to get style from
 * @returns {CSSStyleDeclaration|null} Computed style or null
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle MDN getComputedStyle}
 * 
 * @example
 * const element = safeQuery('#productTitle');
 * const style = getComputedStyle(element);
 * const display = style?.display;
 */
function getComputedStyleSafe(element) {
    if (!element || typeof window === 'undefined') {
        return null;
    }
    try {
        return window.getComputedStyle(element);
    } catch (error) {
        return null;
    }
}

// Export all DOM helper functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js / CommonJS export
    module.exports = {
        safeQuery,
        safeQueryAll,
        safeText,
        safeAttr,
        safeInnerHTML,
        safeOuterHTML,
        parseHTML,
        parseJsonLD,
        getMetaByName,
        getMetaByProperty,
        isElementVisible,
        getComputedStyleSafe
    };
}
