# Amazon Toolkit

Comprehensive JavaScript toolkit for extracting Amazon product/store data and generating markdown links.

## Overview

Amazon Toolkit provides modular, reusable functions for working with Amazon web pages:
- **Extract** product and store data from HTML (JSON-LD, meta tags, HTML elements)
- **Parse** URLs and HTML anchor elements
- **Clean** URLs by removing tracking parameters
- **Generate** markdown links with multiple format options
- **Manipulate** Amazon image URLs (resize, format conversion)

Works in both **browser** (ViolentMonkey userscripts) and **Node.js** environments.

## Features

### ✅ Product Extraction
- ASIN, title, brand, description
- Price (current, list, savings)
- Images (primary, additional, variants)
- Variants (color, size, style)
- Ratings, reviews, availability
- Original URL with query parameters

### ✅ Store Extraction
- Store name, brand name
- Store description and logo
- Seller ID, store ID
- URL data for clean linking

### ✅ URL Manipulation
- Parse Amazon URLs (product, store, search)
- Extract ASINs, store IDs, query parameters
- Clean URLs (remove tracking, preserve variants)
- Build URLs in short/medium/long formats

### ✅ Image Handling
- Extract image IDs from URLs
- Build image URLs with custom sizes
- Resize existing image URLs
- Generate multiple size variants

### ✅ Markdown Generation
- Text links: `[Title](url)`
- Images: `![Alt](image_url)`
- Image links: `[![Alt](image)](url)`
- Combined formats (inline, block, table)

## Directory Structure

```
amazon_toolkit/
├── extractors/              # Data extraction from Amazon pages
│   ├── product_extractor.js
│   ├── store_extractor.js
│   └── shared_extractor.js
├── links/                   # URL and link manipulation
│   ├── link_parser.js
│   ├── link_cleaner.js
│   └── link_image.js
├── markdown/                # Markdown generation and formatting
│   ├── markdown_generator.js
│   └── markdown_formatter.js
├── helpers/                 # Amazon-specific utilities
│   ├── dom_helpers.js
│   ├── logging_helpers.js
│   └── validation_helpers.js
├── index.js                # Main exports
├── README.md               # This file
└── IMPLEMENTATION_STATUS.md # Progress tracking
```

## Installation

### Browser (ViolentMonkey Userscript)

```javascript
// ==UserScript==
// @name         My Amazon Script
// @namespace    https://github.com/username/repo
// @version      1.0.0
// @description  Amazon userscript
// @match        https://www.amazon.com/*
// @grant        none
// @require      file://path/to/amazon_toolkit/helpers/logging_helpers.js
// @require      file://path/to/amazon_toolkit/helpers/dom_helpers.js
// @require      file://path/to/amazon_toolkit/helpers/validation_helpers.js
// @require      file://path/to/amazon_toolkit/extractors/shared_extractor.js
// @require      file://path/to/amazon_toolkit/extractors/product_extractor.js
// @require      file://path/to/amazon_toolkit/links/link_cleaner.js
// @require      file://path/to/amazon_toolkit/markdown/markdown_generator.js
// ==/UserScript==
```

### Node.js

```bash
# Copy amazon_toolkit/ directory to your project
cp -r amazon_toolkit/ /path/to/project/
```

```javascript
const productExtractor = require('./amazon_toolkit/extractors/product_extractor');
const markdownGenerator = require('./amazon_toolkit/markdown/markdown_generator');

// Use the modules
const productData = productExtractor.extractProductData(htmlString, url);
const markdown = markdownGenerator.generateProductLink(productData);
```

## Usage Examples

### Example 1: Extract Product Data (Browser)

```javascript
// On an Amazon product page
const productData = extractProductData(document, window.location.href);

console.log(productData);
/*
{
  asin: 'B08N5WRWNW',
  title: 'Nintendo Switch – OLED Model',
  brand: 'Nintendo',
  price: { current: '$349.99', currency: 'USD' },
  images: { primary: 'https://...', primaryId: '61CGHv6kmWL' },
  variant: { type: 'Color', value: 'White' },
  url: { original: '...', clean: '...', queryParams: {...} }
}
*/
```

### Example 2: Generate Markdown Link

```javascript
const productData = extractProductData(document, window.location.href);
const markdown = generateProductLink(productData, { urlFormat: 'short' });

console.log(markdown);
// [Nintendo Switch – OLED Model (White)](https://www.amazon.com/dp/B08N5WRWNW)
```

### Example 3: Parse URL from Anchor

```javascript
const anchor = document.querySelector('a[href*="amazon.com/dp/"]');
const anchorData = parseAmazonAnchor(anchor);

console.log(anchorData);
/*
{
  text: 'Nintendo Switch – OLED Model',
  href: 'https://www.amazon.com/dp/B08N5WRWNW?...',
  type: 'product',
  asin: 'B08N5WRWNW',
  url: { clean: '...', queryParams: {...} }
}
*/
```

### Example 4: Clean URL

```javascript
const dirtyURL = 'https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1&pd_rd_w=abc&pd_rd_r=xyz';
const cleanURL = cleanAmazonURL(dirtyURL, { preserveVariants: true });

console.log(cleanURL);
// https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1
```

### Example 5: Generate Image URL

```javascript
const imageId = '61CGHv6kmWL';
const imageURL = buildImageURL(imageId, { size: 1000 });

console.log(imageURL);
// https://m.media-amazon.com/images/I/61CGHv6kmWL._SL1000_.jpg
```

### Example 6: Extract Store Data

```javascript
const storeData = extractStoreData(document, window.location.href);
const storeLink = generateStoreLink(storeData);

console.log(storeLink);
// [Nintendo Store](https://www.amazon.com/stores/page/ABC-123)
```

### Example 7: Node.js with jsdom

```javascript
const { JSDOM } = require('jsdom');
const productExtractor = require('./amazon_toolkit/extractors/product_extractor');

const html = '<html>...</html>'; // Amazon HTML
const dom = new JSDOM(html);
const doc = dom.window.document;

const productData = productExtractor.extractProductData(doc, url);
console.log(productData);
```

## API Reference

### Extractors

#### `extractProductData(source, url)`
Extracts complete product data from a page.
- **source**: `Document` or HTML string
- **url**: Original URL (optional but recommended)
- **Returns**: Product data object or `null`

#### `extractStoreData(source, url)`
Extracts complete store data from a page.
- **source**: `Document` or HTML string
- **url**: Original URL (optional but recommended)
- **Returns**: Store data object or `null`

### Link Parser

#### `parseAmazonURL(urlString)`
Parses an Amazon URL into structured data.
- **urlString**: URL to parse
- **Returns**: Parsed URL data or `null`

#### `parseAmazonAnchor(anchorElement)`
Parses an HTML anchor element.
- **anchorElement**: `HTMLAnchorElement` to parse
- **Returns**: Parsed anchor data or `null`

### Link Cleaner

#### `cleanAmazonURL(urlString, options)`
Cleans an Amazon URL by removing tracking.
- **urlString**: URL to clean
- **options**: `{ preserveVariants: true, preserveSeller: false }`
- **Returns**: Cleaned URL or `null`

#### `buildAmazonURL(components, format)`
Builds an Amazon URL from components.
- **components**: `{ asin, hostname, protocol, queryParams }`
- **format**: `'short'`, `'medium'`, or `'long'`
- **Returns**: Built URL or `null`

### Link Image

#### `extractImageID(imageUrl)`
Extracts image ID from Amazon image URL.
- **imageUrl**: Amazon image URL
- **Returns**: Image ID or `null`

#### `buildImageURL(imageId, options)`
Builds an Amazon image URL.
- **imageId**: Amazon image ID
- **options**: `{ size, width, height, quality, format }`
- **Returns**: Image URL or `null`

#### `resizeImageURL(imageUrl, sizeOrOptions)`
Resizes an existing image URL.
- **imageUrl**: Existing Amazon image URL
- **sizeOrOptions**: Size number or options object
- **Returns**: Resized URL or `null`

### Markdown Generator

#### `generateProductLink(productData, options)`
Generates markdown text link from product data.
- **productData**: Product data structure
- **options**: `{ urlFormat, maxTitleLength, includeBrand, includeVariant }`
- **Returns**: Markdown link string

#### `generateProductImage(productData, options)`
Generates markdown image from product data.
- **productData**: Product data structure
- **options**: `{ imageSize, alt }`
- **Returns**: Markdown image string

#### `generateProductImageLink(productData, options)`
Generates clickable markdown image from product data.
- **productData**: Product data structure
- **options**: `{ urlFormat, imageSize, alt }`
- **Returns**: Markdown image link string

#### `generateStoreLink(storeData, options)`
Generates markdown link from store data.
- **storeData**: Store data structure
- **options**: Generation options
- **Returns**: Markdown link string

### Markdown Formatter

#### `formatTitle(title, options)`
Formats product title for markdown.
- **title**: Raw title string
- **options**: `{ maxLength, escape, removePrefix, removeSuffix }`
- **Returns**: Formatted title string

#### `escapeMarkdown(text, options)`
Escapes special markdown characters.
- **text**: Text to escape
- **options**: `{ escapeBrackets, escapeParens, ... }`
- **Returns**: Escaped text string

## Use Cases

### Scenario A: Product Page (opt+click anywhere)
```javascript
// User opt+clicks anywhere on product page
const productData = extractProductData(document, window.location.href);
const markdown = generateProductLink(productData);
// Copy markdown to clipboard
```

### Scenario B: Product Anchor (opt+click on anchor)
```javascript
// User opt+clicks on an Amazon product link
const anchor = event.target.closest('a');
const anchorData = parseAmazonAnchor(anchor);
const markdown = generateAnchorLink(anchorData);
// Copy markdown to clipboard
```

### Scenario C: Store Page
```javascript
// On Amazon storefront page
const storeData = extractStoreData(document, window.location.href);
const markdown = generateStoreLink(storeData);
// Copy markdown to clipboard
```

## Configuration

### Enable Debug Logging

```javascript
// Enable debug mode to see detailed logs
setDebugMode(true);

// Extract data (will log each step)
const productData = extractProductData(document, window.location.href);

// Disable debug mode
setDebugMode(false);
```

### Custom Image Sizes

```javascript
// Generate image variants at different sizes
const imageId = '61CGHv6kmWL';
const variants = generateImageVariants(imageId, [100, 300, 500, 1500]);

console.log(variants);
/*
{
  100: 'https://.../_SL100_.jpg',
  300: 'https://.../_SL300_.jpg',
  500: 'https://.../_SL500_.jpg',
  1500: 'https://.../_SL1500_.jpg'
}
*/
```

## Design Principles

1. **Independence**: Each module is usable standalone
2. **Fallback Chains**: Multiple extraction methods (JSON-LD → Meta → HTML → Regex)
3. **Flexibility**: Support short/long/medium URL versions
4. **Universal Code**: Works in browser and Node.js
5. **Conventions**: Follows ViolentMonkey userscript standards

## Browser Compatibility

- ✅ Chrome / Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Requires:
- ES6+ JavaScript
- DOM API (browser) or jsdom (Node.js)
- URL API

## Node.js Compatibility

- ✅ Node.js 14+
- Requires: `jsdom` for HTML parsing

```bash
npm install jsdom
```

## Contributing

This toolkit follows strict coding conventions:
- Strict mode: `'use strict';`
- JSDoc comments for all functions
- Comprehensive error handling
- Logging with debug flags
- Type validation

See `.github/instructions/userscript-conventions.instructions.md` for complete guidelines.

## License

MIT

## Author

Zakk Hoyt

## Version

1.0.0

---

## Quick Reference

### Most Common Functions

```javascript
// Extract product data
const productData = extractProductData(document, window.location.href);

// Generate markdown link
const markdown = generateProductLink(productData, { urlFormat: 'short' });

// Clean URL
const cleanURL = cleanAmazonURL(dirtyURL);

// Build image URL
const imageURL = buildImageURL(imageId, { size: 500 });

// Parse URL
const urlData = parseAmazonURL(urlString);

// Parse anchor
const anchorData = parseAmazonAnchor(anchorElement);
```

### URL Formats

- **short**: `https://www.amazon.com/dp/B08N5WRWNW`
- **medium**: `https://www.amazon.com/dp/B08N5WRWNW?th=1&psc=1`
- **long**: Original URL with all parameters

### Image Sizes

- **75**: Thumbnail
- **160**: Small preview
- **500**: Standard (default)
- **1000**: Large
- **1500**: Extra large (often highest available)

---

For detailed implementation status, see [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
