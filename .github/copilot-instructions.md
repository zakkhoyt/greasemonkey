# Copilot Instructions for Userscripts Repository

## Project Overview

This is a **ViolentMonkey/GreaseMonkey userscript repository** with reusable JavaScript toolkits and development automation using Zsh scripts. The codebase contains browser userscripts that enhance web pages (Amazon, GitHub, etc.) and shared utilities for extracting data, generating markdown, and manipulating DOM elements.

**Key Components:**
- **Userscripts** (`**/*.user.js`): ViolentMonkey scripts that run in the browser
- **Amazon Toolkit** (`amazon_toolkit/`): Modular JavaScript library for Amazon product/store data extraction and markdown generation
- **Common Utilities** (`userscript_common/`): Shared DOM and logging helpers used across all userscripts
- **Zsh Scripts** (`**/*.zsh`): Development/automation tools (violentmonkey.zsh for live reload debugging)
- **Tests** (`tests/`): HTML fixtures and test files for toolkit validation

---

## Critical Path-Specific Conventions

**⚠️ CRITICAL**: This repository enforces **strict file-type conventions** via instruction files in `.github/instructions/`. These conventions are **MANDATORY** and enforced by GitHub Copilot Workspace.

### Instruction Files (Read First!)

Before modifying any file, consult the relevant instruction file:

| File Pattern | Instruction File | Key Rules |
|-------------|------------------|-----------|
| `**/*.user.js` | `userscript-conventions.instructions.md` | Strict mode, IIFE pattern, logging functions, JSDoc, metadata block |
| `**/*.md` | `markdown-conventions.instructions.md` | Icon prefix for apps/tools, backticks for versions, `<kbd>` for hotkeys |
| `**/*.zsh` | `zsh-conventions.instructions.md` | zparseopts 3-stage pattern, Zsh expansion (no external commands), step pattern logging |

**Access these files via:**
```zsh
cat .github/instructions/userscript-conventions.instructions.md
cat .github/instructions/markdown-conventions.instructions.md
cat .github/instructions/zsh-conventions.instructions.md
```

### Quick Compliance Check

**For `*.user.js` files:**
- ✅ `'use strict';` as first line in IIFE
- ✅ Use `log()`, `logFunctionBegin()`, `logFunctionEnd()` functions
- ✅ JSDoc comments for every function
- ✅ ViolentMonkey metadata block with `@grant` permissions
- ✅ Strict equality (`===` not `==`)

**For `*.zsh` files:**
- ✅ Three shellcheck directives after shebang
- ✅ Source `.zsh_scripting_utilities` using `source_dirs` array pattern
- ✅ zparseopts 3-stage pattern (help/debug, trap control, script-specific)
- ✅ Use Zsh expansion (`${var:h}`, `${var:t}`) instead of `dirname`/`basename`
- ✅ Step Pattern: intent → operation → result (`slog_step_se --context will/success/fatal`)

**For `*.md` files:**
- ✅ Icon prefix for app/company names: `![xcode](docs/images/icons/xcode.png) \`Xcode\``
- ✅ Backticks for version numbers: `macOS \`12.7\``
- ✅ `<kbd>` tags for hotkeys: `<kbd>Cmd</kbd> + <kbd>C</kbd>`

---

## Amazon Toolkit Architecture

The `amazon_toolkit/` is a **modular extraction and markdown generation library** designed for both browser (ViolentMonkey) and Node.js environments.

### Module Organization

```
amazon_toolkit/
├── extractors/              # Data extraction from Amazon pages
│   ├── product_extractor.js    # Extract ASIN, title, price, images, variants
│   ├── store_extractor.js      # Extract store names, IDs, logos
│   └── shared_extractor.js     # Shared extraction functions (JSON-LD, meta tags)
├── links/                   # URL parsing and cleaning
│   ├── link_parser.js          # Parse Amazon URLs (product/store/search)
│   ├── link_cleaner.js         # Remove tracking params, preserve variants
│   └── link_image.js           # Extract/build/resize Amazon image URLs
├── markdown/                # Markdown generation
│   ├── markdown_generator.js   # Generate markdown links from data
│   └── markdown_formatter.js   # Format titles, escape special chars
├── helpers/                 # Amazon-specific utilities
│   └── validation_helpers.js   # ASIN/URL/type validation
└── index.js                # Main exports (for Node.js)
```

### Extraction Strategy: Fallback Chains

**All extractors use cascading fallback strategies** (try multiple methods until one succeeds):

1. **JSON-LD** (`<script type="application/ld+json">`) - Most reliable, structured data
2. **Meta tags** (`<meta property="og:*">`, `<meta name="*">`) - Common across pages
3. **HTML elements** (ID/class selectors) - Page-specific DOM queries
4. **Regex** - Last resort for URL/text parsing

**Example from `shared_extractor.js`:**
```javascript
function extractProductASIN(doc, url) {
    // 1. JSON-LD
    const jsonLd = safeQuery('script[type="application/ld+json"]', doc);
    if (jsonLd) { /* parse and return */ }
    
    // 2. Meta tag
    const metaASIN = safeQuery('meta[name="ASIN"]', doc);
    if (metaASIN) return metaASIN.content;
    
    // 3. URL regex
    const match = url.match(/\/dp\/([A-Z0-9]{10})/);
    if (match) return match[1];
    
    return null;  // All methods failed
}
```

**Why this matters:** When debugging extraction issues, check **each fallback stage** in the chain. JSON-LD may fail on certain pages but meta tags work.

### URL Formats and Variant Preservation

The toolkit supports three URL format outputs:

- **short**: `https://www.amazon.com/dp/B08N5WRWNW` (ASIN only)
- **medium**: `https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1` (ASIN + variant params)
- **long**: Original URL with all parameters

**Variant parameters** (`th`, `psc`) must be preserved for correct product page display (color/size selection). **Tracking parameters** (`pd_rd_*`, `ref_*`) should be removed.

```javascript
// link_cleaner.js logic
const variantParams = ['th', 'psc', 'smid'];  // Keep these
const trackingParams = ['pd_rd_', 'ref_', '_encoding'];  // Remove these
```

---

## Userscript Development Workflow

### Local Development with Live Reload

Use `violentmonkey.zsh` for rapid development cycle:

```zsh
# Serve userscript locally with auto-reload on file change
./violentmonkey.zsh \
  --script markdown_linker/markdown_linker.user.js \
  --preferred-ip "127.0.0.1" \
  --debug
```

**How it works:**
1. Script starts HTTP server on port 8080
2. ViolentMonkey configured to track external file: `http://127.0.0.1:8080/path/to/script.user.js`
3. Edit script in VSCode → Save → ViolentMonkey auto-reloads → Refresh browser page
4. Set `isDebug = true` in userscript to see `console.log` output

### Browser Console Log Debugging

**CRITICAL**: AI agents cannot access browser console output. To debug userscripts:

1. Open browser DevTools (F12)
2. Set `isDebug = true` in userscript
3. Reload page to populate console logs
4. Right-click console → "Save all Messages to File"
5. Save to `.gitignored/logs/script_name.log`
6. Share log file path with AI agent

**Why:** Console logs show function entry/exit, variable values, error stack traces. Without logs, debugging is blind.

### Common Userscript Patterns

**Event Listener Setup (Capture Phase):**
```javascript
// Use capture phase (true) to intercept events early
document.addEventListener('click', handleClick, true);
document.addEventListener('keydown', handleKeydown, true);
```

**Modifier Key Detection:**
```javascript
// Track modifier keys separately from mouse events
let isAltKeyDown = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'Alt') isAltKeyDown = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Alt') isAltKeyDown = false;
});

document.addEventListener('click', (event) => {
    if (!isAltKeyDown) return;  // Only handle Alt+Click
    // Process click...
});
```

**Clipboard Copy with GM API:**
```javascript
try {
    GM_setClipboard(markdownLink, 'text/plain');
    log('Successfully copied to clipboard');
} catch (error) {
    logError(`Clipboard copy failed: ${error.message}`);
}
```

---

## Zsh Script Patterns

### Sourcing Utilities (Required Pattern)

**ALL `.zsh` scripts must source `.zsh_scripting_utilities`** using this exact pattern:

```zsh
#!/usr/bin/env -S zsh -euo pipefail
# shellcheck shell=bash
# shellcheck disable=SC2296
# shellcheck disable=SC1091

script_dir="${0:A:h}"

source_dirs=(
  "${HATCH_SOURCE_DIR:-}"
  "$HOME/.hatch/source"
  "$HOME/.zsh_home/utilities"
  "$script_dir/../../assets/hatch_home/source"
)

unset -v scripting_utilities_found
for source_dir in "${source_dirs[@]}"; do
  if [[ -n "$source_dir" && -f "$source_dir/.zsh_scripting_utilities" ]]; then
    source "$source_dir/.zsh_scripting_utilities" "$0" "$@" > /dev/null
    scripting_utilities_found=true
    break
  fi
done

if [[ -z "${scripting_utilities_found:-}" ]]; then
  echo "ERROR: Cannot find .zsh_scripting_utilities in any expected location:\n${(F)source_dirs[@]}" >&2 && exit 1
fi
```

### Step Pattern (Three-Phase Logging)

**ALL operations that can fail must use Step Pattern:**

```zsh
# [step] Intent - log what will happen
slog_step_se --context will "install package: " --code "homebrew/cask/firefox" --default

# Operation - execute with error handling
brew install --cask firefox || {
  exit_code=$?
  slog_step_se --context fatal --exit-code "$exit_code" "install package: " --code "homebrew/cask/firefox" --default
  exit $exit_code
}

# Result - log success
slog_step_se --context success "installed package: " --code "homebrew/cask/firefox" --default
```

**Why:** Provides complete visibility into script execution. When debugging, you can see:
1. What the script **intended** to do
2. What **command failed** (with exit code)
3. What **succeeded** and continued

### Zsh Expansion Examples (Required Over External Commands)

**Path manipulation:**
```zsh
# ✅ Good - Zsh expansion
script_dir="${0:A:h}"
script_name="${0:t}"
file_without_ext="${config_file:t:r}"

# ❌ Bad - external commands
script_dir="$(dirname "$(realpath "$0")")"
script_name="$(basename "$0")"
```

**Array/string conversion:**
```zsh
# ✅ Good - (f) splits on newlines, (F) joins with newlines
lines=(${(f)"${multiline_output}"})
multiline_string="${(F)array[@]}"

# ❌ Bad - loops/external tools
while IFS= read -r line; do lines+=("$line"); done <<< "$output"
```

---

## Testing Strategy

**Current Status:** Tests are HTML fixtures (`tests/fixtures/amazon/`) for manual validation. No automated test runner yet.

**Fixtures Include:**
- `product_00_page_source.html` - Saved via browser "View Page Source"
- `product_00_save_page_as.html` - Saved via browser "Save Page As" (includes CSS/JS)
- Expected output files in `tests/fixtures/amazon/expected/`

**Manual Testing Workflow:**
1. Navigate to Amazon product/store page
2. Save HTML via browser (both methods)
3. Run extractor in Node.js with jsdom:
   ```javascript
   const { JSDOM } = require('jsdom');
   const dom = new JSDOM(htmlString);
   const data = extractProductData(dom.window.document, url);
   ```
4. Compare output to expected JSON

---

## Common Pitfalls (AI Agent Mistakes)

### Reserved Keywords in Zsh

**❌ NEVER use these variable names:**
- `path` (Zsh special variable tied to `PATH` - causes PATH corruption)
- `command` (Zsh built-in - breaks command execution)
- `status`, `commands`, `options`, `functions` (reserved keywords)

**✅ Use instead:**
- `file_path`, `dir_path` (not `path`)
- `command_string`, `command_name` (not `command`)

### Userscript Logging Anti-Patterns

**❌ Bad:**
```javascript
console.log("Processing file");  // No prefix, not controlled by debug flag
```

**✅ Good:**
```javascript
log("Processing file");  // Uses LOG_BASE prefix, respects isDebug flag
```

### Zsh Variable Declaration

**❌ Bad (separate declaration and initialization):**
```zsh
local my_var
my_var="value"  # Can leak to stdout
```

**✅ Good (compound statement):**
```zsh
local my_var="value"  # Atomic, no stdout leak
```

---

## Key Files to Reference

**When working on userscripts:**
- `.github/instructions/userscript-conventions.instructions.md` - Mandatory conventions
- `markdown_linker/markdown_linker.user.js` - Complete example with all patterns
- `userscript_common/logging_helpers.js` - Reusable logging functions

**When working on Amazon toolkit:**
- `amazon_toolkit/README.md` - API reference and usage examples
- `amazon_toolkit/IMPLEMENTATION_STATUS.md` - Feature completeness tracking
- `amazon_toolkit/extractors/shared_extractor.js` - Fallback chain patterns

**When working on Zsh scripts:**
- `.github/instructions/zsh-conventions.instructions.md` - Mandatory conventions
- `violentmonkey.zsh` - Example of 3-stage zparseopts and sourcing pattern
- Look for `source_dirs` array pattern in any existing script as reference

---

## Development Commands

```zsh
# Serve userscript locally with live reload
./violentmonkey.zsh --script path/to/script.user.js --debug

# View instruction files
cat .github/instructions/userscript-conventions.instructions.md
cat .github/instructions/zsh-conventions.instructions.md

# Check shellcheck compliance
shellcheck script.zsh

# Test Amazon toolkit in Node.js (requires jsdom)
node -e "const x = require('./amazon_toolkit/index.js'); console.log(x)"
```

---

## Exit Codes

**Userscripts:** Use `try/catch` for error handling, no formal exit codes (browser context)

**Zsh scripts:** Standard exit codes:
- `0` - Success
- `1` - General error
- `40-49` - Validation/verification failures
- `50-59` - Configuration errors

---

## Questions or Unclear Patterns?

If any convention is unclear or seems inconsistent:
1. Check the relevant instruction file in `.github/instructions/`
2. Search for examples in existing code (`grep -r "pattern" .`)
3. Ask for clarification on specific patterns - these conventions are actively maintained and refined

The instruction files are the source of truth - if code conflicts with instructions, **the instructions take precedence**.
