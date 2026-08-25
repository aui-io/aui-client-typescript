# @aui.io/aui-client

[![npm version](https://img.shields.io/npm/v/@aui.io/aui-client)](https://www.npmjs.com/package/@aui.io/aui-client)

Official TypeScript/JavaScript SDK for the AUI Apollo API. Provides REST access to
messaging, projects, agents, and threads, real-time reply streaming over SSE, plus a
WebSocket messaging session.

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

## Agent runtimes: v1 and v2

Every AUI agent runs on one of two runtime generations:

- **v1 agents** — the classic runtime.
- **v2 agents** — the current runtime generation, built for streaming-first experiences.

**You never pick a runtime when talking to an agent.** `sendMessage`, `streamMessage`,
`rerun`, and the channel openers route automatically based on the agent behind your
key — the same code works for both. The differences only show up in a few specific
places:

| Capability | v1 agents | v2 agents |
| --- | --- | --- |
| Send / stream / rerun / channels | ✅ | ✅ |
| Reading threads back (`listMessages`, `threads.*`) | Works with no extra field | Pass `runtime_version: '2'` |
| WebSocket session (`connect()`) | ✅ | ❌ — use `streamMessage` (SSE) instead |
| Traces (`threadTrace`, `interactionTrace`) | ✅ | Not yet available |
| Thread id format | 24-character hex (`68f1…`) | UUID (`01a0…-…`) |

**Not sure which kind of agent you have?** Look at a thread id it produces: UUIDs mean
a v2 agent, 24-character hex ids mean v1.

### The `runtime_version` field — when you need it

The optional `runtime_version` string appears on several requests and does one of two
jobs depending on where you pass it:

| Where | What it does | When to pass it |
| --- | --- | --- |
| Thread **reads**: `listMessages`, `threads.getThread`, `threads.updateThread`, `threads.getThreadMessages`, `threads.listThreads` | Tells the API which runtime the thread lives on. Defaults to v1. | **Required for v2 threads.** Omit for v1 threads. |
| Message **sends**: `sendMessage`, `streamMessage`, `rerun`, `channels.initiateThread` | Pins the turn to a specific runtime build (e.g. `'0.8.0'`). | Almost never — omit it and the platform uses the agent's own build. Advanced use only. Ignored by v1 agents. |

**Accepted values on reads:** any runtime version that isn't the `1.x` family selects
v2 — `'2'` is the simplest and what the examples below use, but a concrete version
such as `'0.8.0'` behaves identically. Omitting the field (or passing `'1'` /
`'1.0.0'`) selects v1. The value only picks the runtime generation to ask; it does
not have to match the thread's exact build.

The one rule to remember: **a thread lives on the runtime that created it.** Reading a
v2 thread without a `runtime_version` (or a v1 thread *with* one) asks the wrong
runtime and returns 404 — the SDK is fine, the thread is just on the other side.

```ts
// v1 thread — nothing extra:
const v1Messages = await client.messaging.listMessages(v1ThreadId);

// v2 thread — say so ('2' and a concrete version like '0.8.0' behave the same):
const v2Messages = await client.messaging.listMessages(v2ThreadId, {
  runtime_version: '2',
});
```

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

Omit `thread_id` to start a new thread, or pass it to continue one. This works
identically for v1 and v2 agents.

```ts
const response = await client.messaging.sendMessage({
  user_id: 'end-user-123',
  text: 'What can you help me with?',
  // thread_id: existingThreadId,
});

console.log(response.thread_id);
console.log(response.message.text);
```

You can pass optional per-message values for the agent's configured context variables:

```ts
await client.messaging.sendMessage({
  user_id: 'end-user-123',
  text: 'Where is my order?',
  agent_variables: {
    customer_name: 'Ada',
    order_id: 'ORD-1042',
  },
});
```

### Stream a message (SSE)

`streamMessage` sends a message and streams the reply as Server-Sent Events — ideal
for a live, token-by-token chat UI. It works for both agent kinds and is the
recommended real-time transport for v2 agents.

Note that the message payload rides under the `body` key (the request also accepts a
`Last-Event-ID` header for resuming a dropped stream):

```ts
const stream = await client.messaging.streamMessage({
  body: {
    user_id: 'end-user-123',
    text: 'Tell me about my account',
    // thread_id: existingThreadId,
  },
});

let reply = '';
for await (const event of stream) {
  switch (event.type) {
    case 'thread':
      // First frame: the resolved thread id (new threads are announced here).
      console.log('thread:', event.data?.thread_id);
      break;
    case 'event':
      // Token deltas while the agent works — append to render live text.
      if (typeof event.data?.text === 'string') reply += event.data.text;
      break;
    case 'message':
      // Terminal frame: the completed reply (authoritative text and cards).
      reply = event.data?.text ?? reply;
      break;
    case 'suggestions':
      // Optional final frame: ready-made follow-up prompts for your UI.
      console.log('follow-ups:', event.data?.suggestions);
      break;
    case 'error':
      console.error(event.data);
      break;
  }
}
```

The stream ends after the terminal `message` frame (plus an optional `suggestions`
frame). To resume a dropped stream without re-running the turn, reconnect with the
last `seq` you saw as `'Last-Event-ID'`.

### Rerun an interaction

`rerun` regenerates one agent reply. Both `interaction_id` (the agent message's id
from the transcript) and `text` are required. The regenerated turn lands on a **new
thread** — read the response's `thread_id`:

```ts
const rerun = await client.messaging.rerun(threadId, {
  interaction_id: agentMessageId,
  text: 'Where is my order?',
});

console.log(rerun.thread_id); // new thread containing the regenerated reply
```

### Read a transcript

`listMessages` returns a thread's messages. For v2 threads, pass the
`runtime_version` selector (see [the runtime section](#agent-runtimes-v1-and-v2)):

```ts
const messages = await client.messaging.listMessages(threadId); // v1 thread
const messagesV2 = await client.messaging.listMessages(threadId, {
  runtime_version: '2',
}); // v2 thread
```

### Welcome message and follow-up suggestions

```ts
const { welcome_message } = await client.messaging.getWelcomeMessage();

const { suggestions } = await client.messaging.generateFollowupSuggestions({
  context: { topic: 'order tracking' },
});
```

(With v2 agents, follow-up suggestions also arrive automatically as the streaming
`suggestions` frame — no extra call needed.)

### Messaging methods at a glance

| Method | Description | `runtime_version`? |
| --- | --- | --- |
| `sendMessage(request)` | Send a message and return the reply. | Optional build pin — normally omit |
| `streamMessage({ body })` | Send a message and stream the reply (SSE). | Optional build pin — normally omit |
| `rerun(threadId, request)` | Regenerate one reply onto a new thread. Requires `interaction_id` and `text`. | Optional build pin — normally omit |
| `listMessages(threadId, request?)` | Return the messages in a thread. | **Required for v2 threads** (e.g. `'2'`) |
| `threadTrace(threadId, request?)` | Reasoning trace per interaction (paginated). | v1 agents only |
| `interactionTrace(interactionId)` | Reasoning trace for one interaction. | v1 agents only |
| `getWelcomeMessage()` | Return the agent's welcome message. | — |
| `generateFollowupSuggestions(request)` | Generate follow-up prompts from a context. | — |

### Message cards

Replies can carry cards. Each card ships in two self-contained representations —
a ready-to-render `rendered_jsx` string and a structured `json_data` object
(`entity` plus `sub_entities`) — so you can render the JSX directly or read the
fields programmatically. Cards also carry lightweight metadata:

| Field | Meaning |
| --- | --- |
| `title` | The card's authored title. |
| `capability` | Which of the agent's capabilities produced the card — useful for picking a widget template. |
| `instance` | The specific record the card is about, if any. |

All three are optional strings and may be `null`, so read them defensively:

```ts
for (const card of message.cards ?? []) {
  console.log(card.title ?? 'Card', card.capability, card.instance);
}
```

### Channels (SMS and WhatsApp)

Start an outbound thread on a channel with `channels.initiateThread`. Pass `'sms'`
or `'whatsapp'` as the channel.

`phone_number` is the **recipient** (who receives the opener). `sender_id` is
**not** that phone number. It is the id of a sender record you already connected
in the AUI playground.

If you connected a specific phone number through the AUI playground (SMS or
WhatsApp), copy that sender's id and pass it as `sender_id`. The SDK then starts
the conversation **from that connected number**. Without `sender_id`, the platform
default sender is used instead.

The response includes `from` when a specific sender was used, so you can confirm
which connected number the opener was sent from.

```ts
const thread = await client.channels.initiateThread('sms', {
  phone_number: '+14155551234', // recipient
  user_id: 'end-user-123',
  text: 'Hi! Your order has shipped.',
  // thread_id: existingThreadId,
  // Id of the specific number you connected in the AUI playground.
  // Pass it here to start the conversation from that number.
  sender_id: '67c1a2b3d4e5f67890123456',
});

console.log(thread.thread_id, thread.from);
```

WhatsApp is the same call. Template fields apply to WhatsApp only; `text` is
used for SMS and ignored by WhatsApp.

```ts
const thread = await client.channels.initiateThread('whatsapp', {
  phone_number: '+14155551234', // recipient
  user_id: 'end-user-123',
  // Same playground-connected sender id — starts WhatsApp from that number
  sender_id: '67c1a2b3d4e5f67890123456',
  agent_display_name: 'Support', // bound to template variable {{1}}
});
```

### WebSocket sessions (v1 agents)

`connect()` opens a real-time messaging session. Authentication is handled for you,
and it works in both Node and the browser.

> **v1 agents only.** v2 agents don't accept WebSocket sessions — the socket replies
> with an error frame explaining the session is SSE-only. For real-time streaming
> with a v2 agent, use [`streamMessage`](#stream-a-message-sse); it delivers the same
> live experience over a plain HTTP connection.

```ts
const socket = await client.connect();
await socket.waitForOpen();

// The agent is resolved from your publishable key.
const { agentId } = await client.getContext();

socket.on('message', (message) => console.log(message));
socket.on('error', (error) => console.error(error));
socket.on('close', (event) => console.log('closed', event.code));

socket.sendMessage({
  type: 'message',
  agent_id: agentId!,
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

> **Upgrading from 3.3.4 or earlier:** list methods now take their filter fields
> directly on the request — drop the `filters: { … }` wrapper (the TypeScript
> compiler points at every call site). Versions up to 3.3.4 also did not apply
> list filters on the wire; from 3.3.5 they filter reliably.

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
| `listAgents(projectId, request?)` | List a project's agents (optional `name` substring filter). |
| `createAgent(projectId, request)` | Create an agent. |
| `getAgent(agentId)` | Fetch one agent. |
| `updateAgent(agentId, request)` | Rename an agent (re-publishes the live version with the new name). |
| `deleteAgent(agentId)` | Delete an agent and its versions. |
| `getAgentUsage(agentId)` | Usage metrics for one agent. |

```ts
const page = await client.agents.listAgents(projectId, {});
const filtered = await client.agents.listAgents(projectId, { name: 'support' });
const agent = await client.agents.createAgent(projectId, { name: 'Support bot' });
const usage = await client.agents.getAgentUsage(agent.id);
```

### Agent versions

| Method | Description |
| --- | --- |
| `listVersions(agentId, request?)` | List an agent's versions, newest first (filter by `status`, `tag`, `label`, `version_number`, `exclude_revisions`). |
| `createVersion(agentId, request)` | Create a draft version. |
| `updateVersion(agentId, versionId, request)` | Update a version's metadata. |
| `pushVersion(agentId, versionId, request)` | Push a configuration bundle. |
| `pullVersion(agentId, versionId, request?)` | Download a version's configuration bundle. |
| `publishVersion(agentId, versionId)` | Make a version the agent's live version. |
| `archiveVersion(agentId, versionId)` | Archive a version. |

```ts
const versions = await client.agentVersions.listVersions(agentId, {});
const draft = await client.agentVersions.createVersion(agentId, { source: 'agent-scope' });
await client.agentVersions.pushVersion(agentId, draft.id, {
  caller: 'cli',
  bundle: { /* config bundle (schema_version, general_settings, …) */ },
});
await client.agentVersions.publishVersion(agentId, draft.id);
```

### Threads

| Method | Description | `runtime_version`? |
| --- | --- | --- |
| `listThreads(request?)` | List threads, newest first. | Set `runtime_version` (e.g. `'2'`) to list v2 threads |
| `getThread(threadId, request?)` | Fetch one thread. | **Required for v2 threads** (e.g. `'2'`) |
| `updateThread(threadId, request)` | Update a thread (currently `title`). | **Required for v2 threads** (e.g. `'2'`) |
| `getThreadMessages(threadId, request?)` | Return the thread's transcript. | **Required for v2 threads** (e.g. `'2'`) |
| `getThreadTrace(threadId, request?)` | Reasoning trace per interaction (paginated). | v1 threads only |
| `getInteractionTrace(interactionId)` | Reasoning trace for one interaction. | v1 threads only |

Reading, renaming, or listing **v1 threads works exactly as before** — no new fields.
For **v2 threads**, pass the selector:

```ts
// v1 thread — unchanged:
const thread = await client.threads.getThread(threadId);
await client.threads.updateThread(threadId, { title: 'Renamed conversation' });

// v2 thread — add runtime_version:
const v2Thread = await client.threads.getThread(threadId, { runtime_version: '2' });
const v2Transcript = await client.threads.getThreadMessages(threadId, {
  runtime_version: '2',
});
await client.threads.updateThread(threadId, {
  runtime_version: '2',
  title: 'Renamed conversation',
});
```

#### Listing threads

Filter fields go directly on the request: `project_id`, `agent_id`, `user_id`,
`external_id`, `created` (range), `tool`, `rule`, and `param`. Prefer a filter such
as `project_id` over an empty request; the unfiltered list sorts every thread in
the organization and can be slow.

```ts
const page = await client.threads.listThreads(
  { project_id: projectId },
  { timeoutInSeconds: 120 },
);
```

**Listing v2 threads** has two extra rules:

- Set `runtime_version: '2'` **and** include an `agent_id` or a `user_id` filter
  (v2 listings are always scoped to an agent or an end user; an unscoped v2 list
  returns 400).
- Only `agent_id`, `user_id`, and `created` (together with `agent_id`) apply to v2
  listings. The v1-specific filters (`project_id`, `external_id`, `tool`, `rule`,
  `param`) and custom sorts return a clear 400 on the v2 path.

```ts
const v2Page = await client.threads.listThreads({
  runtime_version: '2',
  agent_id: [agentId],
});
```

Listed threads include a `version_tag` indicating the agent version the thread runs on.

---

## Pagination

List endpoints — including thread traces — return `{ results, meta }`. Use
`meta.has_more` to detect further pages.

## Timeouts

There is no client-wide timeout. Set `timeoutInSeconds` per call when needed:

```ts
await client.threads.listThreads({}, { timeoutInSeconds: 120 });
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

A common one to know: a **404 when reading a thread** usually means the
`runtime_version` selector didn't match where the thread lives — see
[Agent runtimes](#agent-runtimes-v1-and-v2).

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
