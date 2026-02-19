# Changelog - Version 0.6.0

## Overview

This release includes significant updates to the Apollo SDK, adding a new product metadata endpoint and enhancing existing schemas with additional fields for better product information and workflow tracking.

## 🆕 New Features

### Product Metadata API Endpoint

A new endpoint has been added to retrieve metadata from product URLs:

**TypeScript:**
```typescript
const metadata = await client.controllerApi.getProductMetadata({
  link: 'https://www.example.com/product/12345'
});
```

**Python:**
```python
metadata = client.controller_api.get_product_metadata(
  link='https://www.example.com/product/12345'
)
```

**Endpoint Details:**
- **Method:** GET
- **Path:** `/api/v1/external/product-metadata`
- **Parameters:**
  - `link` (required): Product URL or link
  - `x-network-api-key` (header): API authentication key
- **Response:** Object with product metadata (dynamic schema based on source)

## 📊 Schema Enhancements

### Message Schema Updates

New fields added to the `Message` type:

1. **`welcome_message`** (string | null)
   - Contains welcome/greeting message for the conversation
   - Useful for displaying initial agent greetings

2. **`executed_workflows`** (string[])
   - Array of workflow identifiers that were executed
   - Helps track which automation workflows were triggered

### Card Schema Updates

Enhanced `Card` type with additional product information:

1. **`category`** (string) - **REQUIRED**
   - Product category classification
   - Examples: "Electronics", "Appliances", "Furniture"

2. **`query`** (object)
   - Search query parameters that matched this product
   - Default: `{}`
   - Useful for understanding relevance

3. **`sub_entities`** (MessageCardSubEntity[])
   - Nested product variants or related items
   - Default: `[]`
   - Structure:
     ```typescript
     {
       name: string;
       items: Array<{
         parameters: MessageCardParameter[];
         index?: number;
       }>;
     }
     ```

4. **`self_review`** (TaskInteractionOptionSelfReview | null)
   - AI-powered product relevance scoring
   - Structure:
     ```typescript
     {
       score: {
         value?: number | null;
         label: 'HIGH' | 'MEDIUM' | 'LOW';
         method: 'INVENTORY_CLASSIFICATION' | 'LLM' | 'LLM_PER_OPTION' | 
                 'CROSS_ENCODER_RANKER' | 'COHERE_RANKER' | 
                 'CONSTANT_SCORE' | 'PARAM_MATCHING';
       };
       type: 'WORKFLOW';
       mismatches?: string[];
       reasons?: string[];
       order?: number;
     }
     ```

### CardParameter Schema Updates

Enhanced parameter handling:

1. **`param`** (string) - **REQUIRED**
   - Parameter identifier/key
   
2. **`name`** (string | null)
   - Human-readable parameter name

### Context Schema Updates

New field in the `Context` type:

1. **`welcome_message`** (string | null)
   - Context-specific welcome message
   - Can be used to personalize greetings based on user context

## 📝 Documentation Updates

### Updated Files

1. **README.md**
   - Added `getProductMetadata()` method documentation
   - Added "What's New in v0.6.0" section
   - Added examples directory documentation
   - Added product metadata usage examples

2. **reference.md**
   - Added `getProductMetadata` API reference
   - Included usage examples and parameter descriptions

3. **fern/docs/pages/get-started/quickstart.mdx**
   - Added Step 6: Get Product Metadata section
   - Included TypeScript and Python examples

4. **fern/openapi.json**
   - Updated from version 0.5.3 to 0.6.0
   - Added `/api/v1/external/product-metadata` endpoint definition
   - Enhanced schema definitions with new fields

### New Files

1. **examples/test-product-metadata.js**
   - Complete JavaScript example for testing product metadata endpoint
   - Includes error handling and edge cases
   - Ready to run with `node examples/test-product-metadata.js`

2. **examples/test-product-metadata.ts**
   - TypeScript version of the product metadata test
   - Fully typed with proper interfaces
   - Includes JSDoc comments

3. **examples/README.md**
   - Documentation for all example files
   - Usage instructions
   - Prerequisites and setup guide

## 🔧 Breaking Changes

**NONE** - This release is fully backward compatible.

All new fields are either:
- Optional (can be null or omitted)
- Have default values
- Are additions to existing types (non-breaking)

The `category` field was added as required to the `Card` schema, but existing API responses should already include this field.

## 📦 Migration Guide

No migration needed! Simply update your SDK:

**TypeScript:**
```bash
npm update @aui.io/aui-client
```

**Python:**
```bash
pip install --upgrade aui-client
```

## 🎯 Use Cases

### Product Metadata API

Perfect for:
- E-commerce integrations
- Price monitoring systems
- Product comparison tools
- Catalog enrichment
- Automated product data extraction

### Enhanced Card Information

The new fields enable:
- Better product recommendations with AI scoring
- Category-based filtering and organization
- Variant management (sizes, colors, etc.)
- Relevance tracking and analytics

### Workflow Tracking

The `executed_workflows` field helps:
- Debug automation flows
- Track user journey
- Measure workflow effectiveness
- Audit system behavior

## 🧪 Testing

### Test Files Available

1. **Product Metadata Test:**
   ```bash
   export NETWORK_API_KEY="YOUR_KEY"
   node examples/test-product-metadata.js
   ```

2. **WebSocket Test (Updated SDK):**
   ```bash
   cd apollo-sdk/tests/typescript
   npm install  # Updates to v1.2.17
   node test-websocket-quick.js
   ```

## 📚 Additional Resources

- [GitHub Repository](https://github.com/aui-io/aui-client-typescript)
- [npm Package](https://www.npmjs.com/package/@aui.io/aui-client)
- [Python SDK](https://github.com/aui-io/aui-client-python)
- [Examples Directory](./examples/)

## 🙏 Feedback

Have questions or suggestions? 
- Open an issue: [GitHub Issues](https://github.com/aui-io/aui-client-typescript/issues)
- Contact your AUI representative

---

**Version:** 0.6.0  
**Release Date:** January 2026  
**Status:** ✅ Stable
