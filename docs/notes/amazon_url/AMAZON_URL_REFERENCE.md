# Amazon URL Reference Guide

Complete reference for understanding and working with Amazon URLs.

**Primary References:**
* [Amazon ASIN Documentation](https://affiliate-program.amazon.com/help/node/topic/GP38PJ6EUR6PFBEC)
* [Amazon URL Hacks](https://www.shipmentbot.com/blog/amazon-url-hacks/)
* [Amazon URL Anatomy Dissection](https://www.joehxblog.com/amazon-url-anatomy-dissection/)

**Tools:**
* [ASIN to UPC Converter](https://barcoderobot.com/asin-ean/)
* [Python amazon-scraper-api](https://pypi.org/project/amazon-scraper-api/)

---

## Table of Contents
1. [ASIN Overview](#asin-overview)
2. [Product URLs](#product-urls)
3. [Query Parameters](#query-parameters)
4. [Product Variants](#product-variants)
5. [Store URLs](#store-urls)
6. [Search URLs](#search-urls)
7. [Extracting Product Data](#extracting-product-data)

---

## ASIN Overview

**ASIN** (Amazon Standard Identification Number) is a unique 10-character alphanumeric identifier assigned to products on Amazon.

**Key Facts:**
* Required for all product URLs
* Format: 10 alphanumeric characters (e.g., `B0ABC123XY`)
* Books use their 10-digit ISBN as the ASIN
* Each product variant typically has its own ASIN (child ASINs)

---

## Product URLs

Amazon supports three URL syntax patterns for products. All patterns work identically - the difference is historical/organizational.

### URL Patterns

#### 1. `dp` Syntax (Most Common)
```
Minimal:  https://www.amazon.com/dp/{ASIN}
With PSC: https://www.amazon.com/dp/{ASIN}?psc=1
Full:     https://www.amazon.com/{product_description}/dp/{ASIN}?{query_params}
```

#### 2. `gp/product` Syntax
```
Minimal:  https://www.amazon.com/gp/product/{ASIN}
With PSC: https://www.amazon.com/gp/product/{ASIN}?psc=1
Full:     https://www.amazon.com/{product_description}/gp/product/{ASIN}?{query_params}
```

#### 3. `o/ASIN` Syntax (Legacy)
```
Minimal:  https://www.amazon.com/o/ASIN/{ASIN}
With PSC: https://www.amazon.com/o/ASIN/{ASIN}?psc=1
Full:     https://www.amazon.com/{product_description}/o/ASIN/{ASIN}?{query_params}
```

### Optional Components

**Product Description Path:**
* The `{product_description}` path segment is entirely optional
* Can be any string - Amazon ignores it (SEO purposes only)
* Examples:
  * `https://www.amazon.com/Nintendo-Switch/dp/B01MUAGZ49/`
  * `https://www.amazon.com/totally-fake-name/dp/B01MUAGZ49/`
  * Both lead to the same product

---

## Query Parameters

Query parameters appear after the `?` in the URL. Multiple parameters are separated by `&`.

### Essential Parameters (Preserve These)

#### `psc` - Product Selection Choice
* **Purpose:** Indicates a product variant (size/color) was selected
* **Value:** Typically `1` when variant is chosen
* **Keep?** ✅ YES - Essential for maintaining variant selection
* **Example:** `?psc=1`
* [Reference](https://www.shipmentbot.com/blog/amazon-url-hacks/)

#### `th` - Thumbnail/Theme
* **Purpose:** Appears frequently, likely variant-related
* **Value:** Typically `1`
* **Keep?** ⚠️ MAYBE - Purpose unclear but may affect variant display
* **Example:** `?th=1`
* [Reference](https://www.joehxblog.com/amazon-url-anatomy-dissection/)

### Tracking Parameters (Safe to Remove)

#### Analytics & Personalization
| Parameter | Purpose | Remove? |
|-----------|---------|---------|
| `crid` | Customer Request ID - session tracking | ✅ YES |
| `dib` | Data Integration Broker - personalized recommendations | ✅ YES |
| `dib_tag` | Tag for dib tracking | ✅ YES |
| `qid` | Query ID - timestamp of search (Unix format) | ✅ YES |
| `visitId` | Session visit identifier | ✅ YES |
| `xpid` | Experience ID - A/B testing | ✅ YES |

#### Product Detail Tracking
| Parameter | Purpose | Remove? |
|-----------|---------|---------|
| `pd_rd_i` | Product Details Read Item - viewed product ASIN | ✅ YES |
| `pd_rd_r` | Product Details Read Request - session ID | ✅ YES |
| `pd_rd_w` | Product Details Read Widget - widget ID | ✅ YES |
| `pd_rd_wg` | Product Details Read Widget Group - widget group ID | ✅ YES |

#### Product Feed Tracking
| Parameter | Purpose | Remove? |
|-----------|---------|---------|
| `pf_rd_p` | Product Feed Read Placement - recommendation placement | ✅ YES |
| `pf_rd_r` | Product Feed Read Request - request session | ✅ YES |

#### Referrer Tracking
| Parameter | Purpose | Remove? |
|-----------|---------|---------|
| `ref` | Referrer tracking - navigation path | ✅ YES |
| `ref_` | Alternative referrer tracking | ✅ YES |
| `re` | Redirect/referrer tracking | ✅ YES |

#### Search Tracking
| Parameter | Purpose | Remove? |
|-----------|---------|---------|
| `sr` | Search Result position (e.g., `1-2` = result #2 on page 1) | ✅ YES |
| `sprefix` | Search prefix - partial/corrected search term | ✅ YES |

### Search Parameters (Context-Specific)

| Parameter | Purpose | Notes |
|-----------|---------|-------|
| `k` / `keywords` | Search keyword/term (URL-encoded) | For search URLs only |
| `s` | Source category/department (e.g., videogames, apparel) | For search URLs only |
| `i` | Department/category filter (e.g., fashion) | For search URLs only |
| `q` | Query string for search | For search URLs only |
| `refinements` | Filter refinements applied to search | For search URLs only |
| `rnid` | Refinement Node ID - refinement category | For search URLs only |
| `rps` | Results Per Search page parameter | For search URLs only |
| `srs` | Search Refinement Store identifier | For search URLs only |

### Technical Parameters

| Parameter | Purpose | Notes |
|-----------|---------|-------|
| `_encoding` / `ie` | Character encoding (e.g., UTF8) | Same parameter, different names |
| `content-id` | Internal Amazon content identifier | For personalization |
| `format` | Image format specification (e.g., 2500w) | For image URLs |
| `ia` | Interface access type (e.g., web) | Rarely needed |
| `ingress` | Entry point tracking | Rarely needed |

### Affiliate Parameters

| Parameter | Purpose | Notes |
|-----------|---------|-------|
| `tag` / `associateTag` | Amazon Associates affiliate tracking ID | Keep if maintaining affiliate links |
| `linkCode` | Unknown affiliate-related parameter | Context-dependent |
| `linkId` | Unknown affiliate-related parameter | Context-dependent |

### Store Parameters

| Parameter | Purpose | Notes |
|-----------|---------|-------|
| `lp_asin` | Landing Page ASIN - product on brand store pages | For store URLs |
| `store_ref` | Store page referrer tracking | For store URLs |

### Marketplace Parameters

| Parameter | Purpose | Notes |
|-----------|---------|-------|
| `m` | Merchant/Seller ID (individual seller) | Different from marketplaceID |
| `marketplaceID` | Marketplace identifier (e.g., ATVPDKIKX0DER for US) | Regional identifier |

### Unknown Parameters

| Parameter | Purpose |
|-----------|---------|
| `t` | Tag parameter (possibly time or type-related) |

---

## Product Variants

Amazon uses a parent-child ASIN relationship system for product variations.

### Parent-Child ASIN Structure

#### Parent ASIN
* **Non-buyable** ASIN that groups related product variations
* Acts as a container/umbrella for all variants
* Appears in search results and category browsing
* Used for organizational purposes only

#### Child ASIN
* **Buyable** ASINs for each specific variant
* Each size/color/style combination gets its own unique ASIN
* Directly purchasable with its own inventory
* **Example:** T-shirt with 5 sizes × 3 colors = 15 child ASINs (+ 1 parent ASIN)

### How Variants Work in URLs

#### Case 1: Different ASIN per Variant (Most Common)

Products with size/color/style variations typically have different child ASINs:

```
Base product:   /dp/B0ABC123XY
Small/Red:      /dp/B0ABC124AA
Medium/Blue:    /dp/B0ABC125BB
Large/Green:    /dp/B0ABC126CC
```

When a user selects a variant on the product page:
1. The URL changes to that variant's ASIN
2. The `psc=1` parameter is added to preserve the selection
3. Example: `/dp/B0ABC124AA?psc=1`

#### Case 2: Same ASIN with Query Parameters (Less Common)

Some products (especially digital or simple variations) use query parameters instead:

```
Base:           /dp/B0ABC123XY
2-Pack:         /dp/B0ABC123XY?th=1
4-Pack:         /dp/B0ABC123XY?th=2
```

The ASIN remains the same, but `th=1` or `psc=1` indicates the variant.

### Variation Theme Types

Amazon supports several variation themes:

| Theme | Description | Example |
|-------|-------------|---------|
| **Size** | Different sizes | Small, Medium, Large, XL |
| **Color** | Different colors/patterns | Red, Blue, Striped |
| **SizeColor** | Matrix of both | Small/Red, Medium/Blue, etc. |
| **Style** | Different styles/designs | Classic, Modern, Vintage |
| **Flavor** | For consumables | Chocolate, Vanilla, Strawberry |
| **Scent** | For fragrances | Lavender, Rose, Citrus |
| **Material** | Different materials | Cotton, Polyester, Wool |
| **Pattern** | Different patterns | Solid, Striped, Floral |
| **Edition** | Different editions | Standard, Deluxe, Ultimate |

### URL Implications

| URL Type | User Experience |
|----------|-----------------|
| **Link to Child ASIN** | Takes user directly to specific variant |
| **Link to Parent ASIN** | Shows all variants, user must select |
| **Include `psc=1`** | Tells Amazon a product selection was made |
| **Include `th=1`** | May indicate variation threshold/theme |

**Best Practice for URL Sharing:**
* Link to specific child ASIN when possible
* Include `psc=1` to maintain variant selection
* Consider keeping `th` parameter if present

**References:**
* [Amazon Services: Parent-Child Relationships](https://services.amazon.com/resources/seller-university/how-to-create-parent-child-relationships.html)
* [Amazon Seller Central: Variation Relationships](https://sellercentral.amazon.com/help/hub/reference/G201958220)
* [Joe Hx Blog: Amazon URL Anatomy](https://www.joehxblog.com/amazon-url-anatomy-dissection/)

---

## Store URLs

Amazon brand stores have their own URL structure.

### Syntax
```
Minimal: https://www.amazon.com/stores/page/{store_uuid}
Full:    https://www.amazon.com/stores/{store_description}/page/{store_uuid}?{query_params}
```

### Required Components
* `page/{store_uuid}` - Unique identifier for the store page

### Optional Components
* `{store_description}` - Optional path component (like product_description)
* Query parameters:
  * `lp_asin` - Landing Page ASIN (links to product: `/dp/{lp_asin}`)
  * `ref_` - Referrer tracking (e.g., `ref_=ast_bln`)
  * `store_ref` - Store referrer (e.g., `store_ref=bl_ast_dp_brandLogo_sto`)
  * `visitId` - Session visit identifier

### Minimal URL Recommendation
```
https://www.amazon.com/stores/page/{store_uuid}
```

---

## Search URLs

Amazon search URLs have a distinct structure.

### Syntax
```
Basic:          https://www.amazon.com/s?k={search_term}
With Category:  https://www.amazon.com/s?k={search_term}&i={department}
```

### Required Components
* `/s?k={search_term}` - The search query (URL-encoded)

### Common Optional Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `i` | Department/category filter | `i=fashion` |
| `k` | Search term (alternate) | `k=Nintendo+Switch` |
| `crid` | Customer Request ID | Tracking - can remove |
| `ref` | Referrer tracking | Tracking - can remove |
| `sprefix` | Search prefix/autocorrect | Tracking - can remove |
| `srs` | Search Refinement Store | `srs=18216600011` |
| `refinements` | Applied filters | URL-encoded filter criteria |

### Example URLs
```
Simple search:
https://www.amazon.com/s?k=nintendo+switch

Search in specific category:
https://www.amazon.com/s?k=nintendo+switch&i=videogames

With tracking (to be removed):
https://www.amazon.com/s?k=nintendo+switch&crid=ABC123&ref=nb_sb_noss&sprefix=nintendo
```

### Minimal URL Recommendation
For search URLs, keep:
* `k` or `keywords` - The search term
* `i` - Category/department (if needed)
* `refinements` - Active filters (if needed)

Remove all tracking parameters.

---

## Extracting Product Data

When scraping or extracting product information from Amazon pages:

### Product Title

**Best Sources (in order of preference):**

1. **`<meta name="title">` Tag:**
   ```html
   <meta name="title" content="Product Name Here"/>
   ```

2. **`<title>` Tag:**
   ```html
   <title>Product Name Here</title>
   ```

3. **`#productTitle` Element:**
   ```html
   <h1 id="productTitle">Product Name Here</h1>
   ```
   * Also check `id="titleSection"`

4. **`data-old-hires` Attribute:**
   * Contains imageURL and product text
   * Reliable but text may be verbose

### Product Brand

Look for elements with brand-related identifiers:
```html
<span class="brand">Brand Name</span>
```

### Cleaning Titles

Common title suffixes to remove:
* ` at Amazon Women's Clothing store`
* ` at Amazon Men's Store`
* ` at Amazon.*` (any Amazon store suffix)

Pattern matching:
* `Amazon.com: (.*)` - Keep capture group
* `(.*) at Amazon.*` - Keep capture group

---

## Summary: URL Cleaning Strategy

### For Product URLs

**Minimal Clean URL:**
```
https://www.amazon.com/dp/{ASIN}
```

**With Variant Preserved:**
```
https://www.amazon.com/dp/{ASIN}?psc=1
```

**Parameters to Keep:**
* `psc` - ✅ Always keep (variant selection)
* `th` - ⚠️ Consider keeping (may affect variants)
* `tag` / `associateTag` - ⚠️ Keep only if maintaining affiliate links

**Parameters to Remove:**
* All `pd_rd_*` parameters
* All `pf_rd_*` parameters  
* All `ref*` parameters
* `crid`, `dib`, `dib_tag`
* `qid`, `visitId`, `xpid`
* `sr`, `sprefix`
* `_encoding`, `content-id`
* `keywords`, `k`, `s` (unless search URL)

### For Store URLs

**Minimal Clean URL:**
```
https://www.amazon.com/stores/page/{store_uuid}
```

### For Search URLs

**Minimal Clean URL:**
```
https://www.amazon.com/s?k={search_term}
```

**With Category:**
```
https://www.amazon.com/s?k={search_term}&i={department}
```

---

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained by:** Zakk Hoyt
