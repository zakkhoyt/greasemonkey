/**
 * @file logging_helpers.js
 * @description Logging utilities for Amazon Toolkit following ViolentMonkey conventions
 * @author Zakk Hoyt
 * @namespace AmazonToolkit.Helpers.Logging
 * 
 * Provides consistent logging functions that can be enabled/disabled globally.
 * All logs are prefixed with the toolkit identifier for easy filtering.
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Console MDN Console API}
 */

'use strict';

/**
 * Base prefix for all Amazon Toolkit log messages
 * @constant {string}
 */
const LOG_PREFIX = '[AmazonToolkit]';

/**
 * Global debug flag - set to true to enable logging, false to disable
 * @type {boolean}
 */
let isDebug = false;

/**
 * Sets the debug flag to enable or disable logging
 * @param {boolean} enabled - True to enable logging, false to disable
 * @returns {void}
 * 
 * @example
 * setDebugMode(true);  // Enable logging
 * setDebugMode(false); // Disable logging
 */
function setDebugMode(enabled) {
    isDebug = enabled === true;
}

/**
 * Gets the current debug mode state
 * @returns {boolean} Current debug mode state
 * 
 * @example
 * if (getDebugMode()) {
 *     // Do expensive debugging work
 * }
 */
function getDebugMode() {
    return isDebug;
}

/**
 * Logs a general message to console if debugging is enabled
 * @param {...*} args - Arguments to log (can be any type)
 * @returns {void}
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/log MDN console.log}
 * 
 * @example
 * log('Processing product:', productData);
 * log('ASIN:', asin, 'Title:', title);
 */
function log(...args) {
    if (!isDebug) return;
    console.log(LOG_PREFIX, ...args);
}

/**
 * Logs an informational message to console if debugging is enabled
 * @param {...*} args - Arguments to log (can be any type)
 * @returns {void}
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/info MDN console.info}
 * 
 * @example
 * logInfo('Successfully extracted product data');
 */
function logInfo(...args) {
    if (!isDebug) return;
    console.info(LOG_PREFIX, ...args);
}

/**
 * Logs a warning message to console if debugging is enabled
 * @param {...*} args - Arguments to log (can be any type)
 * @returns {void}
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/warn MDN console.warn}
 * 
 * @example
 * logWarn('Failed to extract price, using fallback');
 */
function logWarn(...args) {
    if (!isDebug) return;
    console.warn(LOG_PREFIX, ...args);
}

/**
 * Logs an error message to console (always logged, regardless of debug mode)
 * @param {...*} args - Arguments to log (can be any type)
 * @returns {void}
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/error MDN console.error}
 * 
 * @example
 * logError('Failed to parse JSON-LD:', error);
 */
function logError(...args) {
    // Always log errors, even when debugging is disabled
    console.error(LOG_PREFIX, ...args);
}

/**
 * Logs function entry if debugging is enabled
 * @param {string} functionName - Name of the function being entered
 * @param {Object} [params={}] - Optional parameters object to log
 * @returns {void}
 * 
 * @example
 * function extractProduct(html, url) {
 *     logFunctionBegin('extractProduct', { htmlLength: html.length, url });
 *     // ... function code
 * }
 */
function logFunctionBegin(functionName, params = {}) {
    if (!isDebug) return;
    const paramStr = Object.keys(params).length > 0 
        ? ` | params: ${JSON.stringify(params, null, 2)}` 
        : '';
    console.log(`${LOG_PREFIX} → BEGIN: ${functionName}${paramStr}`);
}

/**
 * Logs function exit if debugging is enabled
 * @param {string} functionName - Name of the function being exited
 * @param {*} [returnValue] - Optional return value to log
 * @returns {void}
 * 
 * @example
 * function extractProduct(html, url) {
 *     // ... function code
 *     logFunctionEnd('extractProduct', productData);
 *     return productData;
 * }
 */
function logFunctionEnd(functionName, returnValue) {
    if (!isDebug) return;
    const returnStr = returnValue !== undefined 
        ? ` | return: ${typeof returnValue === 'object' ? JSON.stringify(returnValue, null, 2) : returnValue}` 
        : '';
    console.log(`${LOG_PREFIX} ← END: ${functionName}${returnStr}`);
}

/**
 * Logs a table to console if debugging is enabled
 * Useful for displaying structured data in readable format
 * @param {Object|Array} data - Data to display as table
 * @param {Array<string>} [columns] - Optional column names to display
 * @returns {void}
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/table MDN console.table}
 * 
 * @example
 * logTable([
 *     { method: 'JSON-LD', success: true },
 *     { method: 'Meta Tags', success: false },
 *     { method: 'HTML', success: true }
 * ]);
 */
function logTable(data, columns) {
    if (!isDebug) return;
    console.log(LOG_PREFIX);
    console.table(data, columns);
}

/**
 * Logs a group header to console if debugging is enabled
 * Use with logGroupEnd() to create collapsible log groups
 * @param {string} groupName - Name of the log group
 * @returns {void}
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/group MDN console.group}
 * 
 * @example
 * logGroupBegin('Product Extraction');
 * log('Trying JSON-LD...');
 * log('Trying meta tags...');
 * logGroupEnd();
 */
function logGroupBegin(groupName) {
    if (!isDebug) return;
    console.group(`${LOG_PREFIX} ${groupName}`);
}

/**
 * Closes the current log group
 * @returns {void}
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/groupEnd MDN console.groupEnd}
 * 
 * @example
 * logGroupBegin('Product Extraction');
 * log('Processing...');
 * logGroupEnd();
 */
function logGroupEnd() {
    if (!isDebug) return;
    console.groupEnd();
}

/**
 * Starts a timer with the specified label
 * Use with logTimeEnd() to measure execution time
 * @param {string} label - Unique label for the timer
 * @returns {void}
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/time MDN console.time}
 * 
 * @example
 * logTimeBegin('extract-product');
 * extractProductData(html);
 * logTimeEnd('extract-product'); // Logs: "[AmazonToolkit] extract-product: 23.45ms"
 */
function logTimeBegin(label) {
    if (!isDebug) return;
    console.time(`${LOG_PREFIX} ${label}`);
}

/**
 * Stops the timer with the specified label and logs elapsed time
 * @param {string} label - Label of the timer to stop (must match logTimeBegin label)
 * @returns {void}
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/timeEnd MDN console.timeEnd}
 * 
 * @example
 * logTimeBegin('parse-json-ld');
 * const data = parseJsonLd(html);
 * logTimeEnd('parse-json-ld');
 */
function logTimeEnd(label) {
    if (!isDebug) return;
    console.timeEnd(`${LOG_PREFIX} ${label}`);
}

// Export all logging functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js / CommonJS export
    module.exports = {
        LOG_PREFIX,
        setDebugMode,
        getDebugMode,
        log,
        logInfo,
        logWarn,
        logError,
        logFunctionBegin,
        logFunctionEnd,
        logTable,
        logGroupBegin,
        logGroupEnd,
        logTimeBegin,
        logTimeEnd
    };
}
