// ==UserScript==
// @name         Markdown Linker
// @namespace    https://github.com/zakkhoyt/greasemonkey/markdown_linker
// @version      1.0.0
// @description  Convert URLs to markdown links with Alt+Click, Alt+Right-Click, or Alt+M
// @author       Zakk Hoyt
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// @noframes
// ==/UserScript==

/*
 * Markdown Linker - ViolentMonkey Userscript
 * 
 * PURPOSE:
 * Creates markdown-formatted links [title](url) from webpage anchors or current page URL.
 * Triggered by Alt+Click, Alt+Right-Click, Alt+M, or M key combinations.
 * 
 * WORKFLOW:
 * 1. User triggers script with modifier+click or keyboard shortcut
 * 2. Script detects if target is an anchor link or the page itself
 * 3. Context menu appears with title options (link text, selected text, page title, etc.)
 * 4. User selects desired title format
 * 5. Markdown link is generated and copied to clipboard
 * 
 * KEY APIS:
 * - ViolentMonkey GM_setClipboard: https://violentmonkey.github.io/api/gm/#gm_setclipboard
 * - DOM Selection API: https://developer.mozilla.org/en-US/docs/Web/API/Selection
 * - Event.closest(): https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
 * - Event capture phase: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture
 * 
 * VIOLENTMONKEY METADATA BLOCK:
 * @match 
 *   - Matches all URLs on all domains (wildcard pattern)
 *   - Required by ViolentMonkey to determine which pages run this script
 *   - Reference: https://violentmonkey.github.io/api/matching/
 * 
 * @grant GM_setClipboard
 *   - Requests permission to use GM_setClipboard API
 *   - Without @grant, script runs in page context without privileged APIs
 *   - Reference: https://violentmonkey.github.io/api/metadata-block/#grant
 * 
 * @grant GM_registerMenuCommand
 *   - Requests permission for menu command API (reserved for future use)
 *   - Allows adding items to ViolentMonkey popup menu
 *   - Reference: https://violentmonkey.github.io/api/gm/#gm_registermenucommand
 * 
 * @run-at document-idle
 *   - Script runs after DOM is fully loaded but before all resources (images, etc.)
 *   - Better than document-end for performance and reliability
 *   - Reference: https://violentmonkey.github.io/api/metadata-block/#run-at
 * 
 * @noframes
 *   - Prevents script from running in iframes/frames
 *   - Reduces overhead and prevents duplicate executions
 *   - Reference: https://violentmonkey.github.io/api/metadata-block/#noframes
 * 
 * BROWSER COMPATIBILITY:
 * Tested on Firefox 144.0.2 with ViolentMonkey 2.31.0 on macOS
 */


 console.log(`markdown_linker: 01`);

(function() {
    'use strict';

    console.log(`markdown_linker: 11`);
    
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    
    // Enable debug mode to show error dialogs with debugger option
    // Type: boolean
    const isDebug = true;
    
    // Script identifier prefix for all console.log statements
    // Type: string
    let logBase = "markdown_linker";
    
    // Reference to currently displayed popup menu DOM element
    // Tracked globally to enable removal when user clicks outside or selects option
    // Type: HTMLDivElement | null
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement
    let currentMenu = null;
    
    // The DOM element that triggered the menu (anchor element if on link, null if on page)
    // Stored for potential future use in context-aware operations
    // Type: HTMLElement | null
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
    let targetElement = null;
    
    // The URL to convert to markdown (either anchor's href or current page URL)
    // Type: string | null
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/URL
    let targetUrl = null;
    
    // Event handlers for menu dismissal (stored so they can be removed)
    // Type: Function | null
    let menuClickHandler = null;
    let menuEscapeHandler = null;

    // ============================================================================
    // LOGGING UTILITIES
    // ============================================================================

    /**
     * Simple logging wrapper with consistent prefix
     * @param {string} message - The message to log
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Console/log
     */
    function log(message) {
        console.log(`${logBase}: ${message}`);
    }

    /**
     * Logs a warning message with consistent prefix
     * @param {string} message - The warning message to log
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Console/warn
     */
    function logWarn(message) {
        console.warn(`${logBase}: ${message}`);
    }

    /**
     * Logs an error message with consistent prefix
     * @param {string} message - The error message to log
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Console/error
     */
    function logError(message) {
        console.error(`${logBase}: ${message}`);
    }

    /**
     * Logs a function's entry point for tracing execution flow
     * @param {string} functionName - Name of the function being entered
     */
    function logFunctionBegin(functionName) {
        console.log(`${logBase}: begin ${functionName}`);
    }

    /**
     * Logs a function's exit point for tracing execution flow
     * @param {string} functionName - Name of the function being exited
     */
    function logFunctionEnd(functionName) {
        console.log(`${logBase}: end ${functionName}`);
    }

    log('begin script');

    // ============================================================================
    // URL VALIDATION
    // ============================================================================

    /**
     * Validates extracted URL and shows debug dialog if validation fails
     * @param {string|null} url - The URL to validate
     * @param {HTMLElement|null} anchor - The anchor element (for debugging context)
     * @param {MouseEvent|KeyboardEvent} event - The triggering event (for debugging context)
     * @param {string} source - Description of where this validation is being called from
     * @returns {boolean} True if URL is valid, false otherwise
     * 
     * If validation fails and isDebug is true, prompts user with debugger option
     * Logs comprehensive debugging information about the failure
     * 
     * Type returned: boolean
     */
    function validateUrl(url, anchor, event, source) {
        logFunctionBegin('validateUrl');
        log(`Validating URL from ${source}`);
        log(`  URL value: ${url || 'null'}`);
        log(`  URL type: ${typeof url}`);
        log(`  URL length: ${url?.length || 0}`);
        
        // Check if URL is null, undefined, empty, or the string "null"
        const isValid = url && url !== 'null' && url.trim() !== '';
        
        if (isValid) {
            log(`URL validation passed: "${url}"`);
            logFunctionEnd('validateUrl');
            return true;
        }
        
        // Validation failed - log comprehensive error details
        logError(`URL validation FAILED at ${source}`);
        logError(`  URL value: ${url}`);
        logError(`  URL type: ${typeof url}`);
        logError(`  event.target: ${event?.target?.tagName || 'null'}`);
        logError(`  event.target.className: ${event?.target?.className || 'null'}`);
        logError(`  event.type: ${event?.type || 'null'}`);
        logError(`  anchor: ${anchor ? 'exists' : 'null'}`);
        logError(`  anchor.tagName: ${anchor?.tagName || 'null'}`);
        logError(`  anchor.href: ${anchor?.href || 'null'}`);
        logError(`  anchor.getAttribute('href'): ${anchor?.getAttribute('href') || 'null'}`);
        logError(`  anchor.textContent: ${anchor?.textContent?.substring(0, 50) || 'null'}`);
        logError(`  window.location.href: ${window.location.href}`);
        
        // Show debug dialog if in debug mode
        if (isDebug) {
            const debugMessage = 
                `URL Validation Failed!\n\n` +
                `Source: ${source}\n` +
                `URL: ${url || 'null'}\n` +
                `Type: ${typeof url}\n\n` +
                `Event Details:\n` +
                `  Type: ${event?.type || 'null'}\n` +
                `  Target: ${event?.target?.tagName || 'null'}\n` +
                `  Class: ${event?.target?.className?.substring(0, 50) || 'null'}\n\n` +
                `Anchor Details:\n` +
                `  Exists: ${anchor ? 'yes' : 'no'}\n` +
                `  Tag: ${anchor?.tagName || 'null'}\n` +
                `  href property: ${anchor?.href || 'null'}\n` +
                `  href attribute: ${anchor?.getAttribute('href') || 'null'}\n` +
                `  Text: ${anchor?.textContent?.substring(0, 50) || 'null'}\n\n` +
                `Open debugger to inspect?`;
            
            const openDebugger = confirm(debugMessage);
            if (openDebugger) {
                // Make debugging easier by exposing variables
                console.log('Debug context:', { url, anchor, event, source });
                debugger; // Breakpoint for debugging
            }
        }
        
        logFunctionEnd('validateUrl');
        return false;
    }

    // ============================================================================
    // URL CLEANING
    // ============================================================================

    /**
     * Cleans URL by removing tracking parameters and shortening site-specific URLs
     * @param {string} url - The URL to clean
     * @returns {string} Cleaned URL
     * 
     * Common tracking parameters removed:
     * - utm_* (Google Analytics)
     * - fbclid (Facebook)
     * - gclid (Google Ads)
     * - ref, ref_* (Various referral tracking)
     * - mc_* (Marketing campaign)
     * - _ga (Google Analytics)
     * 
     * Site-specific cleaning:
     * - Amazon: Extracts clean /dp/{ASIN} URLs
     * 
     * Type returned: string
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/URL
     */
    function cleanUrl(url) {
        logFunctionBegin('cleanUrl');
        log(`Original URL: "${url}"`);
        
        try {
            const urlObj = new URL(url);
            
            // Amazon-specific cleaning
            if (urlObj.hostname.includes('amazon.')) {
                log('Detected Amazon URL, will extract clean product URL');
                
                // Try to extract ASIN from path (format: /dp/{ASIN} or /gp/product/{ASIN})
                const dpMatch = urlObj.pathname.match(/\/dp\/([A-Z0-9]{10})/);
                const gpMatch = urlObj.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/);
                
                if (dpMatch) {
                    const asin = dpMatch[1];
                    const cleanAmazonUrl = `${urlObj.protocol}//${urlObj.hostname}/dp/${asin}`;
                    log(`Extracted clean Amazon URL: "${cleanAmazonUrl}"`);
                    logFunctionEnd('cleanUrl');
                    return cleanAmazonUrl;
                } else if (gpMatch) {
                    const asin = gpMatch[1];
                    const cleanAmazonUrl = `${urlObj.protocol}//${urlObj.hostname}/dp/${asin}`;
                    log(`Extracted clean Amazon URL from /gp/product: "${cleanAmazonUrl}"`);
                    logFunctionEnd('cleanUrl');
                    return cleanAmazonUrl;
                }
                
                log('Could not extract ASIN, will fall through to general cleaning');
            }
            
            // General tracking parameter removal
            log('Removing common tracking parameters');
            const trackingParams = [
                // Google Analytics
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                // Facebook
                'fbclid',
                // Google Ads
                'gclid', 'gclsrc',
                // Amazon tracking
                'ref', 'ref_', 'pf_rd_r', 'pf_rd_p', 'pf_rd_m', 'pf_rd_s', 'pf_rd_t', 'pf_rd_i',
                'pd_rd_r', 'pd_rd_w', 'pd_rd_wg',
                'qid', 'sr', 'keywords', 'crid', 'sprefix', 'th', 'psc',
                'dib', 'dib_tag',
                // Marketing campaign
                'mc_cid', 'mc_eid',
                // General analytics
                '_ga', '_gl',
                // Other common tracking
                'msclkid', 'twclid'
            ];
            
            // Remove tracking parameters
            trackingParams.forEach(param => {
                urlObj.searchParams.delete(param);
            });
            
            // Also remove any param that starts with tracked prefixes
            const paramsToDelete = [];
            for (const [key] of urlObj.searchParams) {
                if (key.startsWith('utm_') || 
                    key.startsWith('ref') || 
                    key.startsWith('pf_') || 
                    key.startsWith('pd_') ||
                    key.startsWith('mc_')) {
                    paramsToDelete.push(key);
                }
            }
            paramsToDelete.forEach(param => urlObj.searchParams.delete(param));
            
            const cleanedUrl = urlObj.toString();
            log(`Cleaned URL: "${cleanedUrl}"`);
            logFunctionEnd('cleanUrl');
            return cleanedUrl;
            
        } catch (error) {
            logError(`Error cleaning URL: ${error.message}`);
            log('Returning original URL');
            logFunctionEnd('cleanUrl');
            return url;
        }
    }

    // ============================================================================
    // URL EXTRACTION
    // ============================================================================

    /**
     * Extracts URL from an anchor element using multiple fallback strategies
     * Handles relative URLs, missing hrefs, and site-specific patterns
     * @param {HTMLElement} anchor - The anchor element (or closest anchor)
     * @param {MouseEvent|KeyboardEvent} event - The triggering event (for additional context)
     * @returns {string|null} Absolute URL or null if extraction fails
     * 
     * Strategies attempted in order:
     * 1. Standard anchor.href (browser auto-resolves relative URLs)
     * 2. Manual resolution with URL API
     * 3. Walk up DOM tree to find parent anchor
     * 4. Amazon-specific: Extract ASIN from data-asin attribute
     * 5. Fallback to current page URL
     * 
     * Type returned: string (absolute URL) | null (extraction failed)
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/href
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/URL
     */
    function extractUrlFromAnchor(anchor, event) {
        logFunctionBegin('extractUrlFromAnchor');
        
        // Strategy 1: Try standard href property (browser auto-resolves)
        if (anchor && anchor.href) {
            log(`Strategy 1: Found href via anchor.href: "${anchor.href}"`);
            logFunctionEnd('extractUrlFromAnchor');
            return anchor.href;
        }
        
        logWarn('Strategy 1 failed: anchor.href is null or empty');
        log(`  anchor exists: ${!!anchor}`);
        log(`  anchor.href: ${anchor?.href || 'null'}`);
        log(`  anchor.tagName: ${anchor?.tagName || 'null'}`);
        
        // Strategy 2: Try manual URL resolution with getAttribute
        if (anchor) {
            const rawHref = anchor.getAttribute('href');
            log(`Strategy 2: Attempting manual URL resolution with raw href: "${rawHref}"`);
            
            if (rawHref) {
                try {
                    const absoluteUrl = new URL(rawHref, window.location.origin);
                    log(`Strategy 2: Successfully resolved to: "${absoluteUrl.href}"`);
                    logFunctionEnd('extractUrlFromAnchor');
                    return absoluteUrl.href;
                } catch (error) {
                    logError(`Strategy 2 failed: URL construction error: ${error.message}`);
                }
            } else {
                logWarn('Strategy 2 failed: getAttribute("href") returned null');
            }
        }
        
        // Strategy 3: Walk up DOM tree to find parent anchor with valid href
        log('Strategy 3: Walking up DOM tree to find valid anchor');
        let currentElement = event.target;
        let depth = 0;
        const maxDepth = 10;
        
        while (currentElement && currentElement !== document.body && depth < maxDepth) {
            log(`  Checking element at depth ${depth}: ${currentElement.tagName}`);
            
            if (currentElement.tagName === 'A' && currentElement.href) {
                log(`Strategy 3: Found anchor with href at depth ${depth}: "${currentElement.href}"`);
                logFunctionEnd('extractUrlFromAnchor');
                return currentElement.href;
            }
            
            currentElement = currentElement.parentElement;
            depth++;
        }
        
        logWarn(`Strategy 3 failed: No valid anchor found in ${depth} parent elements`);
        
        // Strategy 4: Amazon-specific - Extract ASIN from data-asin attribute
        if (window.location.hostname.includes('amazon')) {
            log('Strategy 4: Attempting Amazon ASIN extraction');
            
            const targetElement = event.target;
            const asinContainer = targetElement.closest('[data-asin]');
            
            if (asinContainer) {
                const asin = asinContainer.getAttribute('data-asin');
                log(`  Found ASIN container with ASIN: "${asin}"`);
                
                if (asin) {
                    const amazonUrl = `https://${window.location.hostname}/dp/${asin}`;
                    log(`Strategy 4: Constructed Amazon URL: "${amazonUrl}"`);
                    logFunctionEnd('extractUrlFromAnchor');
                    return amazonUrl;
                }
            }
            
            logWarn('Strategy 4 failed: No data-asin attribute found');
        } else {
            log('Strategy 4 skipped: Not on Amazon domain');
        }
        
        // All strategies failed
        logError('All URL extraction strategies failed');
        logError(`  event.target: ${event.target?.tagName || 'null'}`);
        logError(`  event.target.className: ${event.target?.className || 'null'}`);
        logError(`  anchor: ${anchor?.tagName || 'null'}`);
        logError(`  anchor.href: ${anchor?.href || 'null'}`);
        logError(`  anchor.getAttribute('href'): ${anchor?.getAttribute('href') || 'null'}`);
        
        // Show error dialog if in debug mode
        if (isDebug) {
            const debugMessage = 
                `URL extraction failed!\n\n` +
                `Target element: ${event.target?.tagName || 'null'}\n` +
                `Anchor found: ${anchor ? 'yes' : 'no'}\n` +
                `Anchor href: ${anchor?.href || 'null'}\n` +
                `Raw href attribute: ${anchor?.getAttribute('href') || 'null'}\n\n` +
                `Open debugger to inspect?`;
            
            const openDebugger = confirm(debugMessage);
            if (openDebugger) {
                debugger; // Breakpoint for debugging
            }
        }
        
        logFunctionEnd('extractUrlFromAnchor');
        return null;
    }

    // ============================================================================
    // TITLE EXTRACTION FUNCTIONS
    // ============================================================================

    /**
     * Gets currently selected text from the page (if any)
     * Uses the Selection API to read user's text highlight
     * @returns {string|null} Selected text or null if nothing selected
     * 
     * JavaScript string type: Immutable sequence of UTF-16 code units
     * Selection API: Represents text selection on page
     * Type returned: string (when selection exists) | null (when no selection)
     * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
     */
    function getSelectedText() {
        logFunctionBegin('getSelectedText');
        log('Will get selection from window');
        
        // getSelection() returns a Selection object representing user's text selection
        // Type: Selection object (browser API)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Selection
        const selection = window.getSelection().toString().trim();
        
        // Falsy check: empty string '' is falsy in JavaScript, so || null converts it
        // Type: string | null
        const result = selection || null;
        
        log(`Did get selection: ${result ? `"${result}"` : 'null'}`);
        logFunctionEnd('getSelectedText');
        return result;
    }

    /**
     * Gets the current page's title from document
     * @returns {string|null} Page title or null if empty
     * 
     * document.title: Always returns a string (empty string if no <title> tag)
     * Type returned: string | null
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/title
     */
    function getPageTitle() {
        logFunctionBegin('getPageTitle');
        log('Will get document.title');
        
        // Type: string (native browser API always returns string, never null/undefined)
        const title = document.title.trim() || null;
        
        log(`Did get page title: ${title ? `"${title}"` : 'null'}`);
        logFunctionEnd('getPageTitle');
        return title;
    }

    /**
     * Extracts meta description from page <head>
     * Looks for <meta name="description" content="...">
     * @returns {string|null} Meta description or null if not found
     * 
     * querySelector returns: HTMLMetaElement | null
     * HTMLMetaElement.content: string property containing the content attribute value
     * Type returned: string | null
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMetaElement
     */
    function getMetaDescription() {
        logFunctionBegin('getMetaDescription');
        log('Will query meta[name="description"]');
        
        // querySelector returns first matching element or null if none found
        // Type: HTMLMetaElement | null
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
        const meta = document.querySelector('meta[name="description"]');
        
        // meta.content is string if meta exists, ternary converts to null if meta is null
        // Type: string | null
        const description = meta ? meta.content.trim() : null;
        
        log(`Did get meta description: ${description ? `"${description}"` : 'null'}`);
        logFunctionEnd('getMetaDescription');
        return description;
    }

    /**
     * Extracts visible text from an anchor element
     * Falls back to title attribute if textContent is empty
     * @param {HTMLAnchorElement} anchor - The <a> element to extract text from
     * @returns {string|null} Link text or null if empty
     * 
     * textContent: Returns concatenated text of node and descendants (excluding script/style)
     * title attribute: Provides advisory tooltip text
     * Parameter type: HTMLAnchorElement (<a> tag)
     * Type returned: string | null
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
     * Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title
     */
    function getLinkText(anchor) {
        logFunctionBegin('getLinkText');
        log('Will get anchor textContent');
        
        // Get text and clean up whitespace aggressively
        // Replace all newlines, tabs, and multiple spaces with single space
        let text = anchor.textContent || anchor.title || '';
        
        // Replace all whitespace (including newlines, tabs) with single space
        text = text.replace(/\s+/g, ' ').trim();
        
        // Chain of || operators finds first truthy value (non-empty string) or returns null
        // Type: string (textContent always returns string, even if empty)
        const result = text || null;
        
        log(`Did get link text: ${result ? `"${result}"` : 'null'}`);
        logFunctionEnd('getLinkText');
        return result;
    }

    /**
     * Prompts user to enter custom title via browser dialog
     * @returns {string|null} User-entered title or null if cancelled
     * 
     * prompt() returns: string (user input) | null (user clicked Cancel)
     * Note: prompt() is blocking (synchronous) - execution pauses until user responds
     * Type returned: string | null
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt
     */
    function promptCustomTitle() {
        logFunctionBegin('promptCustomTitle');
        log('Will prompt user for custom title');
        
        // prompt() returns null if user clicks Cancel, string (possibly empty) if OK
        // Type: string | null
        const title = prompt('Enter custom title for markdown link:');
        
        // Ternary operator ensures empty strings are converted to null
        // Type: string | null
        const result = title ? title.trim() : null;
        
        log(`Did get custom title: ${result ? `"${result}"` : 'null (cancelled)'}`);
        logFunctionEnd('promptCustomTitle');
        return result;
    }

    // ============================================================================
    // MARKDOWN GENERATION AND CLIPBOARD
    // ============================================================================

    /**
     * Creates markdown-formatted link: [title](url)
     * Standard markdown link syntax used by GitHub, Reddit, Stack Overflow, etc.
     * @param {string} title - The link text/title
     * @param {string} url - The URL to link to (assumed to be already validated)
     * @returns {string} Markdown-formatted link
     * 
     * Template literal (backticks): Allows ${} interpolation for embedding expressions
     * Markdown link syntax reference: https://www.markdownguide.org/basic-syntax/#links
     * Parameter types: Both strings
     * Return type: string
     * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
     * 
     * Note: URL should be validated with validateUrl() before calling this function
     */
    function createMarkdown(title, url) {
        logFunctionBegin('createMarkdown');
        log(`Will create markdown with title: "${title}", url: "${url}"`);
        
        // Template literal creates string with embedded title and url values
        // Type: string
        const markdown = `[${title}](${url})`;
        
        log(`Did create markdown: "${markdown}"`);
        logFunctionEnd('createMarkdown');
        return markdown;
    }

    /**
     * Copies markdown link to system clipboard using ViolentMonkey API
     * @param {string} markdown - The markdown string to copy
     * @param {string} title - The title (for logging)
     * @param {string} url - The URL (for logging)
     * 
     * VIOLENTMONKEY API: GM_setClipboard
     * - Privileged API requiring @grant GM_setClipboard in metadata block
     * - Writes text to system clipboard (works across all platforms)
     * - Signature: GM_setClipboard(data: string, type?: string)
     * - Type parameter defaults to 'text/plain'
     * - Unlike navigator.clipboard.writeText(), works without user gesture requirement
     * 
     * Why not use Clipboard API? Navigator.clipboard.writeText() requires:
     * 1. Secure context (HTTPS)
     * 2. Recent user interaction (within ~5 seconds)
     * 3. Clipboard permission granted
     * GM_setClipboard bypasses these restrictions via browser extension privileges
     * 
     * Parameter types: All strings
     * Return type: void (undefined)
     * Reference: https://violentmonkey.github.io/api/gm/#gm_setclipboard
     */
    function copyToClipboard(markdown, title, url) {
        logFunctionBegin('copyToClipboard');
        log(`Will copy to clipboard: "${markdown}"`);
        
        try {
            // GM_setClipboard is a privileged ViolentMonkey API
            // Requires @grant GM_setClipboard in metadata block
            // Type: void (returns undefined)
            GM_setClipboard(markdown, 'text/plain');
            log('Did copy to clipboard successfully');
            log(`  Title: ${title}`);
            log(`  URL: ${url}`);
            log(`  Markdown: ${markdown}`);
            
            log('Will show notification');
            showNotification('Markdown link copied to clipboard!');
            log('Did show notification');
        } catch (error) {
            // Type: Error object
            // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
            log(`ERROR: Failed to copy to clipboard: ${error}`);
            console.error(`${logBase}: Failed to copy to clipboard:`, error);
            alert('Failed to copy to clipboard. Check console for details.');
        }
        
        logFunctionEnd('copyToClipboard');
    }

    /**
     * Extracts all links from the page and converts them to markdown format (flat list)
     * @returns {string} All links as markdown, one per line
     * 
     * Type returned: string
     */
    function extractAllLinksFlat() {
        logFunctionBegin('extractAllLinksFlat');
        log('Will extract all anchor elements from page');
        
        const anchors = document.querySelectorAll('a[href]');
        log(`Found ${anchors.length} anchor elements`);
        
        const markdownLinks = [];
        
        anchors.forEach((anchor, index) => {
            const href = anchor.href;
            if (!href || href === '#' || href.startsWith('javascript:')) {
                log(`Skipping anchor ${index}: invalid href`);
                return;
            }
            
            // Clean the URL
            const cleanedUrl = cleanUrl(href);
            
            // Get link text
            const text = getLinkText(anchor) || cleanedUrl;
            
            // Create markdown link
            const markdown = `[${text}](${cleanedUrl})`;
            markdownLinks.push(markdown);
            log(`Added link ${index}: ${markdown}`);
        });
        
        const result = markdownLinks.join('\n');
        log(`Generated ${markdownLinks.length} markdown links`);
        logFunctionEnd('extractAllLinksFlat');
        return result;
    }

    /**
     * Extracts all links from the page and converts them to markdown format (hierarchical)
     * Preserves HTML structure with indentation
     * @returns {string} All links as markdown with indentation
     * 
     * Type returned: string
     */
    function extractAllLinksHierarchical() {
        logFunctionBegin('extractAllLinksHierarchical');
        log('Will extract all anchor elements from page with hierarchy');
        
        const anchors = document.querySelectorAll('a[href]');
        log(`Found ${anchors.length} anchor elements`);
        
        const markdownLinks = [];
        
        anchors.forEach((anchor, index) => {
            const href = anchor.href;
            if (!href || href === '#' || href.startsWith('javascript:')) {
                log(`Skipping anchor ${index}: invalid href`);
                return;
            }
            
            // Calculate depth by counting parent elements
            let depth = 0;
            let element = anchor.parentElement;
            while (element && element !== document.body) {
                depth++;
                element = element.parentElement;
            }
            
            // Create indentation (2 spaces per level)
            const indent = '  '.repeat(Math.min(depth, 10)); // Cap at 10 levels
            
            // Clean the URL
            const cleanedUrl = cleanUrl(href);
            
            // Get link text
            const text = getLinkText(anchor) || cleanedUrl;
            
            // Create markdown link with indentation
            const markdown = `${indent}- [${text}](${cleanedUrl})`;
            markdownLinks.push(markdown);
            log(`Added link ${index} at depth ${depth}: ${markdown}`);
        });
        
        const result = markdownLinks.join('\n');
        log(`Generated ${markdownLinks.length} hierarchical markdown links`);
        logFunctionEnd('extractAllLinksHierarchical');
        return result;
    }

    /**
     * Displays temporary success notification to user
     * Creates a fixed-position overlay that auto-dismisses after 3 seconds
     * @param {string} message - The message to display
     * 
     * Creates ephemeral DOM element that doesn't require cleanup tracking
     * Parameter type: string
     * Return type: void (undefined)
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
     */
    function showNotification(message) {
        logFunctionBegin('showNotification');
        log(`Will create notification with message: "${message}"`);
        
        // Type: HTMLDivElement
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement
        const notification = document.createElement('div');
        
        // textContent is safe from XSS attacks (doesn't interpret HTML)
        // Type: string (textContent property always holds string value)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
        notification.textContent = message;
        
        // Inline styles for notification overlay
        // Using fixed position to stay visible during page scroll
        // High z-index (999999) to appear above most page content
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 999999;
            font-family: sans-serif;
            font-size: 14px;
            animation: mdLinkerFadeIn 0.3s, mdLinkerFadeOut 0.3s 2.7s;
        `;
        
        log('Will append notification to body');
        // appendChild returns the appended node, but we don't use it
        // Type: void
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
        document.body.appendChild(notification);
        log('Did append notification to body');
        
        log('Will schedule notification removal in 3000ms');
        // setTimeout schedules function execution after delay
        // Arrow function captures notification variable from closure
        // Type: number (setTimeout returns a timeout ID, unused here)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
        setTimeout(() => {
            log('Will remove notification');
            // remove() returns undefined
            // Type: void
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
            notification.remove();
            log('Did remove notification');
        }, 3000);
        
        logFunctionEnd('showNotification');
    }

    // Add CSS keyframe animations for notification fade in/out
    // Must be injected into document <head> to apply to dynamically created elements
    // Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes
    log('Will add CSS keyframe animations');
    
    // Type: HTMLStyleElement
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLStyleElement
    const style = document.createElement('style');
    
    // textContent for <style> elements is interpreted as CSS
    // Type: string
    style.textContent = `
        @keyframes mdLinkerFadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mdLinkerFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    
    // appendChild adds style element to <head>, making animations available globally
    // Type: void
    document.head.appendChild(style);
    log('Did add CSS keyframe animations');

    // ============================================================================
    // POPUP MENU UI
    // ============================================================================

    /**
     * Creates and displays context menu with title options
     * Menu appears at cursor position and adapts based on whether target is anchor or page
     * @param {number} x - X coordinate for menu placement (clientX from event)
     * @param {number} y - Y coordinate for menu placement (clientY from event)
     * @param {boolean} isAnchor - True if target is an anchor link, false for page
     * @param {HTMLAnchorElement|null} anchor - The anchor element (if isAnchor is true)
     * 
     * JavaScript boolean: Primitive type with two values: true or false
     * MouseEvent coordinates: clientX/clientY are relative to viewport
     * getBoundingClientRect() used for position adjustment
     * Parameter types:
     * - x: number (pixel coordinate from MouseEvent.clientX)
     * - y: number (pixel coordinate from MouseEvent.clientY)
     * - isAnchor: boolean (JavaScript primitive boolean type)
     * - anchor: HTMLAnchorElement | null (DOM element or null)
     * Return type: void (undefined)
     * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
     */
    function createMenu(x, y, isAnchor, anchor = null) {
        logFunctionBegin('createMenu');
        log(`Will create menu at position (${x}, ${y}), isAnchor: ${isAnchor}`);
        
        // Capture the current targetUrl value at menu creation time
        // This prevents issues if the global targetUrl is cleared before menu item is clicked
        const capturedUrl = targetUrl;
        log(`Captured URL for menu: "${capturedUrl}"`);
        
        // Remove any existing menu
        log('Will remove any existing menu');
        removeMenu();
        log('Did remove any existing menu');

        log('Will create menu element');
        
        // Type: HTMLDivElement
        const menu = document.createElement('div');
        
        // Setting ID allows CSS targeting and ensures only one menu exists
        // Type: string (ID attribute value)
        menu.id = 'markdown-linker-menu';
        
        // Template literal with embedded ${x} and ${y} values for positioning
        // Type: string (cssText property holds entire inline style string)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 3px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.12);
            padding: 2px 0;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 11px;
            min-width: 150px;
            max-width: 250px;
        `;
        log('Did create menu element');

        log('Will build menu options array');
        
        // Array of option objects, each with label text and getValue callback
        // Type: Array<{label: string, getValue: () => string|null, isCancel?: boolean}>
        // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
        const options = [];
        
        if (isAnchor) {
            log('Is anchor, will get link text');
            const linkText = getLinkText(anchor);
            if (linkText) {
                log(`Did get link text, adding to options: "${linkText}"`);
                options.push({ label: `Link Text: "${truncate(linkText, 25)}"`, getValue: () => linkText });
            } else {
                log('No link text available');
            }
        }

        // Common options for both anchor and page
        log('Will get selected text');
        const selectedText = getSelectedText();
        if (selectedText) {
            log(`Did get selected text, adding to options: "${selectedText}"`);
            options.push({ label: `Selected Text: "${truncate(selectedText, 25)}"`, getValue: () => selectedText });
        } else {
            log('No selected text available');
        }

        log('Will get page title');
        const pageTitle = getPageTitle();
        if (pageTitle) {
            log(`Did get page title, adding to options: "${pageTitle}"`);
            options.push({ label: `Page Title: "${truncate(pageTitle, 25)}"`, getValue: () => pageTitle });
        } else {
            log('No page title available');
        }

        if (!isAnchor) {
            log('Not anchor, will get meta description');
            const metaDesc = getMetaDescription();
            if (metaDesc) {
                log(`Did get meta description, adding to options: "${metaDesc}"`);
                options.push({ label: `Meta Description: "${truncate(metaDesc, 25)}"`, getValue: () => metaDesc });
            } else {
                log('No meta description available');
            }
        }

        // Always add custom title option
        log('Adding custom title option');
        options.push({ label: 'Custom Title...', getValue: promptCustomTitle });
        
        // Add separator and "All Links" options at the bottom
        log('Adding extract all links options');
        options.push({ 
            label: 'All Links (Flat)', 
            getValue: extractAllLinksFlat,
            isAllLinks: true,
            isSeparator: true  // Add visual separator above this item
        });
        options.push({ 
            label: 'All Links (Hierarchical)', 
            getValue: extractAllLinksHierarchical,
            isAllLinks: true 
        });
        
        log(`Did build ${options.length} menu options`);

        // Create menu items
        log('Will create menu items');
        options.forEach((option, index) => {
            log(`Creating menu item ${index}: "${option.label}"`);
            const item = document.createElement('div');
            item.textContent = option.label;
            item.style.cssText = `
                padding: 4px 10px;
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                ${option.isSeparator ? 'border-top: 1px solid #ccc; margin-top: 4px; padding-top: 8px;' : ''}
            `;

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f0f0f0';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });

            item.addEventListener('click', () => {
                log(`Menu item clicked: "${option.label}"`);

                // Check if this is an "All Links" option
                if (option.isAllLinks) {
                    log('All Links option selected, will extract all links');
                    const allLinksMarkdown = option.getValue();
                    
                    if (allLinksMarkdown) {
                        log(`Generated all links markdown (${allLinksMarkdown.length} characters)`);
                        log('Will copy to clipboard');
                        try {
                            GM_setClipboard(allLinksMarkdown, 'text/plain');
                            log('Did copy all links to clipboard');
                            showNotification('All page links copied to clipboard!');
                        } catch (error) {
                            logError(`Failed to copy all links: ${error}`);
                            alert('Failed to copy to clipboard. Check console for details.');
                        }
                    } else {
                        logError('Failed to generate all links markdown');
                    }
                } else {
                    // Regular single link option
                    log('Will get title value from option');
                    const title = option.getValue();
                    log(`Did get title value: ${title ? `"${title}"` : 'null'}`);
                    
                    if (title) {
                        log(`Will create markdown with title: "${title}", url: "${capturedUrl}"`);
                        const markdown = createMarkdown(title, capturedUrl);
                        
                        if (markdown) {
                            log(`Did create markdown: "${markdown}"`);
                            log('Will copy to clipboard');
                            copyToClipboard(markdown, title, capturedUrl);
                            log('Did copy to clipboard');
                        } else {
                            logError('Markdown creation failed (returned null)');
                        }
                    }
                }
                
                log('Will remove menu');
                removeMenu();
            });

            menu.appendChild(item);
        });
        log('Did build all menu items');

        log('Will append menu to body');
        document.body.appendChild(menu);
        currentMenu = menu;  // Store reference for later removal
        log('Did append menu to body');

        // Position adjustment to keep menu visible on screen
        // getBoundingClientRect() returns element's size and position relative to viewport
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
        log('Will adjust menu position to stay on screen');
        const rect = menu.getBoundingClientRect();
        log(`Menu bounds: right=${rect.right}, bottom=${rect.bottom}, window: width=${window.innerWidth}, height=${window.innerHeight}`);
        
        // If menu extends past right edge, shift it left
        if (rect.right > window.innerWidth) {
            const newLeft = window.innerWidth - rect.width - 10;
            log(`Menu extends past right edge, adjusting left to ${newLeft}px`);
            menu.style.left = newLeft + 'px';
        }
        // If menu extends past bottom edge, shift it up
        if (rect.bottom > window.innerHeight) {
            const newTop = window.innerHeight - rect.height - 10;
            log(`Menu extends past bottom edge, adjusting top to ${newTop}px`);
            menu.style.top = newTop + 'px';
        }
        log('Did adjust menu position');

        // setTimeout with 0ms delay defers execution to next event loop
        // This prevents the current click event from immediately triggering the outside click handler
        // Use capture phase to intercept click before it reaches target elements
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options
        log('Will schedule outside click listener');
        setTimeout(() => {
            // Create handler functions so we can remove them when either one triggers
            menuClickHandler = (event) => {
                // Check if click is outside the menu
                if (currentMenu && !currentMenu.contains(event.target)) {
                    log('Outside click detected, will prevent propagation and remove menu');
                    event.preventDefault();
                    event.stopPropagation();
                    removeMenu();
                } else {
                    log('Click inside menu, allowing propagation');
                }
            };
            
            menuEscapeHandler = (event) => {
                if (event.key === 'Escape') {
                    log('Escape key detected, will remove menu');
                    event.preventDefault();
                    event.stopPropagation();
                    removeMenu();
                }
            };
            
            document.addEventListener('click', menuClickHandler, { capture: true });
            log('Did add outside click listener with event prevention');
            
            document.addEventListener('keydown', menuEscapeHandler, { capture: true });
            log('Did add Escape key listener');
        }, 0);
        
        logFunctionEnd('createMenu');
    }

    /**
     * Removes currently displayed menu and clears target state
     * Called when user selects an option, clicks outside, or cancels
     */
    /**
     * Removes currently displayed menu and clears target state
     * Called when user selects an option, clicks outside, or cancels
     */
    function removeMenu() {
        logFunctionBegin('removeMenu');
        
        // Remove event listeners first
        if (menuClickHandler) {
            log('Removing click handler');
            document.removeEventListener('click', menuClickHandler, true);
            menuClickHandler = null;
        }
        
        if (menuEscapeHandler) {
            log('Removing escape handler');
            document.removeEventListener('keydown', menuEscapeHandler, true);
            menuEscapeHandler = null;
        }
        
        if (currentMenu) {
            log('Menu exists, will remove it');
            currentMenu.remove();  // Removes element from DOM
            currentMenu = null;
            log('Did remove menu');
        } else {
            log('No menu to remove');
        }
        
        log('Will clear target variables');
        targetElement = null;
        targetUrl = null;
        log('Did clear target variables');
        
        logFunctionEnd('removeMenu');
    }

    /**
     * Truncates text to maximum length, appending '...' if needed
     * Used to keep menu options readable with long titles
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length before truncation
     * @returns {string} Original or truncated text
     * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substring
     */
    function truncate(text, maxLength) {
        logFunctionBegin('truncate');
        log(`Will truncate text (length ${text.length}) to max ${maxLength}`);
        
        let result;
        if (text.length <= maxLength) {
            result = text;
            log('Text does not need truncation');
        } else {
            result = text.substring(0, maxLength) + '...';
            log(`Did truncate text to: "${result}"`);
        }
        
        logFunctionEnd('truncate');
        return result;
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    /**
     * Determines if event should trigger the markdown menu
     * Currently checks for Alt/Option key modifier
     * @param {Event} event - The DOM event (click, contextmenu, keydown)
     * @returns {boolean} True if Alt key is pressed
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/altKey
     */
    function shouldTrigger(event) {
        logFunctionBegin('shouldTrigger');
        log(`Checking if Alt key is pressed: ${event.altKey}`);
        
        const result = event.altKey;
        log(`Should trigger: ${result}`);
        
        logFunctionEnd('shouldTrigger');
        return result;
    }

    /**
     * Handles left-click events with Alt modifier
     * Intercepts clicks on anchors or page to show markdown menu
     * @param {MouseEvent} event - The click event
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
     */
    function handleClick(event) {
        logFunctionBegin('handleClick');
        log('Click event received');
        
        if (!shouldTrigger(event)) {
            log('Should not trigger (Alt key not pressed), returning');
            logFunctionEnd('handleClick');
            return;
        }

        // Prevent default link navigation and stop event bubbling
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        log('Will prevent default and stop propagation');
        event.preventDefault();
        event.stopPropagation();
        log('Did prevent default and stop propagation');

        // closest() traverses up DOM tree to find nearest ancestor matching selector
        // Returns null if no match found
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
        log('Will find closest anchor element');
        const anchor = event.target.closest('a');
        
        if (anchor) {
            log('Found anchor element, will attempt URL extraction');
            targetUrl = extractUrlFromAnchor(anchor, event);
            targetElement = anchor;
            
            // Validate URL immediately after extraction
            if (validateUrl(targetUrl, anchor, event, 'handleClick after extractUrlFromAnchor')) {
                log(`Successfully extracted and validated URL: "${targetUrl}"`);
                // Clean URL to remove tracking parameters
                targetUrl = cleanUrl(targetUrl);
                log(`Cleaned URL: "${targetUrl}"`);
                log('Will create menu for anchor');
                createMenu(event.clientX, event.clientY, true, anchor);
            } else {
                logError('URL validation failed, using current page URL as fallback');
                targetUrl = window.location.href;
                targetElement = null;
                log(`Set targetUrl to current page: "${targetUrl}"`);
                log('Will create menu for page (fallback)');
                createMenu(event.clientX, event.clientY, false);
            }
        } else {
            log('Clicked on page (not an anchor)');
            // window.location.href contains full URL of current page
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Location/href
            targetUrl = window.location.href;
            targetElement = null;
            log(`Set targetUrl to current page: "${targetUrl}"`);
            log('Will create menu for page');
            createMenu(event.clientX, event.clientY, false);
        }
        
        logFunctionEnd('handleClick');
    }

    /**
     * Handles right-click (context menu) events with Alt modifier
     * Similar to handleClick but for right-click interactions
     * @param {MouseEvent} event - The contextmenu event
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
     */
    function handleContextMenu(event) {
        logFunctionBegin('handleContextMenu');
        log('Context menu (right-click) event received');
        
        if (!shouldTrigger(event)) {
            log('Should not trigger (Alt key not pressed), returning');
            logFunctionEnd('handleContextMenu');
            return;
        }

        // Prevent browser's default context menu from appearing
        log('Will prevent default and stop propagation');
        event.preventDefault();
        event.stopPropagation();
        log('Did prevent default and stop propagation');

        log('Will find closest anchor element');
        const anchor = event.target.closest('a');
        
        if (anchor) {
            log('Found anchor element, will attempt URL extraction');
            targetUrl = extractUrlFromAnchor(anchor, event);
            targetElement = anchor;
            
            // Validate URL immediately after extraction
            if (validateUrl(targetUrl, anchor, event, 'handleContextMenu after extractUrlFromAnchor')) {
                log(`Successfully extracted and validated URL: "${targetUrl}"`);
                // Clean URL to remove tracking parameters
                targetUrl = cleanUrl(targetUrl);
                log(`Cleaned URL: "${targetUrl}"`);
                log('Will create menu for anchor');
                createMenu(event.clientX, event.clientY, true, anchor);
            } else {
                logError('URL validation failed, using current page URL as fallback');
                targetUrl = window.location.href;
                targetElement = null;
                log(`Set targetUrl to current page: "${targetUrl}"`);
                log('Will create menu for page (fallback)');
                createMenu(event.clientX, event.clientY, false);
            }
        } else {
            log('Right-clicked on page (not an anchor)');
            targetUrl = window.location.href;
            targetElement = null;
            log(`Set targetUrl to current page: "${targetUrl}"`);
            log('Will create menu for page');
            createMenu(event.clientX, event.clientY, false);
        }
        
        logFunctionEnd('handleContextMenu');
    }

    /**
     * Handles keyboard shortcuts: Alt+M
     * Checks element under mouse cursor to determine context
     * @param {KeyboardEvent} event - The keydown event
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     */
    function handleKeydown(event) {
        logFunctionBegin('handleKeydown');
        log(`Key pressed: "${event.key}"`);
        
        // Check if Alt+M is pressed
        const isM = event.key === 'm' || event.key === 'M';
        const isAltM = isM && event.altKey;

        log(`Is M key: ${isM}, Is Alt+M: ${isAltM}`);

        if (isAltM) {
            log('Alt+M trigger detected');
            
            log('Will prevent default and stop propagation');
            event.preventDefault();
            event.stopPropagation();
            log('Did prevent default and stop propagation');

            // elementFromPoint() returns topmost element at given coordinates
            // Uses tracked mouse position since keyboard events don't have clientX/Y
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint
            log(`Will check element at mouse position (${mouseX}, ${mouseY})`);
            const hoveredElement = document.elementFromPoint(mouseX, mouseY);
            log(`Found element: ${hoveredElement ? hoveredElement.tagName : 'null'}`);
            
            const anchor = hoveredElement ? hoveredElement.closest('a') : null;
            log(`Found anchor: ${anchor ? 'yes' : 'no'}`);

            if (anchor) {
                log('Found anchor element, will attempt URL extraction');
                targetUrl = extractUrlFromAnchor(anchor, event);
                targetElement = anchor;
                
                // Validate URL immediately after extraction
                if (validateUrl(targetUrl, anchor, event, 'handleKeydown after extractUrlFromAnchor')) {
                    log(`Successfully extracted and validated URL: "${targetUrl}"`);
                    // Clean URL to remove tracking parameters
                    targetUrl = cleanUrl(targetUrl);
                    log(`Cleaned URL: "${targetUrl}"`);
                    log('Will create menu for anchor');
                    createMenu(mouseX, mouseY, true, anchor);
                } else {
                    logError('URL validation failed, using current page URL as fallback');
                    targetUrl = window.location.href;
                    targetElement = null;
                    log(`Set targetUrl to current page: "${targetUrl}"`);
                    log('Will create menu for page (fallback)');
                    createMenu(mouseX, mouseY, false);
                }
            } else {
                log('Keyboard triggered on page (not hovering over anchor)');
                targetUrl = window.location.href;
                targetElement = null;
                log(`Set targetUrl to current page: "${targetUrl}"`);
                log('Will create menu for page');
                createMenu(mouseX, mouseY, false);
            }
        } else {
            log('Key combination does not trigger script, ignoring');
        }
        
        logFunctionEnd('handleKeydown');
    }

    // Needed because KeyboardEvent doesn't include mouse coordinates
    // Updated continuously by mousemove event listener
    // Used by handleKeydown to determine which element is under cursor
    // Type: number (pixel coordinate, initially 0)
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event
    let mouseX = 0;
    let mouseY = 0;
    
    log('Will add mousemove listener to track mouse position');
    
    // Passive listener (no preventDefault/stopPropagation) for performance
    // Arrow function updates closure variables on every mouse move
    // Type: void (addEventListener returns undefined)
    document.addEventListener('mousemove', (event) => {
        // clientX/Y are relative to viewport, not document
        // Type: number (MouseEvent.clientX and clientY are numbers)
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    log('Did add mousemove listener');

    // ============================================================================
    // REGISTER EVENT LISTENERS
    // ============================================================================
    // All listeners use capture phase (third parameter = true) to intercept events
    // before they reach target elements, ensuring our handlers run first
    // Reference: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture

    log('Will register event listeners');
    
    // Left click with Alt modifier
    log('Registering click listener');
    document.addEventListener('click', handleClick, true);
    log('Did register click listener');

    // Right click with Alt modifier
    log('Registering contextmenu listener');
    document.addEventListener('contextmenu', handleContextMenu, true);
    log('Did register contextmenu listener');

    // Keyboard shortcuts: Alt+M or M alone
    log('Registering keydown listener');
    document.addEventListener('keydown', handleKeydown, true);
    log('Did register keydown listener');

    log('All event listeners registered');
    log('Triggers: Alt+Click, Alt+Right-Click, or Alt+M');
    log('Script initialization complete');

})();
