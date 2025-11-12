# @aui.io/aui-client

[![npm version](https://img.shields.io/npm/v/@aui.io/aui-client)](https://www.npmjs.com/package/@aui.io/aui-client)
[![Built with Fern](https://img.shields.io/badge/Built%20with-Fern-brightgreen)](https://buildwithfern.com)

> **Official TypeScript/JavaScript SDK for AUI APIs** - Provides REST and WebSocket support for intelligent agent communication.

## 🚀 Installation

```bash
npm install @aui.io/aui-client
```

**Also available in Python:** `pip install aui-client` - [Python Documentation](https://github.com/aui-io/aui-client-python)

## ⚡ Quick Start

```typescript
import { ApolloClient } from '@aui.io/aui-client';

const client = new ApolloClient({
    networkApiKey: 'API_KEY_YOUR_KEY_HERE'
});

// This connects to production:
// - REST API: https://azure.aui.io/api/ia-controller
// - WebSocket: wss://api.aui.io/ia-controller/api/v1/external/session
```


### REST API - Create and Manage Tasks

```typescript
// Create a new task
const taskResponse = await client.controllerApi.createTask({
    user_id: 'user123'
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
// Connect to WebSocket
const socket = await client.apolloWsSession.connect();

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
    // Choose ONE of the following:
    baseUrl?: string;                    // Custom base URL (e.g., staging)
    environment?: ApolloEnvironment;      // Or use predefined environment
    
    // Authentication (required)
    networkApiKey: string;               // Your API key (x-network-api-key header)
    
    // Optional configurations
    headers?: Record<string, string>;    // Additional headers
    timeoutInSeconds?: number;           // Request timeout (default: 60)
    maxRetries?: number;                 // Max retry attempts (default: 2)
    fetch?: typeof fetch;                // Custom fetch implementation
}
```

**Production Environment (Default):**
```typescript
{
    base: "https://azure.aui.io/api/ia-controller",    // REST API
    production: "wss://api.aui.io"                     // WebSocket
}
```

The SDK is configured for production use. All REST and WebSocket connections use production servers.

---

### REST API Methods

All methods are accessed via `client.controllerApi.*`

#### `createTask(request)` - Create Task
Create a new task for the agent.

```typescript
const taskResponse = await client.controllerApi.createTask({
    user_id: string    // Unique user identifier
});

// Returns: { id: string, user_id: string, title: string, welcome_message?: string }
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
    task_id: string,          // Task identifier
    text: string,             // Message text
    is_external_api?: boolean // Optional: mark as external API call
});

// Returns: Message - Complete agent response with optional product cards
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
        user_id: userId
    });
    
    const taskId = taskResponse.id;
    console.log('Created task:', taskId);
    
    // Step 2: Connect to WebSocket
    const socket = await client.apolloWsSession.connect();
    
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
    { user_id: 'user123' },
    {
        timeoutInSeconds: 30,  // Override for this request only
        maxRetries: 2
    }
);
```

### WebSocket with Reconnection

```typescript
const socket = await client.apolloWsSession.connect({
    reconnectAttempts: 50,  // Try to reconnect up to 50 times
    debug: true             // Enable debug logging
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
        user_id: 'user123'
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
// Example: API_KEY_01K92N5BD5M7239VRK7YTK4Y6N
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

## 🔗 Resources

- **GitHub Repository:** [aui-io/aui-client-typescript](https://github.com/aui-io/aui-client-typescript)
- **npm Package:** [@aui.io/aui-client](https://www.npmjs.com/package/@aui.io/aui-client)
- **Python SDK:** [aui-client on PyPI](https://pypi.org/project/aui-client) | [Python Docs](https://github.com/aui-io/aui-client-python)
- **API Documentation:** [Full API Reference](https://docs.aui.io)
- **Report Issues:** [GitHub Issues](https://github.com/aui-io/aui-client-typescript/issues)

## 📄 License

This SDK is proprietary software. Unauthorized copying or distribution is prohibited.

## 🤝 Support

For support, please contact your AUI representative or open an issue on GitHub.

---

**Built with ❤️ by the AUI team**

