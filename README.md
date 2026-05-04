# @aui.io/aui-client

[![npm version](https://img.shields.io/npm/v/@aui.io/aui-client)](https://www.npmjs.com/package/@aui.io/aui-client)
[![Built with Fern](https://img.shields.io/badge/Built%20with-Fern-brightgreen)](https://buildwithfern.com)

> **Official TypeScript/JavaScript SDK for AUI APIs** - Provides REST and WebSocket support for intelligent agent communication.

## 🚀 Installation

```bash
npm install @aui.io/aui-client
```

## ⚡ Quick Start

```typescript
import { ApolloClient, ApolloEnvironment } from '@aui.io/aui-client';

// Default: Uses Gcp environment
const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

// Or explicitly choose an environment:
const gcpClient = new ApolloClient({
    environment: ApolloEnvironment.Gcp,
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

const azureClient = new ApolloClient({
    environment: ApolloEnvironment.Azure,
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

const awsClient = new ApolloClient({
    environment: ApolloEnvironment.Aws,
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});
```


### REST API - Create and Manage Tasks

```typescript
// Create a new task
const taskResponse = await client.controllerApi.createTask({
    user_id: 'user123',
    task_origin_type: 'web-widget'  // Required: identifies the source of the task
});

console.log('Task ID:', taskResponse.id);
console.log('Welcome:', taskResponse.welcome_message);

// Get all messages for a task
const messages = await client.controllerApi.getTaskMessages(taskResponse.id);
console.log('Messages:', messages);

// Submit a message to an existing task
const messageResponse = await client.controllerApi.sendMessage({
    task_id: taskResponse.id,
    text: 'Looking for a microwave with at least 20 liters capacity',
    is_external_api: true
});

console.log('Agent response:', messageResponse.text);

// Get all tasks for a user
const userTasks = await client.controllerApi.listUserTasks({
    user_id: 'user123',
    page: 1,
    size: 10
});

console.log('Total tasks:', userTasks.total);
```

### WebSocket - Real-time Agent Communication

```typescript
// Connect to WebSocket with authentication headers
const socket = await client.apolloWsSession.connect({
    debug: false,
    reconnectAttempts: 3,
    headers: {
        'x-network-api-key': 'API_KEY_YOUR_KEY_HERE'
    }
});

// Listen for connection open
socket.on('open', () => {
    console.log('✅ Connected to agent');
    
    // Send a message
    socket.sendUserMessage({
        task_id: 'your-task-id',
        text: 'I need product recommendations for gaming laptops'
    });
});

// Handle streaming responses
socket.on('message', (message) => {
    // Streaming updates (partial responses)
    if (message.channel?.eventName === 'thread-message-text-content-updated') {
        console.log('Agent is typing:', message.data?.text);
    }
    
    // Final message with complete response
    if (message.id && message.text && message.sender) {
        console.log('Complete response:', message.text);
        
        // Handle product recommendations (if any)
        if (message.cards && message.cards.length > 0) {
            message.cards.forEach(card => {
                console.log(`${card.name} - ${card.id}`);
            });
        }
        
        // Follow-up suggestions
        if (message.followupSuggestions) {
            console.log('Suggestions:', message.followupSuggestions);
        }
    }
    
    // Error messages
    if (message.statusCode) {
        console.error('Agent error:', message.description);
    }
});

// Handle errors
socket.on('error', (error) => {
    console.error('WebSocket error:', error);
});

// Handle connection close
socket.on('close', (event) => {
    console.log('Connection closed:', event.code);
});

// Close connection when done
// socket.close();
```

## 📖 API Reference

### Client Configuration

The `ApolloClient` constructor accepts the following options:

```typescript
interface ApolloClient.Options {
    environment?: ApolloEnvironment;      // Use predefined environment (Gcp or Azure)
    
    // Authentication (required)
    networkApiKey: string;               // Your API key (x-network-api-key header)
    
    // Optional configurations
    headers?: Record<string, string>;    // Additional headers
    timeoutInSeconds?: number;           // Request timeout (default: 60)
    maxRetries?: number;                 // Max retry attempts (default: 2)
    fetch?: typeof fetch;                // Custom fetch implementation
}
```

### Available Environments

The SDK supports multiple environments for both REST API and WebSocket connections:

```typescript
import { ApolloEnvironment } from '@aui.io/aui-client';

// Gcp Environment (Default)
ApolloEnvironment.Gcp = {
    base: "https://api.aui.io/ia-controller",      // REST API
    wsUrl: "wss://api.aui.io"                       // WebSocket
}

// Azure Environment
ApolloEnvironment.Azure = {
    base: "https://azure-v2.aui.io/ia-controller", // REST API
    wsUrl: "wss://azure-v2.aui.io"                  // WebSocket
}

// AWS Environment
ApolloEnvironment.Aws = {
    base: "https://aws.aui.io/ia-controller",      // REST API
    wsUrl: "wss://aws.aui.io"                       // WebSocket
}

// Default (same as Gcp)
ApolloEnvironment.Default = {
    base: "https://api.aui.io/ia-controller",
    wsUrl: "wss://api.aui.io"
}
```

**Usage Example:**
```typescript
import { ApolloClient, ApolloEnvironment } from '@aui.io/aui-client';

// Use Azure environment
const client = new ApolloClient({
    environment: ApolloEnvironment.Azure,
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

// Both REST and WebSocket will use Azure endpoints
const task = await client.controllerApi.createTask({...});
const socket = await client.apolloWsSession.connect({
    debug: false,
    reconnectAttempts: 3,
    headers: {
        'x-network-api-key': 'API_KEY_YOUR_KEY_HERE'
    }
});
```

---

### REST API Methods

All methods are accessed via `client.controllerApi.*`

#### `createTask(request)` - Create Task
Create a new task for the agent.

```typescript
const taskResponse = await client.controllerApi.createTask({
    user_id: string,              // Unique user identifier
    task_origin_type: string      // Required: origin type (e.g., 'web-widget', 'mobile-app', 'api')
});

// Returns: { id: string, user_id: string, title: string, welcome_message?: string }
```

**Note:** `task_origin_type` is required in v1.2.17+. Common values: `'web-widget'`, `'mobile-app'`, `'api'`, `'internal-tool'`

#### `getTask(taskId)` - Get Task By ID
Retrieve a specific task by its ID.

```typescript
const task = await client.controllerApi.getTask(taskId: string);

// Returns: { id: string, user_id: string, title: string, welcome_message?: string }
```

**Example:**

```typescript
const task = await client.controllerApi.getTask('your-task-id');

console.log('Task ID:', task.id);
console.log('User ID:', task.user_id);
console.log('Title:', task.title);
if (task.welcome_message) {
    console.log('Welcome:', task.welcome_message);
}
```

#### `getTaskMessages(taskId)` - Get Task Messages
Retrieve all messages for a specific task.

```typescript
const messages = await client.controllerApi.getTaskMessages(taskId: string);

// Returns: Message[] - Array of messages
```

#### `sendMessage(request)` - Send Message
Submit a new message to an existing task (non-streaming).

```typescript
const messageResponse = await client.controllerApi.sendMessage({
    task_id: string,              // Task identifier
    text?: string,                // Message text (optional in v1.2.36+)
    is_external_api?: boolean,    // Optional: mark as external API call
    include_business_trace?: boolean, // Optional: include NLU/understanding + business decisions in trace_info (NEW in v1.2.37; replaces include_trace_info)
    include_context_trace?: boolean,  // Optional: include context section + call_integration decisions in trace_info (NEW in v1.2.37; replaces include_trace_info)
    context?: {                   // Optional: additional context
        url?: string,
        lead_details?: Record<string, any>,
        welcome_message?: string
    },
    agent_variables?: Record<string, unknown>,  // Optional: custom agent variables
    static_context?: Record<string, unknown>    // Optional: static context data (NEW in v1.2.36)
});

// Returns: Message - Complete agent response with optional product cards
```

**New in v1.2.28:** The `agent_variables` parameter allows you to pass custom context to the agent:

```typescript
// Example: Send message with agent variables
const response = await client.controllerApi.sendMessage({
    task_id: 'your-task-id',
    text: 'What products do you recommend?',
    is_external_api: true,
    agent_variables: {
        context: 'User is interested in electric vehicles',
        user_preference: 'eco-friendly',
        budget: 'mid-range'
    }
});
```

#### `listUserTasks(request)` - List User Tasks
Retrieve all tasks for a specific user with pagination.

```typescript
const tasksResponse = await client.controllerApi.listUserTasks({
    user_id: string,    // User identifier
    page?: number,      // Page number (optional, default: 1)
    size?: number       // Page size (optional, default: 10)
});

// Returns: { tasks: Task[], total: number, page: number, size: number }
```

#### `getProductMetadata(link)` - Get Product Metadata
Retrieve metadata for a product from a given URL/link.

```typescript
const metadata = await client.controllerApi.getProductMetadata({
    link: string    // Product URL or link
});

// Returns: Record<string, any> - Product metadata object
```

#### `getTraceInfo(taskId, messageId)` - Get Trace Info (NEW)
Retrieve trace/debug information for a specific message. Useful for debugging agent responses and understanding the processing pipeline.

```typescript
const traceInfo = await client.controllerApi.getTraceInfo('your-task-id', 'your-message-id');

// Returns: Record<string, any> - Trace information object
```

**Example:**

```typescript
// First, send a message with trace info enabled.
// Note: `include_trace_info` was replaced in v1.2.39 by two granular flags.
const message = await client.controllerApi.sendMessage({
    task_id: 'your-task-id',
    text: 'What products do you recommend?',
    is_external_api: true,
    include_business_trace: true,
    include_context_trace: true
});

// Then retrieve the full trace info for that message
const traceInfo = await client.controllerApi.getTraceInfo('your-task-id', message.id);
console.log('Trace Info:', traceInfo);
```

#### `getDirectFollowupSuggestions(request?)` - Get Direct Followup Suggestions
Retrieve AI-generated followup suggestions. Accepts optional `context` and `created_by` parameters.

```typescript
const response = await client.controllerApi.getDirectFollowupSuggestions({
    context?: Record<string, unknown>,  // Optional: context data (e.g., { task_id: 'xxx' })
    created_by?: string                 // Optional: user identifier
});

// Returns: DirectFollowupSuggestionsResponse
// {
//     suggestions?: string[],    // Array of suggested followup questions
//     metadata_id?: string       // Metadata ID for tracking/analytics
// }
```

**Example:**

```typescript
const response = await client.controllerApi.getDirectFollowupSuggestions({
    context: { task_id: 'your-task-id' },
    created_by: 'user123'
});

console.log('Metadata ID:', response.metadata_id);
console.log('Suggested followups:');
response.suggestions?.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion}`);
});
```

---

### WebSocket API

All WebSocket methods are accessed via `client.apolloWsSession.*`

#### `connect(args?)` - Establish Connection
Connect to the WebSocket for real-time communication.

```typescript
const socket = await client.apolloWsSession.connect({
    headers?: Record<string, string>,  // Additional headers
    debug?: boolean,                   // Enable debug mode (default: false)
    reconnectAttempts?: number         // Max reconnect attempts (default: 30)
});
```

#### Socket Events

Listen to events using `socket.on(event, callback)`:

```typescript
// Connection opened
socket.on('open', () => void);

// Message received from agent
socket.on('message', (message: Response) => void);

// Error occurred
socket.on('error', (error: Error) => void);

// Connection closed
socket.on('close', (event: CloseEvent) => void);
```

**Message Types:**
- `streaming_update` - Partial response while agent is thinking
- `final_message` - Complete response with optional product cards
- `error` - Error message from the agent

**New in v0.6.0:**
- **Message fields:** `welcome_message`, `executed_workflows` - Track workflow execution and welcome messages
- **Card fields:** `category`, `query`, `sub_entities`, `self_review` - Enhanced product card information with self-review scoring
- **Product Metadata API:** New endpoint to retrieve metadata from product URLs

#### Socket Methods

```typescript
// Send a message to the agent
socket.sendUserMessage({
    task_id: string,  // Task identifier
    text: string      // Message text
});

// Close the connection
socket.close();

// Wait for connection to open (returns Promise)
await socket.waitForOpen();

// Check connection state
const state = socket.readyState;
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
```

## 🎯 Common Use Cases

### Complete Example: E-commerce Product Search

```typescript
import { ApolloClient } from '@aui.io/aui-client';

const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

async function searchProducts(userId: string, query: string) {
    // Step 1: Create a task
    const taskResponse = await client.controllerApi.createTask({
        user_id: userId,
        task_origin_type: 'web-widget'
    });
    
    const taskId = taskResponse.id;
    console.log('Created task:', taskId);
    
    // Step 2: Connect to WebSocket with authentication
    const socket = await client.apolloWsSession.connect({
        debug: false,
        reconnectAttempts: 3,
        headers: {
            'x-network-api-key': 'API_KEY_YOUR_KEY_HERE'
        }
    });
    
    // Step 3: Set up event handlers
    socket.on('open', () => {
        console.log('Connected! Sending query...');
        socket.sendUserMessage({
            task_id: taskId,
            text: query
        });
    });
    
    socket.on('message', (message) => {
        if (message.channel?.eventName === 'thread-message-text-content-updated') {
            // Show real-time updates
            console.log('Agent:', message.data?.text);
        }
        
        if (message.id && message.text && message.sender) {
            console.log('\n✅ Final Response:', message.text);
            
            // Display product recommendations
            if (message.cards && message.cards.length > 0) {
                console.log('\n🛍️ Product Recommendations:');
                message.cards.forEach((card, index) => {
                    console.log(`${index + 1}. ${card.name}`);
                    console.log(`   Product ID: ${card.id}`);
                    if (card.parameters && card.parameters.length > 0) {
                        console.log(`   Attributes: ${card.parameters.length}`);
                    }
                });
            }
            
            // Close connection after receiving final response
            socket.close();
        }
    });
    
    socket.on('error', (error) => {
        console.error('Error:', error.message);
    });
}

// Usage
searchProducts('user123', 'I need a gaming laptop under $1500');
```

### REST API Only: Check Task Status

```typescript
import { ApolloClient } from '@aui.io/aui-client';

const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

async function getTaskHistory(userId: string) {
    // Get all tasks for a user
    const tasksResponse = await client.controllerApi.listUserTasks({
        user_id: userId,
        page: 1,
        size: 20
    });
    
    console.log(`Found ${tasksResponse.total} tasks`);
    
    // Get messages for the most recent task
    if (tasksResponse.tasks && tasksResponse.tasks.length > 0) {
        const latestTask = tasksResponse.tasks[0];
        const messages = await client.controllerApi.getTaskMessages(latestTask.id);
        
        console.log(`Task ${latestTask.id} has ${messages.length} messages`);
        messages.forEach(msg => {
            console.log(`[${msg.sender.type}]: ${msg.text}`);
        });
    }
}

getTaskHistory('user123');
```

### Get Product Metadata

```typescript
import { ApolloClient } from '@aui.io/aui-client';

const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

async function fetchProductMetadata(productLink: string) {
    try {
        // Fetch metadata for a product
        const metadata = await client.controllerApi.getProductMetadata({
            link: productLink
        });
        
        console.log('Product Metadata:', metadata);
        
        // Metadata might include: name, price, description, images, etc.
        if (metadata) {
            console.log('Available fields:', Object.keys(metadata));
        }
        
        return metadata;
    } catch (error) {
        console.error('Error fetching product metadata:', error);
        throw error;
    }
}

// Example usage
fetchProductMetadata('https://www.example.com/product/12345');
```

### Send Message with Agent Variables (NEW in v1.2.28)

```typescript
import { ApolloClient } from '@aui.io/aui-client';

const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

async function sendContextualMessage(taskId: string, message: string, userContext: Record<string, unknown>) {
    try {
        // Send a message with custom agent variables for contextual responses
        const response = await client.controllerApi.sendMessage({
            task_id: taskId,
            text: message,
            is_external_api: true,
            agent_variables: userContext
        });
        
        console.log('Agent Response:', response.text);
        
        // The agent will use the provided context to tailor its response
        if (response.cards && response.cards.length > 0) {
            console.log('Recommended products:', response.cards.length);
        }
        
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// Example usage - provide context about user preferences
sendContextualMessage('task-123', 'What do you recommend?', {
    context: 'User is browsing electric vehicles',
    user_preference: 'eco-friendly',
    budget_range: '$30,000 - $50,000',
    location: 'California'
});
```

### Get Trace Info (NEW)

```typescript
import { ApolloClient } from '@aui.io/aui-client';

const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

async function debugAgentResponse(taskId: string) {
    try {
        // Send a message with trace info enabled.
        // `include_trace_info` was replaced with the two flags below in v1.2.37.
        const message = await client.controllerApi.sendMessage({
            task_id: taskId,
            text: 'What products do you recommend?',
            is_external_api: true,
            include_business_trace: true,
            include_context_trace: true
        });

        console.log('Agent Response:', message.text);

        // Retrieve the full trace info for debugging
        const traceInfo = await client.controllerApi.getTraceInfo(taskId, message.id);
        console.log('Trace Info:', traceInfo);

        return traceInfo;
    } catch (error) {
        console.error('Error getting trace info:', error);
        throw error;
    }
}

debugAgentResponse('task-123');
```

### Get Direct Followup Suggestions

```typescript
import { ApolloClient } from '@aui.io/aui-client';

const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

async function getSuggestedQuestions(taskId: string, userId: string) {
    try {
        // Get AI-generated followup suggestions with context and user info
        const response = await client.controllerApi.getDirectFollowupSuggestions({
            context: { task_id: taskId },
            created_by: userId
        });
        
        console.log('Metadata ID:', response.metadata_id);
        console.log('Suggested followup questions:');
        response.suggestions?.forEach((suggestion, index) => {
            console.log(`  ${index + 1}. ${suggestion}`);
        });
        
        return response;
    } catch (error) {
        console.error('Error getting suggestions:', error);
        throw error;
    }
}

// Example usage
getSuggestedQuestions('task-123', 'user-456');
// Output:
// Metadata ID: 69e4b4d4359671434fdff849
// Suggested followup questions:
//   1. "What colors are available?"
//   2. "Do you offer financing options?"
//   3. "Can I schedule a test drive?"
```

## 🔧 Advanced Configuration

### Custom Timeout and Retries

```typescript
const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE',
    timeoutInSeconds: 120,  // 2 minute timeout
    maxRetries: 5           // Retry up to 5 times
});

// Per-request overrides
const taskResponse = await client.controllerApi.createTask(
    { 
        user_id: 'user123',
        task_origin_type: 'web-widget'
    },
    {
        timeoutInSeconds: 30,  // Override for this request only
        maxRetries: 2
    }
);
```

### WebSocket with Reconnection

```typescript
const socket = await client.apolloWsSession.connect({
    debug: true,                // Enable debug logging
    reconnectAttempts: 50,      // Try to reconnect up to 50 times
    headers: {
        'x-network-api-key': 'API_KEY_YOUR_KEY_HERE'
    }
});

// The WebSocket will automatically attempt to reconnect on failure
socket.on('close', (event) => {
    console.log(`Connection closed with code ${event.code}`);
    // Socket will auto-reconnect unless you called socket.close()
});
```

### Error Handling Best Practices

```typescript
import { ApolloClient, UnprocessableEntityError, ApolloError } from '@aui.io/apollo-sdk';

const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

try {
    const taskResponse = await client.controllerApi.createTask({
        user_id: 'user123',
        task_origin_type: 'web-widget'
    });
} catch (error) {
    if (error instanceof UnprocessableEntityError) {
        // Validation error (422)
        console.error('Validation failed:', error.body);
    } else if (error instanceof ApolloError) {
        // Other API errors
        console.error('API error:', error.statusCode, error.body);
    } else {
        // Network or other errors
        console.error('Unexpected error:', error);
    }
}
```

## 📦 TypeScript Support

This SDK is written in TypeScript and includes full type definitions. All types are automatically exported:

```typescript
import { 
    ApolloClient,
    // Request types
    CreateExternalTaskRequest,
    SubmitExternalMessageRequest,
    UserMessagePayload,
    // Response types
    CreateExternalTaskResponse,
    ExternalTaskMessage,
    ListExternalTasksResponse,
    StreamingUpdatePayload,
    FinalMessagePayload,
    ErrorMessagePayload,
    // Error types
    ApolloError,
    UnprocessableEntityError
} from '@aui.io/apollo-sdk';

// All methods have full IntelliSense support
const client = new ApolloClient({
    networkApiKey: 'YOUR_KEY'
});

// TypeScript will autocomplete and type-check
const taskResponse = await client.controllerApi.createTask({ user_id: 'user123' });
taskResponse.id; // ✅ Fully typed
```

## 🐛 Troubleshooting

### WebSocket Connection Issues

**Problem:** Connection fails with `1008 Policy Violation` or authentication errors

**Solution 1:** Make sure you're using SDK version **1.1.7 or higher**, which includes a fix for Node.js v21+ WebSocket compatibility:

```bash
npm install @aui.io/apollo-sdk@latest
```

**Solution 2:** If using an older SDK version, downgrade to Node.js v20:

```bash
# Check your Node version
node --version

# Switch to Node 20 if using nvm
nvm use 20

# Or install Node 20
nvm install 20
```

**Solution 3:** Verify your API key is being passed correctly:

```typescript
const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'  // Make sure this is set
});

// Or pass it per-request
const socket = await client.apolloWsSession.connect({
    headers: {
        'x-network-api-key': 'API_KEY_YOUR_KEY_HERE'
    }
});
```

### Authentication Errors (401/403)

**Problem:** Getting `401 Unauthorized` or `403 Forbidden` errors

**Solution:** Verify your API key:

```typescript
const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'  // Double-check this value
});

// The key should start with "API_KEY_"
// Example: API_KEY_01K------
```

### CORS Errors (Browser Only)

**Problem:** Getting CORS errors when using the SDK in a browser

**Solution:** The API must be configured to allow requests from your domain. Contact your API administrator to whitelist your origin.

### TypeScript Errors

**Problem:** TypeScript compilation errors or missing type definitions

**Solution:** Ensure you're using TypeScript 4.0 or higher:

```bash
npm install --save-dev typescript@latest
```

## 📚 Examples

The `examples/` directory contains ready-to-run code examples:

- **Product Metadata API** - [`examples/test-product-metadata.js`](./examples/test-product-metadata.js)
  - Fetch product information from URLs
  - Handle errors and edge cases
  - Extract and use metadata

Run examples:
```bash
export NETWORK_API_KEY="API_KEY_YOUR_KEY_HERE"
node examples/test-product-metadata.js
```

See the [examples README](./examples/README.md) for more details.

## 🔗 Resources

- **GitHub Repository:** [aui-io/aui-client-typescript](https://github.com/aui-io/aui-client-typescript)
- **npm Package:** [@aui.io/aui-client](https://www.npmjs.com/package/@aui.io/aui-client)
- **API Documentation:** [Full API Reference](https://docs.aui.io)
- **Report Issues:** [GitHub Issues](https://github.com/aui-io/aui-client-typescript/issues)

## 📄 License

This SDK is proprietary software. Unauthorized copying or distribution is prohibited.

## 🤝 Support

For support, please contact your AUI representative or open an issue on GitHub.

---

**Built with ❤️ by the AUI team**

