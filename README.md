# @aui.io/aui-client

[![npm version](https://img.shields.io/npm/v/@aui.io/aui-client)](https://www.npmjs.com/package/@aui.io/aui-client)
[![Built with Fern](https://img.shields.io/badge/Built%20with-Fern-brightgreen)](https://buildwithfern.com)

> **Official TypeScript/JavaScript SDK for the AUI Apollo API v2.** REST access to projects, agents, threads, and messaging, plus a real-time WebSocket messaging session.

## Installation

```bash
npm install @aui.io/aui-client
```

## Authentication

The SDK authenticates with a **publishable key** or an **organization API key** — you never manage bearer tokens yourself.

- **Publishable key** (`pk_network_…` for a single agent, or `pk_org_…` for an organization): exchanged automatically at `POST /management/v1/auth/token` for a short-lived bearer token that is cached and refreshed transparently.
- **Organization API key**: used directly as the bearer token.

Pass exactly one of them:

```typescript
import { ApolloClient } from '@aui.io/aui-client';

// With a publishable key (recommended for client / agent-scoped use)
const client = new ApolloClient({
    publishableKey: 'pk_network_xxxxxxxxxxxxxxxxxxxxxxxx',
});

// Or with an organization API key
const orgClient = new ApolloClient({
    organizationApiKey: 'YOUR_ORG_API_KEY',
});
```

## Quick Start

```typescript
import { ApolloClient } from '@aui.io/aui-client';

const client = new ApolloClient({
    publishableKey: 'pk_network_xxxxxxxxxxxxxxxxxxxxxxxx',
});

// List projects, then the agents in the first project
const projects = await client.projects.listProjects();
const projectId = projects.results[0].id;

const agents = await client.agents.listAgents(projectId, { filters: {} });
const agentId = agents.results[0].id;

// Send a message (creates a thread if thread_id is omitted)
const response = await client.messaging.sendMessage({
    agent_id: agentId,
    user_id: 'end-user-123',
    text: 'Hello from the SDK',
});

console.log('Thread:', response.thread_id);
```

## Configuration

The `ApolloClient` constructor accepts:

```typescript
interface ApolloClient.Options {
    environment?: ApolloEnvironment;  // Defaults to ApolloEnvironment.Gcp
    publishableKey?: string;          // pk_network_… or pk_org_…
    organizationApiKey?: string;      // Organization API key
}
```

### Environments

```typescript
import { ApolloEnvironment } from '@aui.io/aui-client';

ApolloEnvironment.Gcp = {
    base: 'https://api-v3.aui.io/apollo-api-v2',        // REST
    production: 'wss://api-v3.aui.io/apollo-api-v2',    // WebSocket
    local: 'ws://localhost:8000',                       // WebSocket (local)
};
```

`environment` defaults to `ApolloEnvironment.Gcp`, so most callers only need to pass a key.

## REST API

Resources are grouped on the client. All list endpoints are paginated and return `{ results, meta }`, where `meta.has_more` indicates further pages.

### Projects — `client.projects`

```typescript
const page = await client.projects.listProjects();       // { results, meta }
const project = await client.projects.getProject(projectId);
const usage = await client.projects.getProjectUsage(projectId);
```

### Agents — `client.agents`

```typescript
const page = await client.agents.listAgents(projectId, { filters: {} });
const agent = await client.agents.getAgent(agentId);      // agent.live_version_id, …
const usage = await client.agents.getAgentUsage(agentId);
```

### Threads — `client.threads`

```typescript
const page = await client.threads.listThreads({ filters: {} });
const thread = await client.threads.getThread(threadId);
const messages = await client.threads.getThreadMessages(threadId);
const trace = await client.threads.getThreadTrace(threadId);
```

### Messaging — `client.messaging`

```typescript
// Send a message. Omit thread_id to start a new thread.
const res = await client.messaging.sendMessage({
    agent_id: agentId,
    user_id: 'end-user-123',
    text: 'What can you help me with?',
    // thread_id: existingThreadId,
});
console.log('Thread:', res.thread_id);

// List the messages in a thread
const messages = await client.messaging.listMessages(res.thread_id);
```

## WebSocket Messaging

`client.connect()` opens a real-time session. The bearer token is resolved and attached to the upgrade automatically.

```typescript
const socket = await client.connect();
await socket.waitForOpen();

socket.on('message', (msg) => {
    console.log('Agent:', msg);
});
socket.on('error', (err) => console.error('WS error:', err));
socket.on('close', (event) => console.log('Closed:', event.code));

// Send a turn
socket.sendSubmitMessage({
    agent_id: agentId,
    user_id: 'end-user-123',
    text: 'Hello over WebSocket',
});

// When done
socket.close();
```

## Key Context Helpers

After the first request (or an explicit `getContext()`), scope resolved from the key is available:

```typescript
console.log(client.keyType);        // 'agent' | 'org' | 'unknown'

const ctx = await client.getContext();
console.log(ctx.agentId, ctx.organizationId, ctx.keyType);

client.agentId;         // populated once a token has been exchanged
client.organizationId;
```

## Error Handling

```typescript
import { ApolloError, UnprocessableEntityError } from '@aui.io/aui-client';

try {
    await client.agents.getAgent('missing-id');
} catch (error) {
    if (error instanceof UnprocessableEntityError) {
        console.error('Validation failed:', error.body);
    } else if (error instanceof ApolloError) {
        console.error('API error:', error.statusCode, error.body);
    } else {
        console.error('Unexpected error:', error);
    }
}
```

## TypeScript Support

The SDK ships full type definitions. Models are namespaced under `Apollo`:

```typescript
import { ApolloClient, Apollo } from '@aui.io/aui-client';

const req: Apollo.SubmitMessageRequest = {
    agent_id: 'agent-123',
    user_id: 'end-user-123',
    text: 'Typed request',
};
```

## Resources

- **GitHub:** [aui-io/aui-client-typescript](https://github.com/aui-io/aui-client-typescript)
- **npm:** [@aui.io/aui-client](https://www.npmjs.com/package/@aui.io/aui-client)
- **Issues:** [GitHub Issues](https://github.com/aui-io/aui-client-typescript/issues)

## License

Proprietary software. Unauthorized copying or distribution is prohibited.

---

**Built by the AUI team**
