# Apollo SDK Examples

This directory contains example code demonstrating how to use the Apollo TypeScript SDK.

## Available Examples

### Product Metadata API

**Files:**
- `test-product-metadata.js` - JavaScript example
- `test-product-metadata.ts` - TypeScript example

**Description:**
Demonstrates how to use the new product metadata endpoint to fetch product information from URLs.

**Usage:**

```bash
# Set your API key
export NETWORK_API_KEY="API_KEY_YOUR_KEY_HERE"

# Run the JavaScript version
node examples/test-product-metadata.js

# Or run the TypeScript version (requires ts-node)
npx ts-node examples/test-product-metadata.ts
```

**What it demonstrates:**
- Initializing the Apollo client
- Fetching product metadata from URLs
- Handling successful responses
- Error handling for invalid URLs
- Extracting and using product information

## Prerequisites

1. Install the SDK:
```bash
npm install @aui.io/aui-client
```

2. Get your API key from your AUI dashboard

3. Set your API key as an environment variable:
```bash
export NETWORK_API_KEY="API_KEY_YOUR_KEY_HERE"
```

## Running Examples

Each example can be run independently. Make sure you have:
- Node.js installed (v16 or higher recommended)
- Valid API key set in environment variables
- The SDK installed in your project

## Need Help?

- Check the [main README](../README.md) for general documentation
- See the [API Reference](../reference.md) for detailed method documentation
- Open an issue on [GitHub](https://github.com/aui-io/aui-client-typescript/issues)
