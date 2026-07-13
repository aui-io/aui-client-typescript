# @aui.io/aui-client

[![npm version](https://img.shields.io/npm/v/@aui.io/aui-client)](https://www.npmjs.com/package/@aui.io/aui-client)

Official TypeScript/JavaScript SDK for the AUI Apollo API. Provides REST access to
messaging, projects, agents, and threads, plus a real-time WebSocket messaging session.

## Installation

```bash
npm install @aui.io/aui-client
```

## Clients

The package exposes two clients, one per credential. Import and use the one that
matches your environment.

| Client | Credential | Browser | Purpose |
| --- | --- | --- | --- |
| `ApolloMessagingClient` | Publishable key (`pk_network_...`) | Yes | End-user messaging and channels |
| `ApolloManagementClient` | Organization API key | No — server only | Managing projects, agents, versions, and threads |

---

## Messaging

`ApolloMessagingClient` authenticates with a publishable key. It exchanges the key
for a short-lived access token and refreshes it as needed, so you never handle tokens
directly. The agent is derived from the key and is not passed in request bodies. The
client is safe to use in the browser.

```ts
import { ApolloMessagingClient } from '@aui.io/aui-client';

const client = new ApolloMessagingClient({
  publishableKey: 'pk_network_xxxxxxxxxxxxxxxxxxxxxxxx',
});
```

### Send a message

Omit `thread_id` to start a new thread, or pass it to continue one.

```ts
const response = await client.messaging.sendMessage({
  user_id: 'end-user-123',
  text: 'What can you help me with?',
  // thread_id: existingThreadId,
});

console.log(response.thread_id);
```

You can pass optional per-message values for the agent's configured context variables:

```ts
await client.messaging.sendMessage({
  user_id: 'end-user-123',
  text: 'Where is my order?',
  agent_variables: {
    static: { customer_name: 'Ada' },
    dynamic: { order_id: 'ORD-1042' },
  },
});
```

### Stream a message

`streamMessage` returns the reply as Server-Sent Events.

```ts
const stream = await client.messaging.streamMessage({
  user_id: 'end-user-123',
  text: 'Tell me about my account',
});

for await (const event of stream) {
  console.log(event);
}
```

### Welcome message and follow-up suggestions

```ts
const { welcome_message } = await client.messaging.getWelcomeMessage();

const { suggestions } = await client.messaging.generateFollowupSuggestions({
  context: { topic: 'order tracking' },
});
```

### Other messaging methods

| Method | Description |
| --- | --- |
| `sendMessage(request)` | Send a message and return the reply. |
| `streamMessage(request)` | Send a message and stream the reply (SSE). |
| `rerun(threadId, request)` | Re-run the latest turn of a thread. |
| `listMessages(threadId)` | Return the messages in a thread. |
| `threadTrace(threadId)` | Return the reasoning trace for each interaction in a thread. |
| `interactionTrace(interactionId)` | Return the reasoning trace for a single interaction. |
| `getWelcomeMessage()` | Return the agent's welcome message. |
| `generateFollowupSuggestions(request)` | Generate follow-up prompts from a context. |

### Channels (SMS and WhatsApp)

Start an outbound thread on a channel with `channels.initiateThread`. Pass `'sms'`
or `'whatsapp'` as the channel.

```ts
const thread = await client.channels.initiateThread('sms', {
  phone_number: '+14155551234',
  user_id: 'end-user-123',
  text: 'Hi! Your order has shipped.',
  // thread_id: existingThreadId,
});

console.log(thread.thread_id);
```

### WebSocket sessions

`connect()` opens a real-time messaging session. Authentication is handled for you,
and it works in both Node and the browser.

```ts
const socket = await client.connect();
await socket.waitForOpen();

socket.on('message', (message) => console.log(message));
socket.on('error', (error) => console.error(error));
socket.on('close', (event) => console.log('closed', event.code));

socket.sendMessage({
  type: 'message',
  agent_id: agentId,
  user_id: 'end-user-123',
  text: 'Hello over WebSocket',
});

socket.close();
```

The socket exposes `waitForOpen()`, `on(event, handler)` (events: `open`, `message`,
`error`, `close`), `sendMessage(request)`, `sendResume(request)`, and `close()`.
Note that `on()` registers a single handler per event; calling it again for the same
event replaces the previous handler. The socket type is exported as `SessionSocket`.

### Resolved key context

After the first request, or after calling `getContext()`, the scope resolved from the
publishable key is available.

```ts
const context = await client.getContext();
console.log(context.agentId, context.organizationId);

client.agentId;        // set after the first token exchange
client.organizationId;
```

---

## Management

`ApolloManagementClient` authenticates with an organization API key, sent as the
`x-organization-api-key` header on every request. It is intended for backend services
and CI. Do not expose the organization API key in the browser.

```ts
import { ApolloManagementClient } from '@aui.io/aui-client';

const client = new ApolloManagementClient({
  organizationApiKey: process.env.AUI_ORG_API_KEY,
});
```

### Projects

| Method | Description |
| --- | --- |
| `listProjects()` | List the organization's projects. |
| `createProject(request)` | Create a project. |
| `getProject(projectId)` | Fetch one project. |
| `deleteProject(projectId)` | Delete a project. |
| `getProjectUsage(projectId)` | Usage metrics aggregated across the project. |

```ts
const page = await client.projects.listProjects();
const project = await client.projects.createProject({ name: 'My project' });
const usage = await client.projects.getProjectUsage(project.id);
```

### Agents

| Method | Description |
| --- | --- |
| `listAgents(projectId, { filters })` | List a project's agents. |
| `createAgent(projectId, request)` | Create an agent. |
| `getAgent(agentId)` | Fetch one agent. |
| `updateAgent(agentId, request)` | Rename an agent. |
| `deleteAgent(agentId)` | Delete an agent and its versions. |
| `getAgentUsage(agentId)` | Usage metrics for one agent. |

```ts
const page = await client.agents.listAgents(projectId, { filters: {} });
const agent = await client.agents.createAgent(projectId, { name: 'Support bot' });
const usage = await client.agents.getAgentUsage(agent.id);
```

### Agent versions

| Method | Description |
| --- | --- |
| `listVersions(agentId, { filters })` | List an agent's versions, newest first. |
| `createVersion(agentId, request)` | Create a draft version. |
| `updateVersion(agentId, versionId, request)` | Update a version's metadata. |
| `pushVersion(agentId, versionId, request)` | Push a configuration bundle. |
| `pullVersion(agentId, versionId, request?)` | Download a version's configuration bundle. |
| `publishVersion(agentId, versionId)` | Make a version the agent's live version. |
| `archiveVersion(agentId, versionId)` | Archive a version. |

```ts
const draft = await client.agentVersions.createVersion(agentId, {});
await client.agentVersions.pushVersion(agentId, draft.id, { /* config bundle */ });
await client.agentVersions.publishVersion(agentId, draft.id);
```

### Threads

| Method | Description |
| --- | --- |
| `listThreads({ filters })` | List the organization's threads, newest first. |
| `getThread(threadId)` | Fetch one thread. |
| `updateThread(threadId, request)` | Update a thread (currently `title`). |
| `getThreadMessages(threadId)` | Return the thread's transcript. |
| `getThreadTrace(threadId)` | Return the reasoning trace for each interaction. |
| `getInteractionTrace(interactionId)` | Return the reasoning trace for a single interaction. |

`filters` supports `project_id`, `agent_id`, `user_id`, `external_id`, `created`
(range), `tool`, `rule`, and `param`. Prefer a filter such as `project_id` over an
empty object; the unfiltered list sorts every thread in the organization and can be slow.

```ts
const page = await client.threads.listThreads(
  { filters: { project_id: projectId } },
  { timeoutInSeconds: 120 },
);
const thread = await client.threads.getThread(threadId);
await client.threads.updateThread(threadId, { title: 'Renamed conversation' });
```

---

## Pagination

List endpoints return `{ results, meta }`. Use `meta.has_more` to detect further pages.

## Timeouts

There is no client-wide timeout. Set `timeoutInSeconds` per call when needed:

```ts
await client.threads.listThreads({ filters: {} }, { timeoutInSeconds: 120 });
```

## Error handling

`ApolloError` and `ApolloTimeoutError` are exported at the top level. Per-status errors,
such as `UnprocessableEntityError`, are available under the `Apollo` namespace.

```ts
import { ApolloError, Apollo } from '@aui.io/aui-client';

try {
  await client.agents.getAgent('missing-id');
} catch (error) {
  if (error instanceof Apollo.UnprocessableEntityError) {
    console.error(error.body);
  } else if (error instanceof ApolloError) {
    console.error(error.statusCode, error.body);
  } else {
    throw error;
  }
}
```

## TypeScript

The package ships type definitions. Request and response models are available under the
`Apollo` namespace.

```ts
import { Apollo } from '@aui.io/aui-client';

const request: Apollo.SubmitMessageRequest = {
  type: 'message',
  agent_id: 'agent-123',
  user_id: 'end-user-123',
  text: 'Typed request',
};
```

## Resources

- npm: [@aui.io/aui-client](https://www.npmjs.com/package/@aui.io/aui-client)
- GitHub: [aui-io/aui-client-typescript](https://github.com/aui-io/aui-client-typescript)
- Issues: [GitHub Issues](https://github.com/aui-io/aui-client-typescript/issues)

## License

Proprietary. Unauthorized copying or distribution is prohibited.
