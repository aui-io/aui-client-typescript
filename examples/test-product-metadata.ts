/**
 * Apollo SDK - Product Metadata API Test
 * Example demonstrating how to use the new product metadata endpoint
 */

import { ApolloClient } from '@aui.io/aui-client';

// Configuration
const CONFIG = {
  networkApiKey: process.env.NETWORK_API_KEY || 'API_KEY_YOUR_KEY_HERE'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m'
};

function log(message: string, color: string = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Test the Product Metadata endpoint
 */
async function testGetProductMetadata(): Promise<void> {
  log('\n🧪 Testing Get Product Metadata Endpoint', colors.cyan);
  log('='.repeat(60), colors.cyan);

  try {
    // Initialize client
    log('\n📦 Initializing Apollo Client...', colors.blue);
    const client = new ApolloClient({
      networkApiKey: CONFIG.networkApiKey,
    });
    log('✅ Client initialized successfully', colors.green);

    // Test different product links
    const testLinks = [
      'https://www.example.com/product/12345',
      'https://www.example.com/product/67890'
    ];

    log(`\n🔗 Testing ${testLinks.length} product links...`, colors.blue);

    for (let i = 0; i < testLinks.length; i++) {
      const link = testLinks[i];
      log(`\n📊 Test ${i + 1}/${testLinks.length}`, colors.yellow);
      log(`Link: ${link}`, colors.cyan);
      
      try {
        log('📤 Fetching product metadata...', colors.blue);
        
        const startTime = Date.now();
        const response = await client.controllerApi.getProductMetadata({
          link: link
        });
        const duration = Date.now() - startTime;

        log(`✅ Metadata retrieved successfully (${duration}ms)`, colors.green);
        log('\n📦 Product Metadata:', colors.cyan);
        console.log(JSON.stringify(response, null, 2));

        // Validate response
        if (response && typeof response === 'object') {
          log('✅ Response is a valid object', colors.green);
          
          // Show keys in the response
          const keys = Object.keys(response);
          log(`\n🔑 Response contains ${keys.length} keys:`, colors.cyan);
          keys.forEach(key => {
            const value = response[key];
            const type = Array.isArray(value) ? 'array' : typeof value;
            log(`   - ${key}: ${type}`, colors.cyan);
          });
        } else {
          log('⚠️  Response is not an object', colors.yellow);
        }

      } catch (error) {
        log(`❌ Error fetching metadata for link ${i + 1}:`, colors.red);
        console.error(error);
        
        if (error instanceof Error && 'statusCode' in error) {
          log(`   Status Code: ${(error as any).statusCode}`, colors.red);
        }
        if (error instanceof Error && 'body' in error) {
          log('   Error Body:', colors.red);
          console.error((error as any).body);
        }
      }
    }

    // Test with invalid link
    log('\n\n🧪 Testing with invalid link...', colors.yellow);
    try {
      await client.controllerApi.getProductMetadata({
        link: 'not-a-valid-url'
      });
      log('⚠️  Expected error but got response', colors.yellow);
    } catch (error) {
      log('✅ Correctly handled invalid link with error', colors.green);
      if (error instanceof Error && 'statusCode' in error) {
        log(`   Status Code: ${(error as any).statusCode}`, colors.cyan);
      }
    }

    log('\n' + '='.repeat(60), colors.cyan);
    log('✅ Product Metadata Test Complete!', colors.green);
    log('='.repeat(60), colors.cyan);

  } catch (error) {
    log('\n' + '='.repeat(60), colors.red);
    log('❌ Test Failed!', colors.red);
    log('='.repeat(60), colors.red);
    console.error('\nError details:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      log(`\nStatus Code: ${(error as any).statusCode}`, colors.red);
    }
    if (error instanceof Error && 'body' in error) {
      log('\nError Body:', colors.red);
      console.error((error as any).body);
    }
    
    process.exit(1);
  }
}

/**
 * Example: Using product metadata in a real application
 */
async function exampleUsage(): Promise<void> {
  const client = new ApolloClient({
    networkApiKey: CONFIG.networkApiKey
  });

  try {
    // Fetch metadata for a product
    const productUrl = 'https://www.example.com/product/12345';
    const metadata = await client.controllerApi.getProductMetadata({
      link: productUrl
    });

    // Use the metadata in your application
    console.log('Product Information:');
    console.log('- Name:', metadata.name || 'N/A');
    console.log('- Price:', metadata.price || 'N/A');
    console.log('- Description:', metadata.description || 'N/A');
    
    // You can now use this metadata to:
    // 1. Display product information in your UI
    // 2. Compare products
    // 3. Track pricing changes
    // 4. Enrich your product database
    
  } catch (error) {
    console.error('Failed to fetch product metadata:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  log('\n🚀 Starting Product Metadata Endpoint Test', colors.cyan);
  log('SDK: @aui.io/aui-client', colors.blue);
  
  testGetProductMetadata().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { testGetProductMetadata, exampleUsage };
