# @aui.io/aui-client

[![npm version](https://img.shields.io/npm/v/@aui.io/aui-client)](https://www.npmjs.com/package/@aui.io/aui-client)
[![Built with Fern](https://img.shields.io/badge/Built%20with-Fern-brightgreen)](https://buildwithfern.com)

> **Official TypeScript/JavaScript SDK for the AUI Apollo API v2.** REST access to projects, agents, threads, and messaging, plus a real-time WebSocket messaging session.

## Installation

```bash
npm install @aui.io/aui-client
```

## Authentication

There are two clients, one per credential flow — you never manage bearer tokens yourself. Each client exposes only the resources for its surface; pick the one that matches your environment (you can use both).

| Client | Credential | Resources | Browser-safe |
| --- | --- | --- | --- |
| `ApolloMessagingClient` | Publishable key (`pk_network_…` / `pk_org_…`) | `messaging`, `channels`, WebSocket sessions | **Yes** |
| `ApolloManagementClient` | Organization API key | `projects`, `agents`, `agentVersions`, `threads` | **No** — server-side only |

- **`ApolloMessagingClient`** exchanges the publishable key automatically at `POST /management/v1/auth/token` for a short-lived bearer token that is cached and refreshed transparently, and sent as `Authorization: Bearer …`.
- **`ApolloManagementClient`** sends the organization API key on every request as the `x-organization-api-key` header — there is no token exchange, caching, or refresh.

```typescript
import { ApolloMessagingClient, ApolloManagementClient } from '@aui.io/aui-client';

// Browser / widget / end-user (publishable key)
const messaging = new ApolloMessagingClient({
    publishableKey: 'pk_network_xxxxxxxxxxxxxxxxxxxxxxxx',
});

// Backend / CI (organization API key — never ship this to the browser)
const management = new ApolloManagementClient({
    organizationApiKey: 'YOUR_ORG_API_KEY',
});
```

## Quick Start

Messaging (publishable key) — the agent is derived from the key, so you don't pass it:

```typescript
import { ApolloMessagingClient } from '@aui.io/aui-client';

const messaging = new ApolloMessagingClient({
    publishableKey: 'pk_network_xxxxxxxxxxxxxxxxxxxxxxxx',
});

// Send a message (creates a thread if thread_id is omitted)
const response = await messaging.messaging.sendMessage({
    user_id: 'end-user-123',
    text: 'Hello from the SDK',
});

console.log('Thread:', response.thread_id);
```

Management (organization API key, server-side only):

```typescript
import { ApolloManagementClient } from '@aui.io/aui-client';

const management = new ApolloManagementClient({
    organizationApiKey: 'YOUR_ORG_API_KEY',
});

const projects = await management.projects.listProjects();
const projectId = projects.results[0].id;

const agents = await management.agents.listAgents(projectId, { filters: {} });
```

## Configuration

Each client takes its credential:

```typescript
interface ApolloMessagingClient.Options {
    publishableKey: string;       // pk_network_… or pk_org_…
}

interface ApolloManagementClient.Options {
    organizationApiKey: string;   // server-side only
}
```

## REST API

Resources are split by surface: messaging resources live on `ApolloMessagingClient`, management resources on `ApolloManagementClient`. All list endpoints are paginated and return `{ results, meta }`, where `meta.has_more` indicates further pages.

### Messaging client (`ApolloMessagingClient`)

#### Messaging — `messaging.messaging`

Full method list:

| Method | Description |
| --- | --- |
| `sendMessage(request)` | Send a message and get the full reply. Omit `thread_id` to start a new thread. |
| `streamMessage(request)` | Same as `sendMessage`, but streams the reply token-by-token over Server-Sent Events. |
| `rerun(threadId, request)` | Re-run the latest turn of a thread. |
| `listMessages(threadId)` | The thread transcript, scoped to the key's agent. |
| `threadTrace(threadId)` | Reasoning trace for every interaction in a thread. |
| `interactionTrace(interactionId)` | Reasoning trace for a single interaction. |
| `getWelcomeMessage()` | The agent's welcome message (from its live version). |
| `generateFollowupSuggestions(request)` | Suggested follow-up prompts from a context you provide. |

```typescript
// Send a message. Omit thread_id to start a new thread. The agent rides the key,
// so it isn't passed in the body.
const res = await messaging.messaging.sendMessage({
    user_id: 'end-user-123',
    text: 'What can you help me with?',
    // thread_id: existingThreadId,
    // Optional per-message values for the agent's configured context variables:
    // agent_variables: { static: { customer_name: 'Ada' }, dynamic: { order_id: 'ORD-1042' } },
});
console.log('Thread:', res.thread_id);

// Stream the reply instead (Server-Sent Events)
const stream = await messaging.messaging.streamMessage({ user_id: 'end-user-123', text: 'Tell me a story' });
for await (const event of stream) {
    console.log(event);
}

// Re-run the latest turn of a thread
const rerun = await messaging.messaging.rerun(res.thread_id, { user_id: 'end-user-123' });

// Read the transcript and traces
const messages = await messaging.messaging.listMessages(res.thread_id);
const traces = await messaging.messaging.threadTrace(res.thread_id);
const one = await messaging.messaging.interactionTrace(interactionId);

// Welcome message (from the agent's live version) — open a conversation UI before the first turn
const { welcome_message } = await messaging.messaging.getWelcomeMessage();

// Follow-up suggestions generated from a context you provide
const { suggestions } = await messaging.messaging.generateFollowupSuggestions({
    context: { topic: 'order tracking' },
});
```

#### Channels — `messaging.channels`

| Method | Description |
| --- | --- |
| `initiateThread(channel, request)` | Send the opening message on an outbound channel (`'sms'` / `'whatsapp'`) and bind the recipient to a thread. |

```typescript
// Start a channel-scoped thread (e.g. SMS opener). The agent rides the key, so it isn't
// passed in the body. Use 'whatsapp' for WhatsApp.
const sms = await messaging.channels.initiateThread('sms', {
    phone_number: '+14155551234',
    user_id: 'end-user-123',
    text: 'Hello from the SDK',
    // thread_id: existingThreadId, // omit to start a new thread
});
console.log('Thread:', sms.thread_id);
```

### Management client (`ApolloManagementClient`)

#### Projects — `management.projects`

| Method | Description |
| --- | --- |
| `listProjects()` | List the org's projects (paginated). |
| `createProject(request)` | Create a project. |
| `getProject(projectId)` | Fetch one project. |
| `deleteProject(projectId)` | Delete a project. |
| `getProjectUsage(projectId)` | Usage metrics aggregated across the project. |

```typescript
const page = await management.projects.listProjects();       // { results, meta }
const project = await management.projects.createProject({ name: 'My project' });
const fetched = await management.projects.getProject(project.id);
const usage = await management.projects.getProjectUsage(project.id);
await management.projects.deleteProject(project.id);
```

#### Agents — `management.agents`

| Method | Description |
| --- | --- |
| `listAgents(projectId, { filters })` | List a project's agents (paginated). |
| `createAgent(projectId, request)` | Create an agent (starts with no live version). |
| `getAgent(agentId)` | Fetch one agent, incl. its live version. |
| `updateAgent(agentId, request)` | Rename an agent. |
| `deleteAgent(agentId)` | Delete an agent and all its versions. |
| `getAgentUsage(agentId)` | Usage metrics for one agent. |

```typescript
const page = await management.agents.listAgents(projectId, { filters: {} });
const agent = await management.agents.createAgent(projectId, { name: 'Support bot' });
const fetched = await management.agents.getAgent(agent.id);   // fetched.live_version_id, …
await management.agents.updateAgent(agent.id, { name: 'Support bot v2' });
const usage = await management.agents.getAgentUsage(agent.id);
await management.agents.deleteAgent(agent.id);
```

#### Agent versions — `management.agentVersions`

| Method | Description |
| --- | --- |
| `listVersions(agentId, { filters })` | List an agent's versions, newest first. |
| `createVersion(agentId, request)` | Create a draft version (empty, from a template, or cloned). |
| `updateVersion(agentId, versionId, request)` | Update a version's metadata (label, tags, notes). |
| `pushVersion(agentId, versionId, request)` | Push a config bundle, committing a new revision. |
| `pullVersion(agentId, versionId, request?)` | Download a version's config bundle. |
| `publishVersion(agentId, versionId)` | Make a version the agent's live version. |
| `archiveVersion(agentId, versionId)` | Archive (retire) a version. |

```typescript
const versions = await management.agentVersions.listVersions(agentId, { filters: {} });
const draft = await management.agentVersions.createVersion(agentId, {});
await management.agentVersions.updateVersion(agentId, draft.id, { label: 'v1' });
await management.agentVersions.pushVersion(agentId, draft.id, { /* config bundle */ });
const bundle = await management.agentVersions.pullVersion(agentId, draft.id);
await management.agentVersions.publishVersion(agentId, draft.id);
await management.agentVersions.archiveVersion(agentId, draft.id);
```

#### Threads — `management.threads`

| Method | Description |
| --- | --- |
| `listThreads({ filters })` | List the org's threads, newest first (paginated). |
| `getThread(threadId)` | Fetch one thread. |
| `updateThread(threadId, request)` | Update a thread (currently `title`). |
| `getThreadMessages(threadId)` | The thread's full transcript. |
| `getThreadTrace(threadId)` | Reasoning trace for every interaction in the thread. |
| `getInteractionTrace(interactionId)` | Reasoning trace for a single interaction. |

`filters` supports `project_id`, `agent_id`, `user_id`, `external_id`, `created` (range), `tool`, `rule`, and `param`. Prefer a filter (e.g. `project_id`) over `{}` — the unfiltered list sorts every thread in the org and can be slow.

```typescript
const page = await management.threads.listThreads(
    { filters: { project_id: projectId } },
    { timeoutInSeconds: 120 }, // this endpoint can be slow; give it headroom
);
const thread = await management.threads.getThread(threadId);
const updated = await management.threads.updateThread(threadId, { title: 'Renamed conversation' });
const messages = await management.threads.getThreadMessages(threadId);
const trace = await management.threads.getThreadTrace(threadId);
const one = await management.threads.getInteractionTrace(interactionId);
```

## WebSocket Messaging

`connect()` opens a real-time session and is available on **`ApolloMessagingClient`** only (WebSocket messaging is publishable-key territory). The bearer token is attached to the upgrade automatically — it's passed as the first WebSocket subprotocol, which is the one credential channel browsers allow, so this works in the browser as well as in Node.

```typescript
const messaging = new ApolloMessagingClient({ publishableKey: 'pk_network_…' });
const socket = await messaging.connect();
await socket.waitForOpen();

socket.on('message', (msg) => {
    console.log('Agent:', msg);
});
socket.on('error', (err) => console.error('WS error:', err));
socket.on('close', (event) => console.log('Closed:', event.code));

// Send a turn (type is required on the WS submit frame)
socket.sendSubmitMessage({
    type: 'message',
    agent_id: agentId,
    user_id: 'end-user-123',
    text: 'Hello over WebSocket',
});

// Resume a dropped stream
socket.sendResume({ /* ResumeRequest */ });

// When done
socket.close();
```

The socket (`SessionSocket`) exposes: `waitForOpen()`, `on(event, handler)` (events: `open`, `message`, `error`, `close`), `sendSubmitMessage(request)`, `sendResume(request)`, and `close()`.

> **Notes**
> - `socket.on(event, handler)` registers a **single** handler per event — calling it
>   again for the same event replaces the previous handler rather than adding one.
> - The socket type is exported as `SessionSocket` (`import { SessionSocket } from '@aui.io/aui-client'`).
> - Request timeouts are **per call** via `timeoutInSeconds` on a request's options; there
>   is no client-wide default timeout. Pass it on slow calls, e.g.
>   `management.threads.listThreads({ filters: {} }, { timeoutInSeconds: 120 })`.

## Key Context Helpers

On **`ApolloMessagingClient`**, after the first request (or an explicit `getContext()`), the scope resolved from the publishable key is available:

```typescript
const messaging = new ApolloMessagingClient({ publishableKey: 'pk_network_…' });

console.log(messaging.keyType);        // 'agent' | 'org' | 'unknown'

const ctx = await messaging.getContext();
console.log(ctx.agentId, ctx.organizationId, ctx.keyType);

messaging.agentId;         // populated once a token has been exchanged
messaging.organizationId;
```

`ApolloManagementClient` proves only the organization (resolved server-side by the gateway), so it has no key-context helpers.

## Error Handling

`ApolloError` (the base API error) and `ApolloTimeoutError` are exported at the top
level. The per-status errors (e.g. `UnprocessableEntityError`) live under the `Apollo`
namespace.

```typescript
import { ApolloError, Apollo } from '@aui.io/aui-client';

try {
    await management.agents.getAgent('missing-id');
} catch (error) {
    if (error instanceof Apollo.UnprocessableEntityError) {
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
import { Apollo } from '@aui.io/aui-client';

const req: Apollo.SubmitMessageRequest = {
    type: 'message',
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
