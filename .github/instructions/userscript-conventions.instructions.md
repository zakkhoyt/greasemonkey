# Userscript Development Conventions

Coding standards and best practices for developing userscripts (ViolentMonkey, GreaseMonkey, TamperMonkey, etc.).

## File Structure

### Required Files

- **`script_name.user.js`**: Main userscript file (the `.user.js` extension is required for userscript managers to recognize it)
- **`script_name.user.md`**: TODO list and development notes file (used to feed context into AI agents)
- **`.gitignored/`**: Directory for log files and other generated content not tracked in git

### Directory Layout

```
script_name/
├── script_name.user.js
├── script_name.user.md
├── .gitignored/
│   └── script_name.log
└── reference/          # Optional: reference implementations or examples
```

## Metadata Block

### Required Fields

All userscripts must include these metadata fields at the top of the file:

```javascript
// ==UserScript==
// @name         Script Name
// @namespace    http://your.namespace.here/
// @version      0.0.1
// @description  Brief description of what the script does
// @author       Your Name
// @match        https://example.com/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==
```

### Field Guidelines

- **`@name`**: Clear, descriptive name
- **`@namespace`**: Unique identifier (URL format)
- **`@version`**: Use semantic versioning (MAJOR.MINOR.PATCH), start at `0.0.1`
- **`@description`**: Concise explanation of functionality
- **`@author`**: Your name or handle
- **`@match`**: URL patterns where script runs (can have multiple)
- **`@grant`**: List all GM_* APIs used (see [ViolentMonkey API docs](https://violentmonkey.github.io/api/gm/))
- **`@run-at`**: Timing option varies by script needs (`document-start`, `document-end`, `document-idle`)

### Grant Permissions

Only request permissions your script needs. Common GM APIs:

- `GM_setClipboard`: Write to system clipboard
- `GM_addStyle`: Inject CSS
- `GM_xmlhttpRequest`: Cross-origin requests
- `GM_getValue` / `GM_setValue`: Persistent storage
- `GM_notification`: Show notifications

Refer to [official API documentation](https://violentmonkey.github.io/api/gm/) for complete list.

## Code Style

### Strict Mode

**Always enable strict mode** at the top of the IIFE:

```javascript
(function() {
    "use strict";
    
    // Your code here
})();
```

Strict mode catches common errors like undeclared variables and prevents silent failures.

### Naming Conventions

- **Functions**: `camelCase` (e.g., `extractUrlFromAnchor`, `handleKeydown`)
- **Variables**: `camelCase` (e.g., `targetUrl`, `mouseX`)
- **Constants**: `UPPER_CASE` (e.g., `LOG_BASE`, `MAX_RETRIES`)
- **Booleans**: Prefix with `is`, `has`, `should` (e.g., `isDebug`, `hasAnchor`, `shouldLog`)

### Code Organization

Structure your code in logical sections:

```javascript
(function() {
    "use strict";
    
    // ============================================================================
    // CONFIGURATION & CONSTANTS
    // ============================================================================
    
    const LOG_BASE = 'script_name';
    let isDebug = true;
    
    // ============================================================================
    // LOGGING & DEBUGGING
    // ============================================================================
    
    function log(message) { /* ... */ }
    function logError(message) { /* ... */ }
    function logFunctionBegin(name) { /* ... */ }
    function logFunctionEnd(name) { /* ... */ }
    
    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================
    
    function validateInput(value) { /* ... */ }
    
    // ============================================================================
    // CORE FUNCTIONALITY
    // ============================================================================
    
    function mainFeature() { /* ... */ }
    
    // ============================================================================
    // EVENT LISTENERS
    // ============================================================================
    
    document.addEventListener('click', handleClick, true);
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    log('Script initialized');
})();
```

## Logging System

### Debug Flag

Use a debug flag to control logging verbosity:

```javascript
let isDebug = true;  // Set to false to disable logging

function log(message) {
    if (!isDebug) return;
    const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
    console.log(`${timestamp} ${LOG_BASE}: ${message}`);
}
```

### Logging Functions

Implement these standard logging functions:

```javascript
/**
 * Logs general information messages
 */
function log(message) {
    if (!isDebug) return;
    console.log(`${LOG_BASE}: ${message}`);
}

/**
 * Logs error messages with distinctive formatting
 */
function logError(message) {
    if (!isDebug) return;
    console.error(`${LOG_BASE}: ERROR - ${message}`);
}

/**
 * Logs function entry for execution flow tracing
 */
function logFunctionBegin(functionName) {
    if (!isDebug) return;
    console.log(`${LOG_BASE}: begin ${functionName}`);
}

/**
 * Logs function exit for execution flow tracing
 */
function logFunctionEnd(functionName) {
    if (!isDebug) return;
    console.log(`${LOG_BASE}: end ${functionName}`);
}
```

### Logging Best Practices

1. **Log function boundaries**: Use `logFunctionBegin` and `logFunctionEnd` to trace execution flow
2. **Log key decisions**: Record conditional branches and state changes
3. **Log external interactions**: Document DOM queries, API calls, clipboard operations
4. **Use descriptive messages**: Include context and variable values
5. **Avoid log spam**: Don't log inside tight loops or high-frequency event handlers

Example:

```javascript
function processData(input) {
    logFunctionBegin('processData');
    log(`Processing input: ${input}`);
    
    if (!input) {
        log('Input is empty, returning early');
        logFunctionEnd('processData');
        return null;
    }
    
    const result = transform(input);
    log(`Transformed result: ${result}`);
    
    logFunctionEnd('processData');
    return result;
}
```

## Comments and Documentation

### JSDoc-Style Comments

Use detailed comments for functions:

```javascript
/**
 * Extracts URL from an anchor element using multiple fallback strategies
 * @param {HTMLAnchorElement} anchor - The anchor element to extract URL from
 * @param {Event} event - The triggering event (for logging context)
 * @returns {string|null} The extracted URL or null if extraction failed
 * 
 * Strategy priority:
 * 1. anchor.href property (most reliable)
 * 2. href attribute via getAttribute()
 * 3. data-href attribute (custom implementations)
 * 
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
 */
function extractUrlFromAnchor(anchor, event) {
    // Implementation
}
```

### Inline Comments

Explain complex logic, browser quirks, and non-obvious decisions:

```javascript
// KeyboardEvent doesn't include mouse coordinates, so we track them separately
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
}, { passive: true });  // Passive listener for performance
```

## Error Handling

### Try-Catch Blocks

Wrap operations that can fail:

```javascript
try {
    GM_setClipboard(markdown, 'text/plain');
    log('Successfully copied to clipboard');
    showNotification('Copied!');
} catch (error) {
    logError(`Failed to copy to clipboard: ${error.message}`);
    showNotification('Copy failed - check console');
}
```

### Validation Functions

Create dedicated validation functions with clear contracts:

```javascript
/**
 * Validates URL format and reachability
 * @param {string} url - URL to validate
 * @param {HTMLElement} source - Element that provided the URL (for logging)
 * @param {Event} event - Triggering event (for logging)
 * @param {string} context - Description of where validation is called from
 * @returns {boolean} True if URL is valid and usable
 */
function validateUrl(url, source, event, context) {
    logFunctionBegin('validateUrl');
    log(`Validating URL from ${context}`);
    
    if (!url || typeof url !== 'string') {
        logError(`Invalid URL type: ${typeof url}`);
        logFunctionEnd('validateUrl');
        return false;
    }
    
    if (url.length === 0) {
        logError('URL is empty string');
        logFunctionEnd('validateUrl');
        return false;
    }
    
    try {
        new URL(url);  // Throws if invalid
        log('URL validation passed');
        logFunctionEnd('validateUrl');
        return true;
    } catch (e) {
        logError(`URL parsing failed: ${e.message}`);
        logFunctionEnd('validateUrl');
        return false;
    }
}
```

### Graceful Fallbacks

Provide fallback behavior when operations fail:

```javascript
function getTitle(anchor) {
    // Try multiple strategies with fallbacks
    const title = getSelectedText() || 
                  getLinkText(anchor) || 
                  getPageTitle() || 
                  'Untitled';
    return title;
}
```

## Event Handling

### Event Listener Best Practices

1. **Choose appropriate phase**: Use capture (`true`) for early interception, bubble (default) for delegation
2. **Use passive listeners**: Add `{ passive: true }` for scroll/touch events to improve performance
3. **Clean up listeners**: Remove listeners when no longer needed
4. **Avoid inline handlers**: Use `addEventListener` instead of `onclick` attributes

```javascript
// Capture phase for early interception
document.addEventListener('click', handleClick, true);

// Passive listener for performance
document.addEventListener('mousemove', trackMouse, { passive: true });
```

### Key Event Handling

Be aware of key repeat behavior:

```javascript
document.addEventListener('keydown', (event) => {
    // event.repeat is true for auto-repeated keydown events
    if (event.repeat) {
        return;  // Ignore repeats if not needed
    }
    
    // Handle initial keydown
});
```

For tracking key state, use simple boolean flags:

```javascript
let isZKeyDown = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'z' || event.key === 'Z') {
        isZKeyDown = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'z' || event.key === 'Z') {
        isZKeyDown = false;
    }
});
```

## Testing and Debugging

### Development Workflow

1. **Use local development server**: Scripts like `violentmonkey.zsh` can serve userscripts locally with live reload
2. **Monitor log files**: Keep logs in `.gitignored/` directory for easy monitoring
3. **Test in target environment**: Always test on actual target websites
4. **Check browser console**: Monitor for errors and warnings

### Log File Setup

Configure logging to write to a file for persistence:

```javascript
const LOG_FILE_PATH = '.gitignored/script_name.log';

function log(message) {
    if (!isDebug) return;
    
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} ${LOG_BASE}: ${message}\n`;
    
    // Console output
    console.log(logLine);
    
    // File output (if running with Node.js tooling)
    // Implementation depends on your development setup
}
```

### Common Debugging Strategies

1. **Function tracing**: Use `logFunctionBegin`/`logFunctionEnd` to trace execution flow
2. **State logging**: Log variable values at key decision points
3. **Event inspection**: Log event properties to understand behavior
4. **Breakpoint debugging**: Use browser DevTools debugger with userscripts
5. **Incremental testing**: Test features in isolation before combining

## Comparison Operators

### Always Use Strict Equality

Use `===` (strict equality) instead of `==` (loose equality):

```javascript
// ✅ Good: Strict equality checks value AND type
if (count === 1) { /* ... */ }
if (url === null) { /* ... */ }
if (element === undefined) { /* ... */ }

// ❌ Bad: Loose equality performs type coercion
if (count == "1") { /* ... */ }  // true, but misleading
if (url == null) { /* ... */ }   // true for both null and undefined
```

**Why strict equality:**
- Prevents type coercion bugs
- Makes code intent explicit
- Matches TypeScript behavior
- Avoids surprising edge cases

```javascript
// Surprising behavior with == (loose equality)
5 == "5"           // true (coerces string to number)
true == 1          // true (coerces boolean to number)
null == undefined  // true (special case)
0 == false         // true (coerces both to number)

// Predictable behavior with === (strict equality)
5 === "5"          // false (different types)
true === 1         // false (different types)
null === undefined // false (different types)
0 === false        // false (different types)
```

## Performance Considerations

### Minimize DOM Queries

Cache DOM queries when elements are used multiple times:

```javascript
// ❌ Bad: Queries DOM multiple times
document.getElementById('button').addEventListener('click', () => {
    document.getElementById('button').textContent = 'Clicked';
    document.getElementById('button').disabled = true;
});

// ✅ Good: Query once, reuse reference
const button = document.getElementById('button');
button.addEventListener('click', () => {
    button.textContent = 'Clicked';
    button.disabled = true;
});
```

### Debounce High-Frequency Events

For events that fire rapidly (scroll, mousemove, resize), consider debouncing:

```javascript
let timeoutId;
document.addEventListener('scroll', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        // Handle scroll after user stops scrolling
    }, 150);
});
```

### Use Event Delegation

For dynamically added elements, use event delegation:

```javascript
// ✅ Good: Single listener on parent
document.addEventListener('click', (event) => {
    if (event.target.matches('.dynamic-button')) {
        handleButtonClick(event);
    }
});

// ❌ Bad: Adding listeners to each new element
function addButton() {
    const button = document.createElement('button');
    button.addEventListener('click', handleButtonClick);
    document.body.appendChild(button);
}
```

## Browser Compatibility

### Feature Detection

Always check for browser API support:

```javascript
if (typeof GM_setClipboard !== 'undefined') {
    GM_setClipboard(text, 'text/plain');
} else {
    // Fallback for browsers without GM_setClipboard
    navigator.clipboard.writeText(text);
}
```

### Cross-Browser Testing

Test userscripts in multiple browsers:
- Firefox (ViolentMonkey, GreaseMonkey)
- Chrome/Edge (ViolentMonkey, TamperMonkey)
- Safari (Userscripts extension)

## Security Best Practices

1. **Validate all inputs**: Never trust data from the page
2. **Sanitize HTML**: Use `textContent` instead of `innerHTML` when possible
3. **Minimize permissions**: Only request necessary `@grant` permissions
4. **Avoid eval()**: Never use `eval()` or `Function()` with untrusted data
5. **Use CSP-compatible code**: Avoid inline event handlers and inline scripts

## Version Control

### .gitignore

Always exclude generated files:

```
# Userscript logs
.gitignored/
*.log

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
```

### Commit Messages

Use descriptive commit messages following conventional commits:

```
feat: add Alt+Z+Click buffering for multiple links
fix: prevent keydown event spam in logs
refactor: consolidate markdown formatting logic
docs: update usage instructions
```

## Example Template

Basic userscript template following all conventions:

```javascript
// ==UserScript==
// @name         My Userscript
// @namespace    http://example.com/
// @version      0.0.1
// @description  Does something useful
// @author       Your Name
// @match        https://example.com/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function() {
    "use strict";
    
    // ============================================================================
    // CONFIGURATION & CONSTANTS
    // ============================================================================
    
    const LOG_BASE = 'my_userscript';
    let isDebug = true;
    
    // ============================================================================
    // LOGGING & DEBUGGING
    // ============================================================================
    
    function log(message) {
        if (!isDebug) return;
        console.log(`${LOG_BASE}: ${message}`);
    }
    
    function logError(message) {
        if (!isDebug) return;
        console.error(`${LOG_BASE}: ERROR - ${message}`);
    }
    
    function logFunctionBegin(functionName) {
        if (!isDebug) return;
        console.log(`${LOG_BASE}: begin ${functionName}`);
    }
    
    function logFunctionEnd(functionName) {
        if (!isDebug) return;
        console.log(`${LOG_BASE}: end ${functionName}`);
    }
    
    // ============================================================================
    // CORE FUNCTIONALITY
    // ============================================================================
    
    function mainFeature() {
        logFunctionBegin('mainFeature');
        
        try {
            // Your code here
            log('Feature executed successfully');
        } catch (error) {
            logError(`Feature failed: ${error.message}`);
        }
        
        logFunctionEnd('mainFeature');
    }
    
    // ============================================================================
    // EVENT LISTENERS
    // ============================================================================
    
    document.addEventListener('DOMContentLoaded', () => {
        log('Script initialized');
        mainFeature();
    });
    
})();
```

## Additional Resources

- [ViolentMonkey API Documentation](https://violentmonkey.github.io/api/)
- [GreaseMonkey API Documentation](https://wiki.greasespot.net/Greasemonkey_Manual)
- [MDN Web APIs Reference](https://developer.mozilla.org/en-US/docs/Web/API)
- [JavaScript Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)
