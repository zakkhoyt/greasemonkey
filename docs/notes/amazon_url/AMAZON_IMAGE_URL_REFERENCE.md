# Amazon Image URL Reference Guide

Complete reference for understanding, extracting, and manipulating Amazon product image URLs.

---

## Table of Contents
1. [URL Structure Overview](#url-structure-overview)
2. [URL Components Breakdown](#url-components-breakdown)
3. [Extracting Image URLs from Pages](#extracting-image-urls-from-pages)
4. [Image Modifiers Reference](#image-modifiers-reference)
5. [Generating Image Variants](#generating-image-variants)
6. [Common Use Cases](#common-use-cases)
7. [Examples and Patterns](#examples-and-patterns)

---

## URL Structure Overview

Amazon product image URLs follow a predictable structure that allows dynamic resizing and quality adjustment.

### Basic Structure

```
https://m.media-amazon.com/images/I/{IMAGE_ID}.{MODIFIERS}.{FORMAT}
```

### Example URL Breakdown

```
https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX679_.jpg
│                                  │         │          │
│                                  │         │          └─ Format (jpg)
│                                  │         └──────────── Modifiers (_AC_SX679_)
│                                  └────────────────────── Image ID (517W--vk2LL)
└───────────────────────────────────────────────────────── Base URL
```

### Real-World Examples

```
Thumbnail (300×300):
https://m.media-amazon.com/images/I/517W--vk2LL.__AC_SX300_SY300_QL70_ML2_.jpg

Medium (679px wide):
https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX679_.jpg

High-res (1143px):
https://m.media-amazon.com/images/I/517W--vk2LL._AC_SL1143_.jpg

Height-constrained (450px):
https://m.media-amazon.com/images/I/517W--vk2LL._AC_SY450_.jpg
```

---

## URL Components Breakdown

### 1. Base URL

```
https://m.media-amazon.com/images/I/
```

* **Domain:** `m.media-amazon.com` - Amazon's media CDN
* **Path:** `/images/I/` - Image storage path
* **Constant:** This part never changes

### 2. Image ID

The unique identifier for the product image.

**Format:** 10 alphanumeric characters (letters, numbers, hyphens, underscores)

**Examples:**
* `517W--vk2LL`
* `81TPfFdDS6L`
* `71JLG5CaWrL`

**Characteristics:**
* Unique per image (not per product)
* Same product may have multiple image IDs (for different angles)
* Remains constant across all size/quality variants of the same image

### 3. Modifiers

A dot-separated, underscore-delimited string that controls image rendering.

**Structure:**
```
.{PREFIX}_{DIMENSION1}_{DIMENSION2}_{QUALITY}_{ADDITIONAL}_
```

**Prefix Options:**
* `_AC` - Standard modifier prefix (most common)
* `__AC` - Double underscore variant (alternate format)

**Example Modifier Strings:**
* `._AC_SX679_` - Width 679px
* `.__AC_SX300_SY300_QL70_ML2_` - Width 300px, Height 300px, Quality 70%, ML2
* `._AC_SL1143_` - Largest dimension 1143px
* `._AC_SY450_` - Height 450px

### 4. File Format

**Common Formats:**
* `.jpg` - Most common, lossy compression
* `.png` - Less common, lossless compression (transparent backgrounds)

---

## Extracting Image URLs from Pages

### Method 1: Main Product Image (Primary)

The primary product image is typically in an `<img>` tag with specific IDs or classes.

**Common Locations:**

```html
<!-- Method 1a: Image with specific ID -->
<img id="landingImage" src="https://m.media-amazon.com/images/I/..." />

<!-- Method 1b: Image inside imgTagWrapper -->
<div id="imgTagWrapperId">
  <img src="https://m.media-amazon.com/images/I/..." />
</div>

<!-- Method 1c: Main image container -->
<img class="a-dynamic-image" src="https://m.media-amazon.com/images/I/..." />
```

**JavaScript Extraction:**
```javascript
// Try multiple selectors
const img = document.querySelector('#landingImage') ||
            document.querySelector('#imgTagWrapperId img') ||
            document.querySelector('.a-dynamic-image');

const imageUrl = img ? img.src : null;
```

### Method 2: High-Resolution Image (data-old-hires)

Many product images have a `data-old-hires` attribute pointing to a higher resolution version.

**HTML Pattern:**
```html
<img src="https://m.media-amazon.com/images/I/81TPfFdDS6L.__AC_SY445_SX342_QL70_ML2_.jpg"
     data-old-hires="https://m.media-amazon.com/images/I/81TPfFdDS6L._AC_SL1500_.jpg"
     alt="Product Name" />
```

**Characteristics:**
* `src` - Lower resolution (thumbnail/preview)
* `data-old-hires` - Higher resolution (full-size)
* Often the high-res version uses `_AC_SL{SIZE}_` format

**JavaScript Extraction:**
```javascript
const img = document.querySelector('#landingImage');
const lowResUrl = img.src;
const highResUrl = img.getAttribute('data-old-hires') || img.src;

console.log('Thumbnail:', lowResUrl);
console.log('High-res:', highResUrl);
```

### Method 3: Image Gallery/Thumbnails

Product pages usually have multiple images in a thumbnail gallery.

**HTML Pattern:**
```html
<div id="altImages">
  <li data-defaultasin="B0ABC123XY">
    <img src="https://m.media-amazon.com/images/I/41abc123._SS40_.jpg" 
         data-old-hires="https://m.media-amazon.com/images/I/41abc123._AC_SL1500_.jpg" />
  </li>
  <!-- More thumbnails... -->
</div>
```

**JavaScript Extraction:**
```javascript
// Get all thumbnail images
const thumbnails = document.querySelectorAll('#altImages img');

// Extract high-res URLs
const imageUrls = Array.from(thumbnails).map(img => 
  img.getAttribute('data-old-hires') || img.src
);

console.log('All product images:', imageUrls);
```

### Method 4: JavaScript Image Data

Some pages store image data in JavaScript variables.

**Pattern:**
```html
<script>
  var imageData = {
    "hiRes": "https://m.media-amazon.com/images/I/..._AC_SL1500_.jpg",
    "thumb": "https://m.media-amazon.com/images/I/..._SS40_.jpg"
  };
</script>
```

### Method 5: JSON-LD Structured Data

Some pages include structured data with image URLs.

**Pattern:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "image": "https://m.media-amazon.com/images/I/..._AC_SL1500_.jpg",
  ...
}
</script>
```

---

## Image Modifiers Reference

### Dimension Modifiers

#### `SX###` - Scale Width (X-axis)

Sets the maximum width in pixels. Height scales proportionally.

**Syntax:** `SX{pixels}`

**Examples:**
| Modifier | Width | Description |
|----------|-------|-------------|
| `SX40` | 40px | Tiny thumbnail |
| `SX300` | 300px | Small thumbnail |
| `SX342` | 342px | Medium thumbnail |
| `SX466` | 466px | Medium size |
| `SX522` | 522px | Medium-large |
| `SX569` | 569px | Large |
| `SX679` | 679px | Extra large |
| `SX1000` | 1000px | Very large |

**Usage:**
```
Original:  https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX679_.jpg
Smaller:   https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX300_.jpg
Larger:    https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX1000_.jpg
```

#### `SY###` - Scale Height (Y-axis)

Sets the maximum height in pixels. Width scales proportionally.

**Syntax:** `SY{pixels}`

**Examples:**
| Modifier | Height | Description |
|----------|--------|-------------|
| `SY40` | 40px | Tiny thumbnail |
| `SY300` | 300px | Small thumbnail |
| `SY355` | 355px | Medium |
| `SY445` | 445px | Medium-large |
| `SY450` | 450px | Large |
| `SY1000` | 1000px | Very large |

**Usage:**
```
Original:  https://m.media-amazon.com/images/I/517W--vk2LL._AC_SY450_.jpg
Shorter:   https://m.media-amazon.com/images/I/517W--vk2LL._AC_SY300_.jpg
Taller:    https://m.media-amazon.com/images/I/517W--vk2LL._AC_SY1000_.jpg
```

#### `SL###` - Scale Largest Dimension

Sets the maximum dimension (either width or height, whichever is larger). The other dimension scales proportionally.

**Syntax:** `SL{pixels}`

**Examples:**
| Modifier | Max Dimension | Use Case |
|----------|---------------|----------|
| `SL75` | 75px | Micro thumbnail |
| `SL160` | 160px | Small thumbnail |
| `SL500` | 500px | Medium size |
| `SL1000` | 1000px | Large size |
| `SL1143` | 1143px | High resolution |
| `SL1500` | 1500px | Extra high resolution |
| `SL2000` | 2000px | Maximum quality |

**Usage:**
```
Small:     https://m.media-amazon.com/images/I/517W--vk2LL._AC_SL160_.jpg
Medium:    https://m.media-amazon.com/images/I/517W--vk2LL._AC_SL500_.jpg
Large:     https://m.media-amazon.com/images/I/517W--vk2LL._AC_SL1143_.jpg
Max:       https://m.media-amazon.com/images/I/517W--vk2LL._AC_SL1500_.jpg
```

**Best Practice:** `SL` is often preferred for general use as it works well with both portrait and landscape images.

#### `SS##` - Super Small (Special Thumbnail)

Very small thumbnails, typically used in image galleries.

**Syntax:** `SS{pixels}`

**Examples:**
| Modifier | Size | Use Case |
|----------|------|----------|
| `SS40` | 40px | Tiny gallery thumbnail |
| `SS100` | 100px | Small gallery thumbnail |

### Quality Modifiers

#### `QL##` - Quality Level

JPEG compression quality (0-100). Lower values = smaller file size but more compression artifacts.

**Syntax:** `QL{0-100}`

**Examples:**
| Modifier | Quality | Use Case |
|----------|---------|----------|
| `QL50` | 50% | Heavy compression (small file) |
| `QL70` | 70% | Standard compression (balanced) |
| `QL80` | 80% | Light compression (good quality) |
| `QL90` | 90% | Minimal compression (high quality) |

**Usage:**
```
Low quality:   https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX679_QL50_.jpg
Standard:      https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX679_QL70_.jpg
High quality:  https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX679_QL90_.jpg
```

**Note:** Quality modifier only affects JPEG images. PNG images ignore this parameter.

### Additional Modifiers

#### `ML#` - Multi-Layer (Purpose Unclear)

Sometimes appears in URLs, purpose not fully documented.

**Examples:**
* `ML2` - Most common variant
* `ML1` - Alternate variant

**Usage:**
```
With ML2: https://m.media-amazon.com/images/I/517W--vk2LL.__AC_SX300_SY300_QL70_ML2_.jpg
```

### Prefix Variations

#### Single vs Double Underscore

* `_AC_` - Standard prefix (single underscore)
* `__AC_` - Alternate prefix (double underscore)

Both work identically. Double underscore often appears with multiple modifiers.

**Examples:**
```
Single:  ._AC_SX300_.jpg
Double:  .__AC_SX300_SY300_QL70_ML2_.jpg
```

---

## Generating Image Variants

### Basic Variant Generation

Given an image URL, you can generate any size/quality variant by modifying the modifiers section.

**Original URL:**
```
https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX679_.jpg
```

**Parse Components:**
```javascript
// Regex to extract components
const regex = /^(https:\/\/m\.media-amazon\.com\/images\/I\/)([^.]+)(\.[^.]+)?\.([a-z]+)$/;
const match = url.match(regex);

if (match) {
  const baseUrl = match[1];     // "https://m.media-amazon.com/images/I/"
  const imageId = match[2];     // "517W--vk2LL"
  const modifiers = match[3];   // "._AC_SX679_" (optional)
  const format = match[4];      // "jpg"
}
```

**Generate New Variants:**
```javascript
function generateImageVariant(imageId, width, height, quality, format = 'jpg') {
  const baseUrl = 'https://m.media-amazon.com/images/I/';
  
  // Build modifiers
  let modifiers = '_AC';
  if (width && height) {
    modifiers += `_SX${width}_SY${height}`;
  } else if (width) {
    modifiers += `_SX${width}`;
  } else if (height) {
    modifiers += `_SY${height}`;
  }
  
  if (quality) {
    modifiers += `_QL${quality}`;
  }
  
  modifiers += '_';
  
  return `${baseUrl}${imageId}.${modifiers}.${format}`;
}

// Examples
generateImageVariant('517W--vk2LL', 300, null, 70);
// → https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX300_QL70_.jpg

generateImageVariant('517W--vk2LL', null, 450, 80);
// → https://m.media-amazon.com/images/I/517W--vk2LL._AC_SY450_QL80_.jpg
```

### Using SL for Best Results

For general purpose resizing, `SL` (largest dimension) works best:

```javascript
function generateSquareImage(imageId, size, quality = 70) {
  return `https://m.media-amazon.com/images/I/${imageId}._AC_SL${size}_QL${quality}_.jpg`;
}

// Examples
generateSquareImage('517W--vk2LL', 500);
// → https://m.media-amazon.com/images/I/517W--vk2LL._AC_SL500_QL70_.jpg

generateSquareImage('517W--vk2LL', 1500, 90);
// → https://m.media-amazon.com/images/I/517W--vk2LL._AC_SL1500_QL90_.jpg
```

### Complete Parsing Function

```javascript
/**
 * Parse Amazon image URL into components
 * @param {string} url - Amazon image URL
 * @returns {object} Parsed components
 */
function parseAmazonImageUrl(url) {
  const regex = /^(https:\/\/m\.media-amazon\.com\/images\/I\/)([^.]+)(\.([^.]+))?\.([a-z]+)$/;
  const match = url.match(regex);
  
  if (!match) {
    return null;
  }
  
  const modifiers = match[4] || '';
  
  // Parse modifiers
  const sxMatch = modifiers.match(/SX(\d+)/);
  const syMatch = modifiers.match(/SY(\d+)/);
  const slMatch = modifiers.match(/SL(\d+)/);
  const qlMatch = modifiers.match(/QL(\d+)/);
  const ssMatch = modifiers.match(/SS(\d+)/);
  
  return {
    baseUrl: match[1],
    imageId: match[2],
    modifiers: modifiers,
    format: match[5],
    width: sxMatch ? parseInt(sxMatch[1]) : null,
    height: syMatch ? parseInt(syMatch[1]) : null,
    largest: slMatch ? parseInt(slMatch[1]) : null,
    quality: qlMatch ? parseInt(qlMatch[1]) : null,
    thumbnail: ssMatch ? parseInt(ssMatch[1]) : null
  };
}

// Example usage
const parsed = parseAmazonImageUrl(
  'https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX679_QL70_.jpg'
);

console.log(parsed);
/*
{
  baseUrl: "https://m.media-amazon.com/images/I/",
  imageId: "517W--vk2LL",
  modifiers: "_AC_SX679_QL70_",
  format: "jpg",
  width: 679,
  height: null,
  largest: null,
  quality: 70,
  thumbnail: null
}
*/
```

---

## Common Use Cases

### Use Case 1: Get Maximum Quality Image

When you have any image URL and want the highest resolution version:

```javascript
function getMaxQualityImage(url) {
  const parsed = parseAmazonImageUrl(url);
  if (!parsed) return url;
  
  return `${parsed.baseUrl}${parsed.imageId}._AC_SL1500_.${parsed.format}`;
}

// Example
const thumbnail = 'https://m.media-amazon.com/images/I/517W--vk2LL._AC_SX300_.jpg';
const highRes = getMaxQualityImage(thumbnail);
// → https://m.media-amazon.com/images/I/517W--vk2LL._AC_SL1500_.jpg
```

### Use Case 2: Generate Responsive Image Set

Create multiple sizes for responsive images:

```javascript
function generateResponsiveSet(imageId) {
  const sizes = [300, 500, 750, 1000, 1500];
  
  return sizes.map(size => ({
    width: size,
    url: `https://m.media-amazon.com/images/I/${imageId}._AC_SL${size}_.jpg`
  }));
}

// Example
const srcset = generateResponsiveSet('517W--vk2LL');
/*
[
  { width: 300, url: ".../_AC_SL300_.jpg" },
  { width: 500, url: ".../_AC_SL500_.jpg" },
  { width: 750, url: ".../_AC_SL750_.jpg" },
  { width: 1000, url: ".../_AC_SL1000_.jpg" },
  { width: 1500, url: ".../_AC_SL1500_.jpg" }
]
*/
```

### Use Case 3: Extract Image ID from Any Variant

Get the image ID so you can generate any variant:

```javascript
function extractImageId(url) {
  const match = url.match(/\/images\/I\/([^.]+)/);
  return match ? match[1] : null;
}

// Example
const url = 'https://m.media-amazon.com/images/I/517W--vk2LL.__AC_SX300_SY300_QL70_ML2_.jpg';
const imageId = extractImageId(url);
// → "517W--vk2LL"

// Now generate any variant
const thumbnail = `https://m.media-amazon.com/images/I/${imageId}._AC_SL160_.jpg`;
const fullSize = `https://m.media-amazon.com/images/I/${imageId}._AC_SL1500_.jpg`;
```

### Use Case 4: Optimize for Markdown Links

When creating markdown links, include an optimized image:

```javascript
function getOptimizedImageForMarkdown(url) {
  const imageId = extractImageId(url);
  if (!imageId) return url;
  
  // Medium size, good quality, reasonable file size
  return `https://m.media-amazon.com/images/I/${imageId}._AC_SL500_QL75_.jpg`;
}

// Example - use in markdown
const productUrl = 'https://www.amazon.com/dp/B0ABC123XY';
const imageUrl = getOptimizedImageForMarkdown(originalImageUrl);
const markdown = `[![Product](${imageUrl})](${productUrl})`;
```

---

## Examples and Patterns

### Pattern: Extract from Product Page

Complete example of extracting and generating images from a product page:

```javascript
/**
 * Extract product images from Amazon product page
 * @returns {object} Image URLs and IDs
 */
function extractProductImages() {
  // Get main image
  const mainImg = document.querySelector('#landingImage') || 
                  document.querySelector('.a-dynamic-image');
  
  // Get high-res version
  const highResUrl = mainImg ? 
    (mainImg.getAttribute('data-old-hires') || mainImg.src) : null;
  
  // Get all gallery images
  const galleryImgs = Array.from(document.querySelectorAll('#altImages img'));
  const galleryUrls = galleryImgs.map(img => 
    img.getAttribute('data-old-hires') || img.src
  );
  
  // Extract image IDs
  const imageIds = [highResUrl, ...galleryUrls]
    .filter(url => url)
    .map(url => extractImageId(url))
    .filter(id => id);
  
  return {
    mainImage: highResUrl,
    galleryImages: galleryUrls,
    imageIds: imageIds,
    // Generate consistent medium-size URLs
    mediumImages: imageIds.map(id => 
      `https://m.media-amazon.com/images/I/${id}._AC_SL500_.jpg`
    )
  };
}
```

### Pattern: Preload Images

Preload different sizes for faster display:

```javascript
function preloadImageSizes(imageId, sizes = [300, 500, 1000]) {
  sizes.forEach(size => {
    const img = new Image();
    img.src = `https://m.media-amazon.com/images/I/${imageId}._AC_SL${size}_.jpg`;
  });
}
```

### Pattern: Check Image Availability

Not all size combinations work. Test availability:

```javascript
async function isImageAvailable(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Test multiple sizes
async function findBestAvailableSize(imageId, preferredSizes = [1500, 1000, 500]) {
  for (const size of preferredSizes) {
    const url = `https://m.media-amazon.com/images/I/${imageId}._AC_SL${size}_.jpg`;
    if (await isImageAvailable(url)) {
      return url;
    }
  }
  // Fallback to small size (almost always available)
  return `https://m.media-amazon.com/images/I/${imageId}._AC_SL300_.jpg`;
}
```

---

## Reference Tables

### Common Size Presets

| Use Case | Modifier | Typical Dimensions | Quality |
|----------|----------|-------------------|---------|
| Micro Thumbnail | `_SS40_` | 40×40 | Default |
| Small Thumbnail | `_AC_SL160_` | 160px max | 70 |
| Medium Thumbnail | `_AC_SL300_QL70_` | 300px max | 70 |
| Gallery Preview | `_AC_SL500_` | 500px max | Default |
| Product Detail | `_AC_SL1000_` | 1000px max | Default |
| High Resolution | `_AC_SL1500_` | 1500px max | Default |
| Max Quality | `_AC_SL1500_QL90_` | 1500px max | 90 |

### URL Template Library

```javascript
const AMAZON_IMAGE_TEMPLATES = {
  // Thumbnails
  microThumb: (id) => `https://m.media-amazon.com/images/I/${id}._SS40_.jpg`,
  smallThumb: (id) => `https://m.media-amazon.com/images/I/${id}._AC_SL160_.jpg`,
  mediumThumb: (id) => `https://m.media-amazon.com/images/I/${id}._AC_SL300_.jpg`,
  
  // Standard sizes
  small: (id) => `https://m.media-amazon.com/images/I/${id}._AC_SL500_.jpg`,
  medium: (id) => `https://m.media-amazon.com/images/I/${id}._AC_SL750_.jpg`,
  large: (id) => `https://m.media-amazon.com/images/I/${id}._AC_SL1000_.jpg`,
  
  // High quality
  highRes: (id) => `https://m.media-amazon.com/images/I/${id}._AC_SL1500_.jpg`,
  maxQuality: (id) => `https://m.media-amazon.com/images/I/${id}._AC_SL1500_QL90_.jpg`,
  
  // Custom
  custom: (id, size, quality = 70) => 
    `https://m.media-amazon.com/images/I/${id}._AC_SL${size}_QL${quality}_.jpg`
};

// Usage
const imageId = '517W--vk2LL';
console.log(AMAZON_IMAGE_TEMPLATES.mediumThumb(imageId));
console.log(AMAZON_IMAGE_TEMPLATES.highRes(imageId));
console.log(AMAZON_IMAGE_TEMPLATES.custom(imageId, 800, 85));
```

---

## Summary: Best Practices

### For Userscripts

1. **Extract High-Res First:**
   * Always check `data-old-hires` attribute first
   * Falls back to `src` if not available

2. **Use Image ID:**
   * Extract the image ID once
   * Generate any variant on demand
   * Reduces data storage

3. **Optimize for Use Case:**
   * Thumbnails: `SL300` with `QL70`
   * Preview: `SL500` or `SL750`
   * High-quality: `SL1500`

4. **Consider File Size:**
   * `QL70` is good balance for web
   * `QL50-60` for mobile or bandwidth-constrained
   * `QL85-90` only when quality is critical

5. **Test Availability:**
   * Not all images support all sizes
   * Have fallback sizes ready
   * `SL300` and `SL500` almost always work

### Recommended Sizes for Different Contexts

| Context | Recommended Size | Rationale |
|---------|-----------------|-----------|
| Email notifications | `SL300` | Good balance, loads fast |
| Chat/messaging | `SL500` | Clear preview, reasonable size |
| Documentation | `SL750` | Good detail, web-optimized |
| Print/download | `SL1500` | Maximum available quality |
| Archive/backup | `SL1500_QL90` | Best quality preservation |

---

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained by:** Zakk Hoyt
