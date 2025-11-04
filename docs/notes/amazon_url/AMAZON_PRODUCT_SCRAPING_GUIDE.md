# Amazon Product Data Scraping Guide

Complete guide for extracting product data from Amazon HTML and generating markdown links.

---

## Table of Contents
1. [Introduction](#introduction)
2. [Environment Setup](#environment-setup)
3. [JSON-LD Extraction (Primary Method)](#json-ld-extraction-primary-method)
4. [Meta Tags Extraction (Secondary Method)](#meta-tags-extraction-secondary-method)
5. [HTML Element Extraction (Tertiary Method)](#html-element-extraction-tertiary-method)
6. [Text/Regex Extraction (Fallback Method)](#textregex-extraction-fallback-method)
7. [Property Extraction Reference](#property-extraction-reference)
8. [Markdown Generation](#markdown-generation)
9. [Complete Examples](#complete-examples)
10. [Additional Properties](#additional-properties)

---

## Introduction

This guide documents how to extract product information from Amazon product pages and generate clean markdown links. The approach uses a **comprehensive fallback chain** for each property, trying multiple data sources from most reliable to least reliable.

**Key Principles:**
- **Multi-source extraction:** Extract from ALL available data sources
- **Fallback chains:** Try methods in order of reliability (JSON-LD → Meta tags → HTML → Regex)
- **Shortest wins (titles):** When multiple titles are found, choose the shortest after cleaning
- **Universal code:** Works in both browser (userscripts) and Node.js (with jsdom)

**Target Use Case:**
- ViolentMonkey userscripts for browser
- Node.js scripts for development/testing
- Generate markdown links: `[Brand Product Name (Variant)](url)`

---

## Environment Setup

### Browser Context (Userscript)

```javascript
// No setup needed - native DOM APIs available
const doc = document; // Current page DOM
```

### Node.js Context (Development/Testing)

```javascript
// Install jsdom: npm install jsdom
const { JSDOM } = require('jsdom');

// Parse HTML string into DOM
function createDOM(htmlString) {
  const dom = new JSDOM(htmlString);
  return dom.window.document;
}

// Usage
const html = fs.readFileSync('product.html', 'utf8');
const doc = createDOM(html);
```

### Universal Helper Functions

```javascript
/**
 * Safe query selector - returns null if not found
 */
function safeQuery(doc, selector) {
  try {
    return doc.querySelector(selector);
  } catch (e) {
    console.warn(`Query failed for selector: ${selector}`, e);
    return null;
  }
}

/**
 * Safe query selector all - returns empty array if not found
 */
function safeQueryAll(doc, selector) {
  try {
    return Array.from(doc.querySelectorAll(selector));
  } catch (e) {
    console.warn(`QueryAll failed for selector: ${selector}`, e);
    return [];
  }
}

/**
 * Safe text extraction with trimming
 */
function safeText(element) {
  if (!element) return null;
  const text = element.textContent || element.innerText || '';
  return text.trim() || null;
}

/**
 * Safe attribute extraction
 */
function safeAttr(element, attribute) {
  if (!element) return null;
  const value = element.getAttribute(attribute);
  return value ? value.trim() : null;
}
```

---

## JSON-LD Extraction (Primary Method)

**JSON-LD** (JSON for Linking Data) is structured data Amazon embeds for SEO. It's the most reliable source.

### What is JSON-LD?

Amazon includes product data in `<script type="application/ld+json">` tags using Schema.org vocabulary:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Nintendo Switch – OLED Model",
  "image": "https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL1500_.jpg",
  "description": "Meet the newest member of the Nintendo Switch family...",
  "sku": "B098RKWHHZ",
  "brand": {
    "@type": "Brand",
    "name": "Nintendo"
  },
  "offers": {
    "@type": "Offer",
    "price": "349.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://www.amazon.com/dp/B098RKWHHZ"
  }
}
</script>
```

### Extracting JSON-LD Data

```javascript
/**
 * Extract all JSON-LD data from page
 * @param {Document} doc - DOM document
 * @returns {Array} Array of parsed JSON-LD objects
 */
function extractJSONLD(doc) {
  const scripts = safeQueryAll(doc, 'script[type="application/ld+json"]');
  const results = [];
  
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      results.push(data);
    } catch (e) {
      console.warn('Failed to parse JSON-LD:', e);
    }
  }
  
  return results;
}

/**
 * Find Product JSON-LD specifically
 * @param {Document} doc - DOM document
 * @returns {Object|null} Product data or null
 */
function extractProductJSONLD(doc) {
  const allJSONLD = extractJSONLD(doc);
  
  // Find Product type
  for (const data of allJSONLD) {
    if (data['@type'] === 'Product') {
      return data;
    }
    // Sometimes nested in @graph
    if (data['@graph']) {
      const product = data['@graph'].find(item => item['@type'] === 'Product');
      if (product) return product;
    }
  }
  
  return null;
}
```

### JSON-LD Data Structure

**Available Properties:**

| JSON-LD Path | Description | Example |
|--------------|-------------|---------|
| `data.name` | Product name | "Nintendo Switch – OLED Model" |
| `data.brand.name` | Brand name | "Nintendo" |
| `data.image` | Image URL (string or array) | "https://m.media-amazon.com/..." |
| `data.description` | Product description | "Meet the newest member..." |
| `data.sku` | SKU (often same as ASIN) | "B098RKWHHZ" |
| `data.offers.price` | Current price | "349.99" |
| `data.offers.priceCurrency` | Currency code | "USD" |
| `data.offers.availability` | Stock status URL | "https://schema.org/InStock" |
| `data.offers.url` | Product URL (contains ASIN) | "https://www.amazon.com/dp/B098RKWHHZ" |

**Note:** `image` can be a string (single image) or array (multiple images). Always handle both:

```javascript
function getJSONLDImages(productData) {
  if (!productData || !productData.image) return [];
  
  // Handle both string and array
  const images = Array.isArray(productData.image) 
    ? productData.image 
    : [productData.image];
  
  return images.filter(img => typeof img === 'string' && img.length > 0);
}
```

### Extracting Specific Properties from JSON-LD

```javascript
/**
 * Extract title from JSON-LD
 */
function getTitleFromJSONLD(doc) {
  const product = extractProductJSONLD(doc);
  return product?.name || null;
}

/**
 * Extract brand from JSON-LD
 */
function getBrandFromJSONLD(doc) {
  const product = extractProductJSONLD(doc);
  if (!product) return null;
  
  // Brand can be string or object
  if (typeof product.brand === 'string') {
    return product.brand;
  }
  return product.brand?.name || null;
}

/**
 * Extract price from JSON-LD
 */
function getPriceFromJSONLD(doc) {
  const product = extractProductJSONLD(doc);
  if (!product) return null;
  
  // Handle single offer or array of offers
  const offers = Array.isArray(product.offers) 
    ? product.offers[0] 
    : product.offers;
  
  return offers?.price || null;
}

/**
 * Extract image URL from JSON-LD
 */
function getImageFromJSONLD(doc) {
  const product = extractProductJSONLD(doc);
  if (!product) return null;
  
  const images = getJSONLDImages(product);
  return images.length > 0 ? images[0] : null;
}

/**
 * Extract ASIN from JSON-LD product URL
 */
function getASINFromJSONLD(doc) {
  const product = extractProductJSONLD(doc);
  if (!product) return null;
  
  // Get URL from offers or product
  const url = product.offers?.url || product.url || null;
  if (!url) return null;
  
  // Extract ASIN from URL
  return extractASINFromURL(url);
}
```

### Why JSON-LD is Best

**Advantages:**
- ✅ Structured, machine-readable format
- ✅ Maintained by Amazon for SEO (reliable)
- ✅ Easy to parse (JSON.parse)
- ✅ Contains most essential properties
- ✅ Less fragile than HTML selectors

**Limitations:**
- ⚠️ May not include variant details (size/color selection)
- ⚠️ May not include all metadata (shipping, size charts)
- ⚠️ Not present on all Amazon pages (mostly product pages)

**Best Practice:** Always try JSON-LD first, then fall back to other methods.

---

## Meta Tags Extraction (Secondary Method)

Meta tags are HTML `<meta>` elements in the `<head>` section. They're more reliable than body HTML but less structured than JSON-LD.

### Common Meta Tag Protocols

**Open Graph (Facebook):**
```html
<meta property="og:title" content="Nintendo Switch – OLED Model">
<meta property="og:description" content="Product description...">
<meta property="og:image" content="https://m.media-amazon.com/images/I/...">
<meta property="og:url" content="https://www.amazon.com/dp/B098RKWHHZ">
<meta property="og:type" content="product">
<meta property="product:price:amount" content="349.99">
<meta property="product:price:currency" content="USD">
```

**Twitter Cards:**
```html
<meta name="twitter:title" content="Nintendo Switch – OLED Model">
<meta name="twitter:description" content="Product description...">
<meta name="twitter:image" content="https://m.media-amazon.com/images/I/...">
```

**Standard Meta Tags:**
```html
<meta name="title" content="Nintendo Switch – OLED Model">
<meta name="description" content="Product description...">
<meta name="keywords" content="nintendo, switch, gaming">
```

### Extracting Meta Tags

```javascript
/**
 * Get meta tag content by property attribute
 */
function getMetaProperty(doc, property) {
  const meta = safeQuery(doc, `meta[property="${property}"]`);
  return safeAttr(meta, 'content');
}

/**
 * Get meta tag content by name attribute
 */
function getMetaName(doc, name) {
  const meta = safeQuery(doc, `meta[name="${name}"]`);
  return safeAttr(meta, 'content');
}

/**
 * Try multiple meta tag names/properties for same data
 */
function getMetaContent(doc, ...selectors) {
  for (const selector of selectors) {
    const content = selector.includes('property=') 
      ? getMetaProperty(doc, selector.replace('property=', ''))
      : getMetaName(doc, selector.replace('name=', ''));
    
    if (content) return content;
  }
  return null;
}
```

### Extracting Specific Properties from Meta Tags

```javascript
/**
 * Extract title from meta tags
 */
function getTitleFromMeta(doc) {
  return getMetaContent(doc, 
    'property=og:title',
    'name=twitter:title',
    'name=title'
  );
}

/**
 * Extract description from meta tags
 */
function getDescriptionFromMeta(doc) {
  return getMetaContent(doc,
    'property=og:description',
    'name=twitter:description',
    'name=description'
  );
}

/**
 * Extract image from meta tags
 */
function getImageFromMeta(doc) {
  return getMetaContent(doc,
    'property=og:image',
    'name=twitter:image'
  );
}

/**
 * Extract URL (contains ASIN) from meta tags
 */
function getURLFromMeta(doc) {
  return getMetaContent(doc,
    'property=og:url',
    'name=twitter:url'
  );
}

/**
 * Extract price from Open Graph product meta tags
 */
function getPriceFromMeta(doc) {
  const amount = getMetaProperty(doc, 'product:price:amount');
  const currency = getMetaProperty(doc, 'product:price:currency');
  
  if (amount) {
    return currency ? `${amount} ${currency}` : amount;
  }
  return null;
}
```

### Meta Tag Coverage

**What Meta Tags Provide:**

| Property | Open Graph | Twitter Cards | Standard |
|----------|------------|---------------|----------|
| Title | ✅ og:title | ✅ twitter:title | ✅ title |
| Description | ✅ og:description | ✅ twitter:description | ✅ description |
| Image | ✅ og:image | ✅ twitter:image | ❌ |
| URL | ✅ og:url | ✅ twitter:url | ❌ |
| Price | ✅ product:price:* | ❌ | ❌ |
| Brand | ❌ | ❌ | ❌ |

**Best Practice:** Meta tags are great for title, description, and image. Less useful for brand, variant details, or complex data.

---

## HTML Element Extraction (Tertiary Method)

When JSON-LD and meta tags don't provide data, extract directly from HTML elements using CSS selectors or element IDs.

### Common HTML Patterns on Amazon Product Pages

**Product Title:**
```html
<span id="productTitle" class="a-size-large product-title-word-break">
  Nintendo Switch – OLED Model
</span>

<!-- Alternative locations -->
<h1 id="title">...</h1>
<div id="titleSection">
  <h1>...</h1>
</div>
```

**Brand:**
```html
<a id="bylineInfo" href="/stores/Nintendo/...">
  Visit the Nintendo Store
</a>

<!-- Alternative -->
<span class="a-size-base po-break-word">
  Brand: <span class="po-break-word">Nintendo</span>
</span>
```

**Price:**
```html
<!-- Primary price location (big font, right side) -->
<span class="a-price" data-a-color="price">
  <span class="a-offscreen">$349.99</span>
  <span aria-hidden="true">
    <span class="a-price-symbol">$</span>
    <span class="a-price-whole">349<span class="a-price-decimal">.</span></span>
    <span class="a-price-fraction">99</span>
  </span>
</span>

<!-- Alternative locations -->
<span id="priceblock_ourprice">$349.99</span>
<span id="price_inside_buybox">$349.99</span>
```

**Main Image:**
```html
<img id="landingImage" 
     class="a-dynamic-image" 
     src="https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SX679_.jpg"
     data-old-hires="https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL1500_.jpg"
     alt="Nintendo Switch – OLED Model">

<!-- Alternative -->
<div id="imgTagWrapperId">
  <img src="..." data-old-hires="...">
</div>
```

**Image Gallery:**
```html
<div id="altImages">
  <ul>
    <li data-defaultasin="B098RKWHHZ">
      <img src="https://m.media-amazon.com/images/I/41abc._SS40_.jpg"
           data-old-hires="https://m.media-amazon.com/images/I/41abc._AC_SL1500_.jpg">
    </li>
    <!-- More images... -->
  </ul>
</div>
```

### Extraction Functions for HTML Elements

```javascript
/**
 * Extract title from HTML elements
 */
function getTitleFromHTML(doc) {
  // Try multiple selectors in order of preference
  const selectors = [
    '#productTitle',
    '#titleSection h1',
    '#title',
    'h1.product-title-word-break',
    'h1[itemprop="name"]'
  ];
  
  for (const selector of selectors) {
    const element = safeQuery(doc, selector);
    const text = safeText(element);
    if (text) return text;
  }
  
  return null;
}

/**
 * Extract brand from HTML elements
 */
function getBrandFromHTML(doc) {
  // Method 1: bylineInfo link
  const bylineInfo = safeQuery(doc, '#bylineInfo');
  if (bylineInfo) {
    const text = safeText(bylineInfo);
    // Text is like "Visit the Nintendo Store" or "Brand: Nintendo"
    const match = text.match(/(?:Visit the |Brand: )?(.*?)(?: Store)?$/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Method 2: Brand span
  const brandSpan = safeQuery(doc, '.po-break-word');
  if (brandSpan) {
    const text = safeText(brandSpan);
    if (text && text.startsWith('Brand:')) {
      return text.replace('Brand:', '').trim();
    }
  }
  
  // Method 3: Itemprop brand
  const brandItemprop = safeQuery(doc, '[itemprop="brand"]');
  if (brandItemprop) {
    return safeText(brandItemprop);
  }
  
  // Method 4: Link in byline
  const brandLink = safeQuery(doc, '#bylineInfo a, .a-link-normal.contributorNameID');
  if (brandLink) {
    return safeText(brandLink);
  }
  
  return null;
}

/**
 * Extract price from HTML elements
 * Prioritizes the main displayed price (big font on right side)
 */
function getPriceFromHTML(doc) {
  // Method 1: a-offscreen (screen reader text - most reliable)
  const offscreen = safeQuery(doc, '.a-price .a-offscreen');
  if (offscreen) {
    return safeText(offscreen);
  }
  
  // Method 2: Specific price IDs
  const priceIds = [
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '#price_inside_buybox',
    '#price'
  ];
  
  for (const id of priceIds) {
    const element = safeQuery(doc, id);
    const text = safeText(element);
    if (text) return text;
  }
  
  // Method 3: Reconstruct from price parts
  const priceWhole = safeQuery(doc, '.a-price-whole');
  const priceFraction = safeQuery(doc, '.a-price-fraction');
  const priceSymbol = safeQuery(doc, '.a-price-symbol');
  
  if (priceWhole) {
    const whole = safeText(priceWhole);
    const fraction = safeText(priceFraction) || '00';
    const symbol = safeText(priceSymbol) || '$';
    return `${symbol}${whole}.${fraction}`;
  }
  
  // Method 4: Data attribute
  const priceData = safeQuery(doc, '[data-a-color="price"]');
  if (priceData) {
    return safeText(priceData);
  }
  
  return null;
}

/**
 * Extract main product image URL
 * Prioritizes high-resolution version (data-old-hires)
 */
function getImageFromHTML(doc) {
  // Method 1: landingImage with data-old-hires (highest quality)
  const landingImage = safeQuery(doc, '#landingImage');
  if (landingImage) {
    const highRes = safeAttr(landingImage, 'data-old-hires');
    if (highRes) return highRes;
    
    const src = safeAttr(landingImage, 'src');
    if (src) return src;
  }
  
  // Method 2: imgTagWrapper
  const imgWrapper = safeQuery(doc, '#imgTagWrapperId img');
  if (imgWrapper) {
    const highRes = safeAttr(imgWrapper, 'data-old-hires');
    if (highRes) return highRes;
    
    const src = safeAttr(imgWrapper, 'src');
    if (src) return src;
  }
  
  // Method 3: a-dynamic-image class
  const dynamicImage = safeQuery(doc, '.a-dynamic-image');
  if (dynamicImage) {
    const highRes = safeAttr(dynamicImage, 'data-old-hires');
    if (highRes) return highRes;
    
    const src = safeAttr(dynamicImage, 'src');
    if (src) return src;
  }
  
  // Method 4: First image with data-old-hires
  const anyImageWithHires = safeQuery(doc, 'img[data-old-hires]');
  if (anyImageWithHires) {
    return safeAttr(anyImageWithHires, 'data-old-hires');
  }
  
  return null;
}

/**
 * Extract all product images from gallery
 */
function getAllImagesFromHTML(doc) {
  const images = [];
  
  // Get all images from altImages gallery
  const galleryImages = safeQueryAll(doc, '#altImages img[data-old-hires]');
  for (const img of galleryImages) {
    const url = safeAttr(img, 'data-old-hires');
    if (url && !images.includes(url)) {
      images.push(url);
    }
  }
  
  // If no gallery images, try main image
  if (images.length === 0) {
    const mainImage = getImageFromHTML(doc);
    if (mainImage) {
      images.push(mainImage);
    }
  }
  
  return images;
}

/**
 * Extract description from HTML elements
 */
function getDescriptionFromHTML(doc) {
  // Method 1: Feature bullets
  const featureBullets = safeQuery(doc, '#feature-bullets');
  if (featureBullets) {
    const bullets = safeQueryAll(featureBullets, 'li');
    const text = bullets.map(li => safeText(li)).filter(Boolean).join(' ');
    if (text) return text;
  }
  
  // Method 2: Product description div
  const productDesc = safeQuery(doc, '#productDescription');
  if (productDesc) {
    return safeText(productDesc);
  }
  
  // Method 3: Book description
  const bookDesc = safeQuery(doc, '#bookDescription_feature_div');
  if (bookDesc) {
    return safeText(bookDesc);
  }
  
  return null;
}

/**
 * Extract ASIN from HTML data attributes
 */
function getASINFromHTML(doc) {
  // Method 1: data-asin attribute on various elements
  const asinElements = safeQueryAll(doc, '[data-asin]');
  for (const element of asinElements) {
    const asin = safeAttr(element, 'data-asin');
    // Validate ASIN format (10 alphanumeric characters)
    if (asin && /^[A-Z0-9]{10}$/.test(asin)) {
      return asin;
    }
  }
  
  // Method 2: Hidden input field
  const asinInput = safeQuery(doc, 'input[name="ASIN"]');
  if (asinInput) {
    const asin = safeAttr(asinInput, 'value');
    if (asin && /^[A-Z0-9]{10}$/.test(asin)) {
      return asin;
    }
  }
  
  // Method 3: Link href with /dp/
  const dpLink = safeQuery(doc, 'a[href*="/dp/"]');
  if (dpLink) {
    const href = safeAttr(dpLink, 'href');
    if (href) {
      return extractASINFromURL(href);
    }
  }
  
  return null;
}
```

### HTML Extraction: Pros and Cons

**Advantages:**
- ✅ Works when JSON-LD/meta tags are missing
- ✅ Can extract variant-specific data (selected size/color)
- ✅ Access to detailed elements (size charts, reviews, etc.)

**Disadvantages:**
- ⚠️ Fragile - Amazon can change HTML structure
- ⚠️ More complex parsing (need to handle multiple formats)
- ⚠️ May include extra text (need more cleaning)
- ⚠️ Performance - more DOM queries needed

**Best Practice:** Use HTML extraction as a fallback when structured data (JSON-LD/meta tags) is unavailable.

---

## Text/Regex Extraction (Fallback Method)

When all else fails, use regex patterns to extract data from raw HTML text or page title.

### Extracting ASIN from URL (Any Format)

```javascript
/**
 * Extract ASIN from Amazon URL
 * Handles all three URL patterns: /dp/, /gp/product/, /o/ASIN/
 * 
 * @param {string} url - Amazon product URL
 * @returns {string|null} ASIN or null
 */
function extractASINFromURL(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Pattern 1: /dp/{ASIN}
  let match = url.match(/\/dp\/([A-Z0-9]{10})(?:\/|\?|$)/i);
  if (match) return match[1].toUpperCase();
  
  // Pattern 2: /gp/product/{ASIN}
  match = url.match(/\/gp\/product\/([A-Z0-9]{10})(?:\/|\?|$)/i);
  if (match) return match[1].toUpperCase();
  
  // Pattern 3: /o/ASIN/{ASIN}
  match = url.match(/\/o\/ASIN\/([A-Z0-9]{10})(?:\/|\?|$)/i);
  if (match) return match[1].toUpperCase();
  
  // Pattern 4: Loose match - any 10 alphanumeric after dp, product, or ASIN
  match = url.match(/\/(dp|product|ASIN)\/([A-Z0-9]{10})/i);
  if (match) return match[2].toUpperCase();
  
  return null;
}
```

### Extracting ASIN from HTML Source Code

```javascript
/**
 * Extract ASIN from raw HTML source code text
 * Searches for common patterns where ASIN appears
 * 
 * @param {string} sourceCode - Raw HTML as string
 * @returns {string|null} ASIN or null
 */
function extractASINFromSourceCode(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return null;
  
  // Pattern 1: , asin: "B0ABC123XY"
  let match = sourceCode.match(/,\s*asin:\s*["']([A-Z0-9]{10})["']/i);
  if (match) return match[1].toUpperCase();
  
  // Pattern 2: "asin":"B0ABC123XY"
  match = sourceCode.match(/"asin"\s*:\s*"([A-Z0-9]{10})"/i);
  if (match) return match[1].toUpperCase();
  
  // Pattern 3: data-asin="B0ABC123XY"
  match = sourceCode.match(/data-asin=["']([A-Z0-9]{10})["']/i);
  if (match) return match[1].toUpperCase();
  
  // Pattern 4: name="ASIN" value="B0ABC123XY"
  match = sourceCode.match(/name=["']ASIN["']\s+value=["']([A-Z0-9]{10})["']/i);
  if (match) return match[1].toUpperCase();
  
  // Pattern 5: /dp/B0ABC123XY in any context
  match = sourceCode.match(/\/dp\/([A-Z0-9]{10})/i);
  if (match) return match[1].toUpperCase();
  
  return null;
}
```

### Extracting Title from Page Title Tag

```javascript
/**
 * Extract product title from <title> tag
 * Page title format: "Amazon.com: Product Name : Category"
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Cleaned title or null
 */
function getTitleFromPageTitle(doc) {
  const titleElement = safeQuery(doc, 'title');
  if (!titleElement) return null;
  
  let title = safeText(titleElement);
  if (!title) return null;
  
  // Remove "Amazon.com: " prefix
  title = title.replace(/^Amazon\.com:\s*/i, '');
  
  // Remove category suffix after last colon
  // "Product Name : Category" -> "Product Name"
  const lastColon = title.lastIndexOf(':');
  if (lastColon > 0) {
    title = title.substring(0, lastColon).trim();
  }
  
  return title || null;
}
```

### Extracting Brand from Text Patterns

```javascript
/**
 * Extract brand from text using common patterns
 * 
 * @param {string} text - Text to search (title, description, etc.)
 * @returns {string|null} Brand name or null
 */
function extractBrandFromText(text) {
  if (!text || typeof text !== 'string') return null;
  
  // Pattern 1: "by Brand Name" or "from Brand Name"
  let match = text.match(/\b(?:by|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (match) return match[1];
  
  // Pattern 2: "Brand Name -" at start
  match = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+-/);
  if (match) return match[1];
  
  // Pattern 3: "Visit the Brand Name Store"
  match = text.match(/Visit the\s+([^S]+?)\s+Store/i);
  if (match) return match[1].trim();
  
  // Pattern 4: "Brand: Brand Name"
  match = text.match(/Brand:\s*([^\n,]+)/i);
  if (match) return match[1].trim();
  
  return null;
}
```

### Extracting Image ID from Image URL

```javascript
/**
 * Extract Image ID from Amazon image URL
 * Format: https://m.media-amazon.com/images/I/{IMAGE_ID}.{modifiers}.{format}
 * 
 * @param {string} imageUrl - Amazon image URL
 * @returns {string|null} Image ID or null
 */
function extractImageIDFromURL(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  
  // Pattern: /images/I/{IMAGE_ID}
  const match = imageUrl.match(/\/images\/I\/([^.]+)/);
  return match ? match[1] : null;
}
```

### Text/Regex: When to Use

**Use regex/text extraction when:**
- ✅ You have the URL but not the page DOM
- ✅ Working with cached HTML source code strings
- ✅ All structured extraction methods failed
- ✅ Need to validate/extract from user input

**Avoid when:**
- ⚠️ DOM is available (use DOM methods instead)
- ⚠️ Structured data (JSON-LD/meta tags) exists
- ⚠️ Need context around the data

**Best Practice:** Regex is a last resort. Always try structured extraction first.

---

## Property Extraction Reference

This section provides **complete fallback chains** for each property, combining all extraction methods (JSON-LD → Meta → HTML → Regex) into single comprehensive functions.

### Complete ASIN Extraction

```javascript
/**
 * Extract ASIN using all available methods
 * Priority: Current URL → JSON-LD → HTML attributes → Source code
 * 
 * @param {Document} doc - DOM document
 * @param {string} url - Current page URL (optional)
 * @returns {string|null} ASIN or null
 */
function extractASIN(doc, url = null) {
  // Method 1: From current page URL
  if (url) {
    const asinFromUrl = extractASINFromURL(url);
    if (asinFromUrl) return asinFromUrl;
  }
  
  // Method 2: From browser location (if in browser context)
  if (typeof window !== 'undefined' && window.location) {
    const asinFromLocation = extractASINFromURL(window.location.href);
    if (asinFromLocation) return asinFromLocation;
  }
  
  // Method 3: From JSON-LD product URL
  const asinFromJSONLD = getASINFromJSONLD(doc);
  if (asinFromJSONLD) return asinFromJSONLD;
  
  // Method 4: From meta tag URL
  const metaUrl = getURLFromMeta(doc);
  if (metaUrl) {
    const asinFromMeta = extractASINFromURL(metaUrl);
    if (asinFromMeta) return asinFromMeta;
  }
  
  // Method 5: From HTML data attributes
  const asinFromHTML = getASINFromHTML(doc);
  if (asinFromHTML) return asinFromHTML;
  
  // Method 6: From HTML source code (if available as string)
  if (doc.documentElement) {
    const sourceCode = doc.documentElement.outerHTML;
    const asinFromSource = extractASINFromSourceCode(sourceCode);
    if (asinFromSource) return asinFromSource;
  }
  
  console.warn('Could not extract ASIN from any source');
  return null;
}
```

### Complete Title Extraction with "Shortest Wins"

```javascript
/**
 * Extract product title from all sources and return the shortest cleaned version
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Shortest cleaned title or null
 */
function extractTitle(doc) {
  const titles = [];
  
  // Method 1: JSON-LD
  const jsonldTitle = getTitleFromJSONLD(doc);
  if (jsonldTitle) titles.push(jsonldTitle);
  
  // Method 2: Meta tags (Open Graph, Twitter, standard)
  const metaTitle = getTitleFromMeta(doc);
  if (metaTitle) titles.push(metaTitle);
  
  // Method 3: HTML productTitle element
  const htmlTitle = getTitleFromHTML(doc);
  if (htmlTitle) titles.push(htmlTitle);
  
  // Method 4: Page title tag
  const pageTitle = getTitleFromPageTitle(doc);
  if (pageTitle) titles.push(pageTitle);
  
  // Method 5: Image alt text (last resort)
  const mainImage = safeQuery(doc, '#landingImage, .a-dynamic-image');
  if (mainImage) {
    const altText = safeAttr(mainImage, 'alt');
    if (altText) titles.push(altText);
  }
  
  if (titles.length === 0) {
    console.warn('Could not extract title from any source');
    return null;
  }
  
  // Clean all titles
  const cleanedTitles = titles.map(title => cleanTitle(title)).filter(Boolean);
  
  if (cleanedTitles.length === 0) {
    console.warn('All titles were empty after cleaning');
    return null;
  }
  
  // Return shortest cleaned title
  cleanedTitles.sort((a, b) => a.length - b.length);
  return cleanedTitles[0];
}

/**
 * Clean product title by removing Amazon-specific patterns
 * 
 * @param {string} title - Raw title
 * @returns {string|null} Cleaned title or null
 */
function cleanTitle(title) {
  if (!title || typeof title !== 'string') return null;
  
  // Remove "Amazon.com: " prefix
  title = title.replace(/^Amazon\.com:\s*/i, '');
  
  // Remove " at Amazon.*" suffix (greedy)
  title = title.replace(/\s+at\s+Amazon.*$/i, '');
  
  // Remove " :.*" suffix (category suffixes)
  // But only if there's text before the colon
  const colonIndex = title.indexOf(':');
  if (colonIndex > 0) {
    const beforeColon = title.substring(0, colonIndex).trim();
    const afterColon = title.substring(colonIndex + 1).trim();
    
    // If after colon looks like a category (multiple words, capitalized)
    // and before colon has substantial content, remove the suffix
    if (beforeColon.length > 10 && afterColon.match(/^[A-Z]/)) {
      title = beforeColon;
    }
  }
  
  // Trim whitespace and normalize spaces
  title = title.trim().replace(/\s+/g, ' ');
  
  return title || null;
}
```

### Complete Brand Extraction

```javascript
/**
 * Extract product brand from all sources
 * Priority: JSON-LD → HTML bylineInfo → HTML brand elements → Meta tags → Text patterns
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Brand name or null
 */
function extractBrand(doc) {
  // Method 1: JSON-LD
  const jsonldBrand = getBrandFromJSONLD(doc);
  if (jsonldBrand) return jsonldBrand;
  
  // Method 2: HTML bylineInfo and brand elements
  const htmlBrand = getBrandFromHTML(doc);
  if (htmlBrand) return htmlBrand;
  
  // Method 3: Extract from title (pattern matching)
  const title = extractTitle(doc);
  if (title) {
    const brandFromTitle = extractBrandFromText(title);
    if (brandFromTitle) return brandFromTitle;
  }
  
  // Method 4: Extract from description
  const description = extractDescription(doc);
  if (description) {
    const brandFromDesc = extractBrandFromText(description);
    if (brandFromDesc) return brandFromDesc;
  }
  
  console.warn('Could not extract brand from any source');
  return null;
}
```

### Complete Price Extraction

```javascript
/**
 * Extract product price (current/sale price - the big one on right side)
 * Priority: JSON-LD → HTML offscreen → HTML price IDs → Meta tags
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Price string or null
 */
function extractPrice(doc) {
  // Method 1: JSON-LD
  const jsonldPrice = getPriceFromJSONLD(doc);
  if (jsonldPrice) {
    // Format with currency if available
    const product = extractProductJSONLD(doc);
    const currency = product?.offers?.priceCurrency || 'USD';
    return `${jsonldPrice} ${currency}`;
  }
  
  // Method 2: HTML elements (prioritizes a-offscreen)
  const htmlPrice = getPriceFromHTML(doc);
  if (htmlPrice) return htmlPrice;
  
  // Method 3: Meta tags (Open Graph product price)
  const metaPrice = getPriceFromMeta(doc);
  if (metaPrice) return metaPrice;
  
  console.warn('Could not extract price from any source');
  return null;
}
```

### Complete Image Extraction

```javascript
/**
 * Extract main product image URL (high-resolution preferred)
 * Priority: HTML data-old-hires → JSON-LD → Meta tags → HTML src
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Image URL or null
 */
function extractImage(doc) {
  // Method 1: HTML data-old-hires (highest quality)
  const htmlImage = getImageFromHTML(doc);
  if (htmlImage) return htmlImage;
  
  // Method 2: JSON-LD
  const jsonldImage = getImageFromJSONLD(doc);
  if (jsonldImage) return jsonldImage;
  
  // Method 3: Meta tags
  const metaImage = getImageFromMeta(doc);
  if (metaImage) return metaImage;
  
  console.warn('Could not extract image from any source');
  return null;
}

/**
 * Extract image ID from image URL
 * 
 * @param {string|null} imageUrl - Image URL
 * @returns {string|null} Image ID or null
 */
function extractImageID(imageUrl) {
  if (!imageUrl) {
    return null;
  }
  return extractImageIDFromURL(imageUrl);
}
```

### Complete Description Extraction

```javascript
/**
 * Extract product description
 * Priority: JSON-LD → Meta tags → HTML feature bullets → HTML description
 * 
 * @param {Document} doc - DOM document
 * @returns {string|null} Description or null
 */
function extractDescription(doc) {
  // Method 1: JSON-LD
  const product = extractProductJSONLD(doc);
  if (product?.description) return product.description;
  
  // Method 2: Meta tags
  const metaDesc = getDescriptionFromMeta(doc);
  if (metaDesc) return metaDesc;
  
  // Method 3: HTML elements
  const htmlDesc = getDescriptionFromHTML(doc);
  if (htmlDesc) return htmlDesc;
  
  console.warn('Could not extract description from any source');
  return null;
}
```

### Complete Variant Extraction

```javascript
/**
 * Extract product variant information (size, color, etc.)
 * Priority: URL parameters → Child ASIN comparison → DOM selected options
 * 
 * @param {Document} doc - DOM document
 * @param {string} url - Current page URL (optional)
 * @returns {Object|null} Variant info {size, color, style} or null
 */
function extractVariant(doc, url = null) {
  const variant = {};
  
  // Method 1: Check if psc=1 parameter exists (variant was selected)
  if (!url && typeof window !== 'undefined') {
    url = window.location.href;
  }
  
  if (url) {
    const urlObj = new URL(url);
    const hasPSC = urlObj.searchParams.has('psc');
    const hasTH = urlObj.searchParams.has('th');
    
    if (!hasPSC && !hasTH) {
      // No variant parameters - likely parent ASIN (no variant selected)
      return null;
    }
  }
  
  // Method 2: Extract from selected dropdown options
  const selectElements = safeQueryAll(doc, 'select[name*="variant"], select[id*="variation"]');
  
  for (const select of selectElements) {
    const selectedOption = safeQuery(select, 'option[selected], option:checked');
    if (selectedOption) {
      const value = safeText(selectedOption);
      const name = safeAttr(select, 'name') || safeAttr(select, 'id') || '';
      
      // Determine variant type from name/id
      if (name.toLowerCase().includes('size')) {
        variant.size = value;
      } else if (name.toLowerCase().includes('color')) {
        variant.color = value;
      } else if (name.toLowerCase().includes('style')) {
        variant.style = value;
      } else {
        variant[name] = value;
      }
    }
  }
  
  // Method 3: Extract from selected button groups (swatches)
  const selectedButtons = safeQueryAll(doc, '.a-button-selected, [aria-pressed="true"]');
  
  for (const button of selectedButtons) {
    const text = safeText(button);
    const ariaLabel = safeAttr(button, 'aria-label');
    const title = safeAttr(button, 'title');
    
    const value = ariaLabel || title || text;
    if (value) {
      // Try to determine type from context
      const container = button.closest('[class*="variation"], [id*="variation"]');
      if (container) {
        const containerClass = safeAttr(container, 'class') || '';
        const containerId = safeAttr(container, 'id') || '';
        const contextText = (containerClass + containerId).toLowerCase();
        
        if (contextText.includes('size')) {
          variant.size = value;
        } else if (contextText.includes('color')) {
          variant.color = value;
        } else if (contextText.includes('style')) {
          variant.style = value;
        }
      }
    }
  }
  
  // Method 4: Look for variation display labels
  const variationLabels = safeQueryAll(doc, '.selection, [class*="selected-variation"]');
  
  for (const label of variationLabels) {
    const text = safeText(label);
    if (!text) continue;
    
    // Pattern: "Size: Large" or "Color: Blue"
    const match = text.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      const keyLower = key.toLowerCase();
      
      if (keyLower === 'size') {
        variant.size = value;
      } else if (keyLower === 'color' || keyLower === 'colour') {
        variant.color = value;
      } else if (keyLower === 'style') {
        variant.style = value;
      } else {
        variant[key] = value;
      }
    }
  }
  
  // Return null if no variants found, otherwise return object
  return Object.keys(variant).length > 0 ? variant : null;
}

/**
 * Format variant info as string for markdown links
 * Example: "(Large, Blue)" or "(Large)" or ""
 * 
 * @param {Object|null} variant - Variant object
 * @returns {string} Formatted variant string
 */
function formatVariant(variant) {
  if (!variant || Object.keys(variant).length === 0) {
    return '';
  }
  
  const parts = [];
  
  // Order: size, color, style, others
  if (variant.size) parts.push(variant.size);
  if (variant.color) parts.push(variant.color);
  if (variant.style) parts.push(variant.style);
  
  // Add any other properties
  for (const [key, value] of Object.entries(variant)) {
    if (!['size', 'color', 'style'].includes(key)) {
      parts.push(value);
    }
  }
  
  return parts.length > 0 ? `(${parts.join(', ')})` : '';
}
```

### Building Clean Product URLs

```javascript
/**
 * Build clean product URL from ASIN
 * Includes psc=1 if variant was selected
 * 
 * @param {string} asin - Product ASIN
 * @param {boolean} hasVariant - Whether a variant was selected
 * @returns {string} Clean product URL
 */
function buildProductURL(asin, hasVariant = false) {
  const baseUrl = `https://www.amazon.com/dp/${asin}`;
  
  // Add psc=1 if variant was selected
  if (hasVariant) {
    return `${baseUrl}?psc=1`;
  }
  
  return baseUrl;
}
```

### Building Image URLs with Custom Size

```javascript
/**
 * Build image URL with specified size/quality
 * 
 * @param {string} imageId - Amazon image ID
 * @param {number} size - Desired size (SL parameter) - default 500
 * @param {number} quality - JPEG quality (0-100) - default 70
 * @returns {string} Image URL
 */
function buildImageURL(imageId, size = 500, quality = 70) {
  return `https://m.media-amazon.com/images/I/${imageId}._AC_SL${size}_QL${quality}_.jpg`;
}

/**
 * Convert any Amazon image URL to desired size
 * 
 * @param {string} imageUrl - Original image URL
 * @param {number} size - Desired size (SL parameter)
 * @param {number} quality - JPEG quality (0-100)
 * @returns {string} Resized image URL
 */
function resizeImageURL(imageUrl, size = 500, quality = 70) {
  const imageId = extractImageIDFromURL(imageUrl);
  if (!imageId) return imageUrl; // Return original if can't parse
  
  return buildImageURL(imageId, size, quality);
}
```

### Property Extraction Summary Table

| Property | Primary Source | Secondary | Tertiary | Fallback |
|----------|---------------|-----------|----------|----------|
| **ASIN** | Current URL | JSON-LD URL | HTML data-asin | Source code pattern |
| **Title** | All sources → shortest after cleaning | | | |
| **Brand** | JSON-LD | HTML bylineInfo | Title pattern | Description pattern |
| **Price** | JSON-LD | HTML offscreen | HTML price IDs | Meta tags |
| **Image** | HTML data-old-hires | JSON-LD | Meta tags | HTML src |
| **Description** | JSON-LD | Meta tags | HTML bullets | HTML description |
| **Variant** | URL params (psc/th) | Selected dropdowns | Selected buttons | Variation labels |

---

## Markdown Generation

Generate markdown links in three formats: text link, image link, and combined image+link.

### Format 1: Text Link

```javascript
/**
 * Generate markdown text link
 * Format: [Brand Product Name (Variant)](url)
 * 
 * @param {Document} doc - DOM document
 * @param {string} url - Page URL (optional)
 * @returns {string} Markdown link
 */
function generateMarkdownLink(doc, url = null) {
  // Extract data
  const asin = extractASIN(doc, url);
  if (!asin) {
    throw new Error('Could not extract ASIN - cannot generate link');
  }
  
  const title = extractTitle(doc);
  const brand = extractBrand(doc);
  const variant = extractVariant(doc, url);
  
  // Build link text: [Brand] Title [Variant]
  const linkParts = [];
  if (brand) linkParts.push(brand);
  if (title) {
    linkParts.push(title);
  } else {
    // Fallback to ASIN if no title
    linkParts.push(`Product ${asin}`);
  }
  
  const linkText = linkParts.join(' ');
  const variantText = formatVariant(variant);
  const fullText = variantText ? `${linkText} ${variantText}` : linkText;
  
  // Build URL
  const hasVariant = variant && Object.keys(variant).length > 0;
  const productUrl = buildProductURL(asin, hasVariant);
  
  return `[${fullText}](${productUrl})`;
}
```

### Format 2: Image Link

```javascript
/**
 * Generate markdown image link
 * Format: ![Product Name](image_url)
 * 
 * @param {Document} doc - DOM document
 * @param {number} imageSize - Desired image size (default 500)
 * @param {number} imageQuality - JPEG quality (default 70)
 * @returns {string} Markdown image link
 */
function generateMarkdownImage(doc, imageSize = 500, imageQuality = 70) {
  // Extract data
  const imageUrl = extractImage(doc);
  if (!imageUrl) {
    throw new Error('Could not extract image URL');
  }
  
  // Resize image to desired size
  const resizedUrl = resizeImageURL(imageUrl, imageSize, imageQuality);
  
  // Get alt text (use title if available)
  const title = extractTitle(doc);
  const altText = title || 'Product Image';
  
  return `![${altText}](${resizedUrl})`;
}
```

### Format 3: Combined Image with Link

```javascript
/**
 * Generate markdown image that links to product
 * Format: [![Product Name](image_url)](product_url)
 * 
 * @param {Document} doc - DOM document
 * @param {string} url - Page URL (optional)
 * @param {number} imageSize - Desired image size (default 500)
 * @param {number} imageQuality - JPEG quality (default 70)
 * @returns {string} Markdown image+link
 */
function generateMarkdownImageLink(doc, url = null, imageSize = 500, imageQuality = 70) {
  // Extract data
  const asin = extractASIN(doc, url);
  if (!asin) {
    throw new Error('Could not extract ASIN - cannot generate link');
  }
  
  const imageUrl = extractImage(doc);
  if (!imageUrl) {
    throw new Error('Could not extract image URL');
  }
  
  const title = extractTitle(doc);
  const variant = extractVariant(doc, url);
  
  // Resize image
  const resizedUrl = resizeImageURL(imageUrl, imageSize, imageQuality);
  
  // Build URLs
  const hasVariant = variant && Object.keys(variant).length > 0;
  const productUrl = buildProductURL(asin, hasVariant);
  
  // Alt text
  const altText = title || 'Product Image';
  
  return `[![${altText}](${resizedUrl})](${productUrl})`;
}
```

### All-in-One: Generate All Formats

```javascript
/**
 * Generate all three markdown formats at once
 * 
 * @param {Document} doc - DOM document
 * @param {string} url - Page URL (optional)
 * @param {number} imageSize - Desired image size (default 500)
 * @param {number} imageQuality - JPEG quality (default 70)
 * @returns {Object} All markdown formats
 */
function generateAllMarkdown(doc, url = null, imageSize = 500, imageQuality = 70) {
  return {
    link: generateMarkdownLink(doc, url),
    image: generateMarkdownImage(doc, imageSize, imageQuality),
    imageLink: generateMarkdownImageLink(doc, url, imageSize, imageQuality)
  };
}
```

### Markdown Generation Examples

```javascript
// Example usage in browser (userscript)
const markdown = generateAllMarkdown(document, window.location.href);

console.log('Text Link:');
console.log(markdown.link);
// Output: [Nintendo Switch – OLED Model (White)](https://www.amazon.com/dp/B098RKWHHZ?psc=1)

console.log('\nImage:');
console.log(markdown.image);
// Output: ![Nintendo Switch – OLED Model](https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL500_QL70_.jpg)

console.log('\nImage Link:');
console.log(markdown.imageLink);
// Output: [![Nintendo Switch – OLED Model](https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL500_QL70_.jpg)](https://www.amazon.com/dp/B098RKWHHZ?psc=1)
```

---

## Complete Examples

Full working examples demonstrating the complete extraction workflow from HTML to markdown.

### Example 1: Browser Context (Userscript)

```javascript
// ==UserScript==
// @name         Amazon Product Markdown Generator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Generate markdown links for Amazon products
// @match        https://www.amazon.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // All helper functions from previous sections go here
    // (safeQuery, safeText, extractJSONLD, etc.)
    
    /**
     * Main extraction function for current page
     */
    function extractCurrentProduct() {
        try {
            const doc = document;
            const url = window.location.href;
            
            // Extract all properties
            const product = {
                asin: extractASIN(doc, url),
                title: extractTitle(doc),
                brand: extractBrand(doc),
                price: extractPrice(doc),
                image: extractImage(doc),
                imageId: null,
                description: extractDescription(doc),
                variant: extractVariant(doc, url)
            };
            
            // Get image ID
            if (product.image) {
                product.imageId = extractImageID(product.image);
            }
            
            // Generate markdown
            const markdown = generateAllMarkdown(doc, url, 500, 70);
            
            return {
                product,
                markdown
            };
        } catch (error) {
            console.error('Error extracting product data:', error);
            return null;
        }
    }
    
    /**
     * Copy markdown to clipboard
     */
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    /**
     * Add button to page
     */
    function addMarkdownButton() {
        // Only on product pages
        if (!window.location.pathname.includes('/dp/')) {
            return;
        }
        
        const button = document.createElement('button');
        button.textContent = '📋 Copy Markdown Link';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            padding: 10px 15px;
            background: #ff9900;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        `;
        
        button.addEventListener('click', () => {
            const data = extractCurrentProduct();
            if (data) {
                // Copy text link by default
                copyToClipboard(data.markdown.link);
                
                // Show confirmation
                button.textContent = '✅ Copied!';
                setTimeout(() => {
                    button.textContent = '📋 Copy Markdown Link';
                }, 2000);
                
                // Log all formats to console
                console.log('=== Amazon Product Data ===');
                console.log('ASIN:', data.product.asin);
                console.log('Title:', data.product.title);
                console.log('Brand:', data.product.brand);
                console.log('Price:', data.product.price);
                console.log('Variant:', data.product.variant);
                console.log('\n=== Markdown Formats ===');
                console.log('Text Link:\n', data.markdown.link);
                console.log('\nImage:\n', data.markdown.image);
                console.log('\nImage Link:\n', data.markdown.imageLink);
            } else {
                alert('Failed to extract product data');
            }
        });
        
        document.body.appendChild(button);
    }
    
    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addMarkdownButton);
    } else {
        addMarkdownButton();
    }
})();
```

### Example 2: Node.js Context (Fetch and Extract)

```javascript
// fetch_amazon_product.js
const https = require('https');
const { JSDOM } = require('jsdom');
const fs = require('fs');

// All helper functions from previous sections go here
// (safeQuery, safeText, extractJSONLD, etc.)

/**
 * Fetch HTML from Amazon product page
 */
function fetchProductHTML(asin) {
    return new Promise((resolve, reject) => {
        const url = `https://www.amazon.com/dp/${asin}`;
        
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        }, (response) => {
            let html = '';
            
            response.on('data', (chunk) => {
                html += chunk;
            });
            
            response.on('end', () => {
                if (response.statusCode === 200) {
                    resolve(html);
                } else {
                    reject(new Error(`HTTP ${response.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * Extract product data from HTML string
 */
function extractProductFromHTML(html, url) {
    // Parse HTML into DOM
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Extract all properties
    const product = {
        asin: extractASIN(doc, url),
        title: extractTitle(doc),
        brand: extractBrand(doc),
        price: extractPrice(doc),
        image: extractImage(doc),
        imageId: null,
        description: extractDescription(doc),
        variant: extractVariant(doc, url)
    };
    
    // Get image ID
    if (product.image) {
        product.imageId = extractImageID(product.image);
    }
    
    // Generate markdown
    const markdown = generateAllMarkdown(doc, url, 500, 70);
    
    return {
        product,
        markdown
    };
}

/**
 * Main function
 */
async function main() {
    const asin = process.argv[2];
    
    if (!asin) {
        console.error('Usage: node fetch_amazon_product.js <ASIN>');
        process.exit(1);
    }
    
    try {
        console.log(`Fetching product: ${asin}...`);
        
        // Fetch HTML
        const html = await fetchProductHTML(asin);
        
        // Save HTML for debugging
        const filename = `./fetched/${asin}.html`;
        fs.mkdirSync('./fetched', { recursive: true });
        fs.writeFileSync(filename, html);
        console.log(`Saved HTML to: ${filename}`);
        
        // Extract data
        const url = `https://www.amazon.com/dp/${asin}`;
        const data = extractProductFromHTML(html, url);
        
        // Display results
        console.log('\n=== Product Data ===');
        console.log('ASIN:', data.product.asin);
        console.log('Title:', data.product.title);
        console.log('Brand:', data.product.brand);
        console.log('Price:', data.product.price);
        console.log('Image ID:', data.product.imageId);
        console.log('Variant:', data.product.variant);
        
        console.log('\n=== Markdown Formats ===');
        console.log('\nText Link:');
        console.log(data.markdown.link);
        
        console.log('\nImage:');
        console.log(data.markdown.image);
        
        console.log('\nImage Link:');
        console.log(data.markdown.imageLink);
        
        // Save as JSON
        const jsonFilename = `./fetched/${asin}.json`;
        fs.writeFileSync(jsonFilename, JSON.stringify(data, null, 2));
        console.log(`\nSaved data to: ${jsonFilename}`);
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run
main();
```

**Usage:**
```bash
npm install jsdom
node fetch_amazon_product.js B098RKWHHZ
```

### Example 3: Extract from Cached HTML File

```javascript
// extract_from_file.js
const fs = require('fs');
const { JSDOM } = require('jsdom');

// All helper functions from previous sections

/**
 * Extract from cached HTML file
 */
function extractFromFile(filepath, asin) {
    // Read HTML file
    const html = fs.readFileSync(filepath, 'utf8');
    
    // Parse into DOM
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Build URL
    const url = `https://www.amazon.com/dp/${asin}`;
    
    // Extract data
    const product = {
        asin: extractASIN(doc, url),
        title: extractTitle(doc),
        brand: extractBrand(doc),
        price: extractPrice(doc),
        image: extractImage(doc),
        imageId: null,
        description: extractDescription(doc),
        variant: extractVariant(doc, url)
    };
    
    if (product.image) {
        product.imageId = extractImageID(product.image);
    }
    
    const markdown = generateAllMarkdown(doc, url, 500, 70);
    
    return { product, markdown };
}

// Usage
const filepath = './fetched/B098RKWHHZ.html';
const asin = 'B098RKWHHZ';

const data = extractFromFile(filepath, asin);
console.log('Title:', data.product.title);
console.log('Markdown:', data.markdown.link);
```

### Example 4: Batch Processing Multiple Products

```javascript
// batch_extract.js
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// All helper functions from previous sections

/**
 * Process all HTML files in directory
 */
function batchExtract(directory) {
    const results = [];
    
    // Read all HTML files
    const files = fs.readdirSync(directory)
        .filter(f => f.endsWith('.html'));
    
    console.log(`Found ${files.length} HTML files`);
    
    for (const filename of files) {
        const filepath = path.join(directory, filename);
        const asin = filename.replace('.html', '');
        
        try {
            console.log(`Processing ${asin}...`);
            
            // Read and parse
            const html = fs.readFileSync(filepath, 'utf8');
            const dom = new JSDOM(html);
            const doc = dom.window.document;
            const url = `https://www.amazon.com/dp/${asin}`;
            
            // Extract
            const product = {
                asin: extractASIN(doc, url) || asin,
                title: extractTitle(doc),
                brand: extractBrand(doc),
                price: extractPrice(doc),
                image: extractImage(doc),
                variant: extractVariant(doc, url)
            };
            
            if (product.image) {
                product.imageId = extractImageID(product.image);
            }
            
            const markdown = generateAllMarkdown(doc, url, 500, 70);
            
            results.push({
                asin: product.asin,
                product,
                markdown
            });
            
        } catch (error) {
            console.error(`Error processing ${asin}:`, error.message);
        }
    }
    
    return results;
}

/**
 * Generate markdown table of products
 */
function generateProductTable(results) {
    let table = '| Image | Product | Price |\n';
    table += '|-------|---------|-------|\n';
    
    for (const result of results) {
        const { product, markdown } = result;
        const image = markdown.image.replace(/!\[.*?\]/, '![]'); // Remove alt text for table
        const link = markdown.link;
        const price = product.price || 'N/A';
        
        table += `| ${image} | ${link} | ${price} |\n`;
    }
    
    return table;
}

// Main
const directory = './fetched';
const results = batchExtract(directory);

console.log(`\n=== Extracted ${results.length} products ===\n`);

// Generate table
const table = generateProductTable(results);
console.log(table);

// Save results
fs.writeFileSync('./products.json', JSON.stringify(results, null, 2));
fs.writeFileSync('./products_table.md', table);

console.log('\nSaved to products.json and products_table.md');
```

### Example 5: Error Handling and Validation

```javascript
/**
 * Extract with comprehensive error handling
 */
function safeExtractProduct(doc, url) {
    const errors = [];
    const warnings = [];
    
    // Required fields
    let asin = null;
    try {
        asin = extractASIN(doc, url);
        if (!asin) {
            errors.push('ASIN extraction failed');
        }
    } catch (e) {
        errors.push(`ASIN extraction error: ${e.message}`);
    }
    
    let title = null;
    try {
        title = extractTitle(doc);
        if (!title) {
            warnings.push('Title extraction failed');
        }
    } catch (e) {
        warnings.push(`Title extraction error: ${e.message}`);
    }
    
    // Optional fields
    let brand = null;
    try {
        brand = extractBrand(doc);
        if (!brand) warnings.push('Brand not found');
    } catch (e) {
        warnings.push(`Brand extraction error: ${e.message}`);
    }
    
    let price = null;
    try {
        price = extractPrice(doc);
        if (!price) warnings.push('Price not found');
    } catch (e) {
        warnings.push(`Price extraction error: ${e.message}`);
    }
    
    let image = null;
    let imageId = null;
    try {
        image = extractImage(doc);
        if (!image) {
            warnings.push('Image not found');
        } else {
            imageId = extractImageID(image);
        }
    } catch (e) {
        warnings.push(`Image extraction error: ${e.message}`);
    }
    
    let variant = null;
    try {
        variant = extractVariant(doc, url);
    } catch (e) {
        warnings.push(`Variant extraction error: ${e.message}`);
    }
    
    // Validation
    if (errors.length > 0) {
        return {
            success: false,
            errors,
            warnings,
            product: null,
            markdown: null
        };
    }
    
    // Build product object
    const product = {
        asin,
        title: title || `Product ${asin}`,
        brand,
        price,
        image,
        imageId,
        variant
    };
    
    // Generate markdown
    let markdown = null;
    try {
        markdown = generateAllMarkdown(doc, url, 500, 70);
    } catch (e) {
        errors.push(`Markdown generation error: ${e.message}`);
        return {
            success: false,
            errors,
            warnings,
            product,
            markdown: null
        };
    }
    
    return {
        success: true,
        errors: [],
        warnings,
        product,
        markdown
    };
}

// Usage
const result = safeExtractProduct(document, window.location.href);

if (result.success) {
    console.log('✅ Extraction successful');
    if (result.warnings.length > 0) {
        console.warn('Warnings:', result.warnings);
    }
    console.log('Markdown:', result.markdown.link);
} else {
    console.error('❌ Extraction failed');
    console.error('Errors:', result.errors);
}
```

---

## Additional Properties

Beyond the core properties (ASIN, title, brand, price, image, variant), you can extract additional product information.

### Availability / Stock Status

```javascript
/**
 * Extract product availability status
 * Priority: JSON-LD → HTML availability element
 * 
 * @param {Document} doc - DOM document
 * @returns {Object|null} {status, text, inStock} or null
 */
function extractAvailability(doc) {
    // Method 1: JSON-LD
    const product = extractProductJSONLD(doc);
    if (product?.offers?.availability) {
        const availUrl = product.offers.availability;
        const inStock = availUrl.includes('InStock');
        
        return {
            status: availUrl.split('/').pop(), // "InStock", "OutOfStock", etc.
            text: inStock ? 'In Stock' : 'Out of Stock',
            inStock
        };
    }
    
    // Method 2: HTML #availability element
    const availElement = safeQuery(doc, '#availability');
    if (availElement) {
        const text = safeText(availElement);
        const inStock = text && (
            text.includes('In Stock') ||
            text.includes('Available') ||
            text.includes('Only') && text.includes('left')
        );
        
        return {
            status: inStock ? 'InStock' : 'OutOfStock',
            text: text || 'Unknown',
            inStock
        };
    }
    
    // Method 3: Success/error color indicators
    const successText = safeQuery(doc, '.a-size-medium.a-color-success');
    if (successText) {
        const text = safeText(successText);
        return {
            status: 'InStock',
            text: text || 'In Stock',
            inStock: true
        };
    }
    
    const errorText = safeQuery(doc, '.a-size-medium.a-color-error');
    if (errorText) {
        const text = safeText(errorText);
        return {
            status: 'OutOfStock',
            text: text || 'Out of Stock',
            inStock: false
        };
    }
    
    return null;
}
```

### Shipping Information

```javascript
/**
 * Extract shipping information
 * 
 * @param {Document} doc - DOM document
 * @returns {Object|null} {speed, text, deliveryDate} or null
 */
function extractShipping(doc) {
    // Method 1: Delivery message block
    const deliveryBlock = safeQuery(doc, '#mir-layout-DELIVERY_BLOCK, #deliveryMessageMIR');
    if (deliveryBlock) {
        const text = safeText(deliveryBlock);
        
        // Extract delivery date if present
        // Pattern: "Get it by Monday, Nov 6" or "Arrives Nov 6 - Nov 8"
        const dateMatch = text.match(/(?:by|Arrives)\s+([A-Za-z]+,?\s+[A-Za-z]+\s+\d+(?:\s*-\s*[A-Za-z]+\s+\d+)?)/);
        const deliveryDate = dateMatch ? dateMatch[1] : null;
        
        // Determine speed
        let speed = 'Standard';
        if (text.includes('FREE') || text.includes('Free')) {
            speed = 'Free';
        }
        if (text.includes('Prime')) {
            speed = 'Prime';
        }
        if (text.includes('tomorrow') || text.includes('Tomorrow')) {
            speed = 'Next Day';
        }
        
        return {
            speed,
            text: text || 'Unknown',
            deliveryDate
        };
    }
    
    // Method 2: Delivery popover trigger
    const deliveryPopover = safeQuery(doc, '[data-csa-c-content-id="DEXUnifiedCXPDM"]');
    if (deliveryPopover) {
        const text = safeText(deliveryPopover);
        return {
            speed: 'Standard',
            text: text || 'Unknown',
            deliveryDate: null
        };
    }
    
    return null;
}
```

### Product Rating and Review Count

```javascript
/**
 * Extract product rating and review count
 * 
 * @param {Document} doc - DOM document
 * @returns {Object|null} {rating, reviewCount, stars} or null
 */
function extractRating(doc) {
    // Method 1: Star rating element
    const starElement = safeQuery(doc, '[data-hook="rating-out-of-text"], .a-icon-alt');
    if (starElement) {
        const text = safeText(starElement);
        // Pattern: "4.5 out of 5 stars"
        const match = text.match(/([\d.]+)\s+out of\s+(\d+)/);
        if (match) {
            const rating = parseFloat(match[1]);
            const maxStars = parseInt(match[2]);
            
            // Get review count
            const reviewElement = safeQuery(doc, '#acrCustomerReviewText, [data-hook="total-review-count"]');
            let reviewCount = null;
            if (reviewElement) {
                const reviewText = safeText(reviewElement);
                // Pattern: "1,234 ratings" or "1,234 customer reviews"
                const reviewMatch = reviewText.match(/([\d,]+)/);
                if (reviewMatch) {
                    reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
                }
            }
            
            return {
                rating,
                reviewCount,
                stars: maxStars
            };
        }
    }
    
    // Method 2: Aggregate rating schema
    const ratingSchema = safeQuery(doc, '[itemprop="aggregateRating"]');
    if (ratingSchema) {
        const ratingValue = safeQuery(ratingSchema, '[itemprop="ratingValue"]');
        const ratingCount = safeQuery(ratingSchema, '[itemprop="ratingCount"]');
        
        return {
            rating: ratingValue ? parseFloat(safeText(ratingValue)) : null,
            reviewCount: ratingCount ? parseInt(safeText(ratingCount)) : null,
            stars: 5
        };
    }
    
    return null;
}
```

### Size Chart / Sizing Information

```javascript
/**
 * Extract size chart information
 * 
 * @param {Document} doc - DOM document
 * @returns {Object|null} {hasChart, chartUrl, measurements} or null
 */
function extractSizeChart(doc) {
    // Method 1: Size chart button/link
    const sizeChartLink = safeQuery(doc, 'a[href*="size"], [id*="size-chart"], .size-chart-link');
    if (sizeChartLink) {
        const chartUrl = safeAttr(sizeChartLink, 'href');
        return {
            hasChart: true,
            chartUrl: chartUrl ? `https://www.amazon.com${chartUrl}` : null,
            measurements: null
        };
    }
    
    // Method 2: Size chart table in page
    const sizeTable = safeQuery(doc, '#size-chart-table, table.sizing-chart');
    if (sizeTable) {
        // Extract table data
        const rows = safeQueryAll(sizeTable, 'tr');
        const measurements = [];
        
        for (const row of rows) {
            const cells = safeQueryAll(row, 'td, th');
            const rowData = cells.map(cell => safeText(cell));
            if (rowData.length > 0) {
                measurements.push(rowData);
            }
        }
        
        return {
            hasChart: true,
            chartUrl: null,
            measurements: measurements.length > 0 ? measurements : null
        };
    }
    
    return {
        hasChart: false,
        chartUrl: null,
        measurements: null
    };
}
```

### Product Dimensions and Weight

```javascript
/**
 * Extract product dimensions and weight
 * 
 * @param {Document} doc - DOM document
 * @returns {Object|null} {dimensions, weight, raw} or null
 */
function extractDimensions(doc) {
    // Look in product details table
    const detailRows = safeQueryAll(doc, '#prodDetails tr, #productDetails_detailBullets_sections1 tr');
    
    let dimensions = null;
    let weight = null;
    
    for (const row of detailRows) {
        const label = safeText(safeQuery(row, 'th, .a-span3'));
        const value = safeText(safeQuery(row, 'td, .a-span9'));
        
        if (!label || !value) continue;
        
        const labelLower = label.toLowerCase();
        
        // Product Dimensions
        if (labelLower.includes('dimension')) {
            dimensions = value;
        }
        
        // Item Weight / Package Weight
        if (labelLower.includes('weight')) {
            weight = value;
        }
    }
    
    if (dimensions || weight) {
        return {
            dimensions,
            weight,
            raw: { dimensions, weight }
        };
    }
    
    return null;
}
```

### All Additional Properties Combined

```javascript
/**
 * Extract all additional properties at once
 * 
 * @param {Document} doc - DOM document
 * @returns {Object} All additional properties
 */
function extractAdditionalProperties(doc) {
    return {
        availability: extractAvailability(doc),
        shipping: extractShipping(doc),
        rating: extractRating(doc),
        sizeChart: extractSizeChart(doc),
        dimensions: extractDimensions(doc)
    };
}
```

### Complete Product Data Object

```javascript
/**
 * Extract ALL product data (core + additional properties)
 * 
 * @param {Document} doc - DOM document
 * @param {string} url - Page URL (optional)
 * @returns {Object} Complete product data
 */
function extractCompleteProduct(doc, url = null) {
    // Core properties
    const core = {
        asin: extractASIN(doc, url),
        title: extractTitle(doc),
        brand: extractBrand(doc),
        price: extractPrice(doc),
        image: extractImage(doc),
        imageId: null,
        description: extractDescription(doc),
        variant: extractVariant(doc, url)
    };
    
    if (core.image) {
        core.imageId = extractImageID(core.image);
    }
    
    // Additional properties
    const additional = extractAdditionalProperties(doc);
    
    // Markdown
    const markdown = generateAllMarkdown(doc, url, 500, 70);
    
    // Product URL
    const hasVariant = core.variant && Object.keys(core.variant).length > 0;
    const productUrl = core.asin ? buildProductURL(core.asin, hasVariant) : null;
    
    return {
        ...core,
        ...additional,
        url: productUrl,
        markdown
    };
}
```

---

**Document Version:** 1.0  
**Last Updated:** November 4, 2025  
**Maintained by:** Zakk Hoyt

**Related Documentation:**
- [Amazon URL Reference](./AMAZON_URL_REFERENCE.md)
- [Amazon Image URL Reference](./AMAZON_IMAGE_URL_REFERENCE.md)

