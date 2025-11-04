# Amazon Toolkit Implementation Status

**Last Updated**: November 4, 2025

## Overview
Modular Amazon data extraction toolkit with independent namespaces for product extraction, store extraction, link manipulation, and markdown generation.

## Architecture

### Directory Structure
```
amazon_toolkit/
├── extractors/          # Data extraction from Amazon pages
│   ├── product_extractor.js
│   ├── store_extractor.js
│   └── shared_extractor.js
├── links/               # URL and link manipulation
│   ├── link_parser.js
│   ├── link_cleaner.js
│   └── link_image.js
├── markdown/            # Markdown generation and formatting
│   ├── markdown_generator.js
│   └── markdown_formatter.js
├── helpers/             # Amazon-specific utilities
│   ├── dom_helpers.js
│   ├── logging_helpers.js
│   └── validation_helpers.js
├── index.js            # Main exports
└── README.md           # Usage documentation
```

## Module Status

### ✅ Completed
- Directory structure created
- [x] `helpers/dom_helpers.js` - DOM query utilities (safeQuery, safeText, safeAttr)
- [x] `helpers/logging_helpers.js` - Logging functions (logFunctionBegin/End, log)
- [x] `helpers/validation_helpers.js` - Validation utilities (isValidASIN, isValidURL)
- [x] `extractors/shared_extractor.js` - Common extraction logic (JSON-LD, meta tags, HTML)
- [x] `extractors/product_extractor.js` - Product data extraction
- [x] `extractors/store_extractor.js` - Store/storefront data extraction
- [x] `links/link_parser.js` - URL/anchor parsing (ASIN extraction, query params)
- [x] `links/link_cleaner.js` - URL/title cleaning
- [x] `links/link_image.js` - Image URL composition
- [x] `markdown/markdown_formatter.js` - Text formatting
- [x] `markdown/markdown_generator.js` - Markdown link generation
- [x] `index.js` - Main entry point
- [x] `README.md` - Usage documentation

### 🚧 In Progress
- None

### ⏳ Pending
- Integration with existing userscripts (markdown_linker.user.js)
- Testing with live Amazon pages
- Module loading/bundling configuration

## Usage Scenarios

### Scenario A: Product Page (opt+click anywhere)
`product_extractor.js` → data structure → `link_cleaner.js` + `link_image.js` → `markdown_generator.js`

### Scenario B: Product Anchor (opt+click on anchor)
`link_parser.js` → anchor data → `link_cleaner.js` → `markdown_generator.js`

### Scenario C: Storefront
`store_extractor.js` → store data → `link_cleaner.js` → `markdown_generator.js`

## Design Principles

1. **Independence**: Each module usable standalone
2. **Data Structures**: Rich objects with original URLs, query params, all product/store data
3. **Flexibility**: Support short/long/medium URL versions
4. **Fallbacks**: Comprehensive extraction chains (JSON-LD → meta → HTML → regex)
5. **Conventions**: Follow userscript standards (strict mode, logging, JSDoc, error handling)

## Next Steps

1. Implement helper modules (logging, DOM, validation)
2. Implement shared_extractor.js (common extraction logic)
3. Implement product_extractor.js (full product data)
4. Implement store_extractor.js (storefront data)
5. Implement link modules (parser, cleaner, image)
6. Implement markdown modules (formatter, generator)
7. Create index.js and README.md
8. Integration testing with markdown_linker.user.js
