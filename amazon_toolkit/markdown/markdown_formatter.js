/**
 * @file markdown_formatter.js
 * @description Text formatting utilities for markdown generation
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Markdown.Formatter
 * 
 * Provides text formatting and cleaning functions for markdown content.
 * Escapes special markdown characters and formats text for readability.
 * 
 * @see {@link https://www.markdownguide.org/ Markdown Guide}
 * @see {@link https://daringfireball.net/projects/markdown/ Original Markdown Spec}
 */

'use strict';

/**
 * Escapes special markdown characters in text
 * 
 * @param {string} text - Text to escape
 * @param {Object} [options={}] - Escaping options
 * @param {boolean} [options.escapeBrackets=true] - Escape square brackets []
 * @param {boolean} [options.escapeParens=true] - Escape parentheses ()
 * @param {boolean} [options.escapeAsterisks=true] - Escape asterisks *
 * @param {boolean} [options.escapeUnderscores=true] - Escape underscores _
 * @param {boolean} [options.escapeBackticks=true] - Escape backticks `
 * @returns {string} Escaped text
 * 
 * @example
 * escapeMarkdown('Product [50% Off] - *Amazing*')
 * // Returns: 'Product \\[50% Off\\] - \\*Amazing\\*'
 */
function escapeMarkdown(text, options = {}) {
    if (!text) return '';

    const {
        escapeBrackets = true,
        escapeParens = true,
        escapeAsterisks = true,
        escapeUnderscores = true,
        escapeBackticks = true
    } = options;

    let escaped = text;

    // Escape backslashes first
    escaped = escaped.replace(/\\/g, '\\\\');

    if (escapeBrackets) {
        escaped = escaped.replace(/\[/g, '\\[');
        escaped = escaped.replace(/\]/g, '\\]');
    }

    if (escapeParens) {
        escaped = escaped.replace(/\(/g, '\\(');
        escaped = escaped.replace(/\)/g, '\\)');
    }

    if (escapeAsterisks) {
        escaped = escaped.replace(/\*/g, '\\*');
    }

    if (escapeUnderscores) {
        escaped = escaped.replace(/_/g, '\\_');
    }

    if (escapeBackticks) {
        escaped = escaped.replace(/`/g, '\\`');
    }

    return escaped;
}

/**
 * Formats product title for markdown (cleans and optionally shortens)
 * 
 * @param {string} title - Raw title
 * @param {Object} [options={}] - Formatting options
 * @param {number} [options.maxLength] - Maximum length (undefined = no limit)
 * @param {boolean} [options.escape=true] - Escape markdown characters
 * @param {boolean} [options.removePrefix=true] - Remove "Amazon.com:" prefix
 * @param {boolean} [options.removeSuffix=true] - Remove category suffix
 * @returns {string} Formatted title
 * 
 * @example
 * formatTitle('Amazon.com: Nintendo Switch – OLED Model : Video Games', { maxLength: 40 })
 * // Returns: 'Nintendo Switch – OLED Model'
 */
function formatTitle(title, options = {}) {
    if (!title) return '';

    const {
        maxLength,
        escape = true,
        removePrefix = true,
        removeSuffix = true
    } = options;

    let formatted = title.trim();

    // Remove Amazon prefix
    if (removePrefix) {
        formatted = formatted.replace(/^Amazon\.(com|co\.uk|de|fr|es|it|ca|co\.jp|in|cn|com\.mx|com\.br|com\.au|nl|se|com\.tr|sg|ae|sa)\s*:\s*/i, '');
    }

    // Remove category suffix (after " : ")
    if (removeSuffix) {
        const colonIndex = formatted.indexOf(' : ');
        if (colonIndex > 0) {
            formatted = formatted.substring(0, colonIndex);
        }
    }

    // Trim whitespace
    formatted = formatted.trim();

    // Shorten if needed
    if (maxLength && formatted.length > maxLength) {
        formatted = formatted.substring(0, maxLength - 3);
        const lastSpace = formatted.lastIndexOf(' ');
        if (lastSpace > maxLength / 2) {
            formatted = formatted.substring(0, lastSpace);
        }
        formatted += '...';
    }

    // Escape markdown characters
    if (escape) {
        formatted = escapeMarkdown(formatted, {
            escapeBrackets: true,
            escapeParens: false, // Allow parens in title text
            escapeAsterisks: true,
            escapeUnderscores: true,
            escapeBackticks: true
        });
    }

    return formatted;
}

/**
 * Formats brand name for markdown
 * 
 * @param {string} brand - Raw brand name
 * @param {boolean} [escape=true] - Escape markdown characters
 * @returns {string} Formatted brand
 * 
 * @example
 * formatBrand('Nintendo*')
 * // Returns: 'Nintendo\\*'
 */
function formatBrand(brand, escape = true) {
    if (!brand) return '';

    let formatted = brand.trim();

    // Remove "Brand:" prefix if present
    formatted = formatted.replace(/^Brand:\s*/i, '');

    // Remove "Store" suffix
    formatted = formatted.replace(/\s+Store$/i, '');

    if (escape) {
        formatted = escapeMarkdown(formatted);
    }

    return formatted;
}

/**
 * Formats variant information for markdown (e.g., "(White)")
 * 
 * @param {Object|string} variant - Variant object or string
 * @param {boolean} [escape=true] - Escape markdown characters
 * @returns {string} Formatted variant text
 * 
 * @example
 * formatVariant({ type: 'Color', value: 'White' })
 * // Returns: '(White)'
 * 
 * formatVariant('Large')
 * // Returns: '(Large)'
 */
function formatVariant(variant, escape = true) {
    if (!variant) return '';

    let text;
    if (typeof variant === 'object' && variant.value) {
        text = variant.value;
    } else if (typeof variant === 'string') {
        text = variant;
    } else {
        return '';
    }

    text = text.trim();

    if (escape) {
        text = escapeMarkdown(text, { escapeParens: false });
    }

    return text ? `(${text})` : '';
}

/**
 * Formats price for markdown display
 * 
 * @param {string|number|Object} price - Price value, string, or object
 * @returns {string} Formatted price
 * 
 * @example
 * formatPrice('$349.99')
 * // Returns: '$349.99'
 * 
 * formatPrice({ current: '$349.99', list: '$359.99' })
 * // Returns: '$349.99 (was $359.99)'
 */
function formatPrice(price) {
    if (!price) return '';

    if (typeof price === 'string') {
        return price;
    }

    if (typeof price === 'number') {
        return `$${price.toFixed(2)}`;
    }

    if (typeof price === 'object') {
        if (price.current && price.list && price.current !== price.list) {
            return `${price.current} (was ${price.list})`;
        }
        return price.current || '';
    }

    return '';
}

/**
 * Removes excessive whitespace and normalizes text
 * 
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 * 
 * @example
 * normalizeWhitespace('Text  with   excessive\n\nwhitespace')
 * // Returns: 'Text with excessive whitespace'
 */
function normalizeWhitespace(text) {
    if (!text) return '';

    return text
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n+/g, ' ')   // Replace newlines with space
        .trim();
}

/**
 * Truncates text to specified length, breaking at word boundaries
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} [ellipsis='...'] - Ellipsis string
 * @returns {string} Truncated text
 * 
 * @example
 * truncateText('This is a very long product description', 20)
 * // Returns: 'This is a very...'
 */
function truncateText(text, maxLength, ellipsis = '...') {
    if (!text || text.length <= maxLength) {
        return text || '';
    }

    const truncated = text.substring(0, maxLength - ellipsis.length);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength / 2) {
        return truncated.substring(0, lastSpace) + ellipsis;
    }

    return truncated + ellipsis;
}

/**
 * Removes HTML tags from text
 * 
 * @param {string} html - HTML text
 * @returns {string} Plain text
 * 
 * @example
 * stripHTML('<p>Product <b>description</b></p>')
 * // Returns: 'Product description'
 */
function stripHTML(html) {
    if (!html) return '';

    return html
        .replace(/<[^>]+>/g, '')     // Remove tags
        .replace(/&nbsp;/g, ' ')      // Replace &nbsp; with space
        .replace(/&amp;/g, '&')       // Decode &amp;
        .replace(/&lt;/g, '<')        // Decode &lt;
        .replace(/&gt;/g, '>')        // Decode &gt;
        .replace(/&quot;/g, '"')      // Decode &quot;
        .replace(/&#39;/g, "'")       // Decode &#39;
        .trim();
}

/**
 * Formats a complete product title with brand and variant
 * 
 * @param {Object} components - Title components
 * @param {string} components.brand - Brand name
 * @param {string} components.title - Product title
 * @param {string|Object} [components.variant] - Variant info
 * @returns {string} Formatted complete title
 * 
 * @example
 * formatCompleteTitle({ brand: 'Nintendo', title: 'Switch – OLED Model', variant: 'White' })
 * // Returns: 'Nintendo Switch – OLED Model (White)'
 */
function formatCompleteTitle(components) {
    const { brand, title, variant } = components;

    const parts = [];

    if (brand) {
        parts.push(formatBrand(brand));
    }

    if (title) {
        parts.push(formatTitle(title, { escape: true, removePrefix: true, removeSuffix: true }));
    }

    let result = parts.join(' ');

    if (variant) {
        result += ' ' + formatVariant(variant);
    }

    return result;
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeMarkdown,
        formatTitle,
        formatBrand,
        formatVariant,
        formatPrice,
        normalizeWhitespace,
        truncateText,
        stripHTML,
        formatCompleteTitle
    };
}
