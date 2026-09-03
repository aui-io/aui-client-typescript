# @aui.io/aui-client

[![npm version](https://img.shields.io/npm/v/@aui.io/aui-client)](https://www.npmjs.com/package/@aui.io/aui-client)

Official TypeScript/JavaScript SDK for the AUI Apollo API. Provides REST access to
messaging, projects, agents, and threads, plus real-time reply streaming over
Server-Sent Events. Agents on runtime v1 additionally accept a WebSocket session —
see [Runtime v1 agents](#runtime-v1-agents).

## Installation

```bash
npm install @aui.io/aui-client
```

## Clients

The package exposes two clients, one per credential. Import and use the one that
matches your environment.

| Client | Credential | Browser | Purpose |
| --- | --- | --- | --- |
| `ApolloMessagingClient` | Publishable key (`pk_network_...`) | Yes | End-user messaging, streaming, and channels |
| `ApolloManagementClient` | Organization API key | No — server only | Managing projects, agents, versions, and threads |

---

## Threads and runtime versions

**A thread lives on the runtime that created it**, and thread reads name that runtime
with the optional `runtime_version` string. **You never pick a runtime when sending** —
`sendMessage`, `streamMessage`, `rerun`, and the channel openers route automatically
based on the agent behind your key, so the same code works for every agent.

`runtime_version` appears on several requests and does one of two jobs depending on
where you pass it:

| Where | What it does | When to pass it |
| --- | --- | --- |
| Thread **reads**: `listMessages`, `threads.getThread`, `threads.updateThread`, `threads.getThreadMessages`, `threads.listThreads` | Tells the API which runtime the thread lives on. Defaults to runtime v1. | **Required for runtime v2 threads.** Omit for runtime v1 threads. |
| Message **sends**: `sendMessage`, `streamMessage`, `rerun`, `channels.initiateThread` | Pins the turn to a specific runtime build (e.g. `'0.8.0'`). | Almost never — omit it and the platform uses the agent's own build. Advanced use only. Ignored by runtime v1 agents. |

**Accepted values on reads:** pass the runtime version your agent runs on — e.g.
`'0.8.0'`, the form all examples below use. The value selects the runtime
*generation*: anything outside the `1.x` family selects runtime v2, and it does not
have to match the thread's exact build. Omitting the field (or passing a `1.x` value)
selects runtime v1.

The one rule to remember: **a thread lives on the runtime that created it.** Reading a
runtime v2 thread without a `runtime_version` (or a runtime v1 thread *with* one) asks
the wrong runtime and returns 404 — the SDK is fine, the thread is just on the other
side.

```ts
// Runtime v2 thread — name the runtime (any non-1.x version selects runtime v2):
const messages = await client.messaging.listMessages(threadId, {
  runtime_version: '0.8.0',
});

// Runtime v1 thread — nothing extra:
const v1Messages = await client.messaging.listMessages(v1ThreadId);
```

Not sure which runtime your agent is on? UUID thread ids mean runtime v2; 24-character
hex ids mean runtime v1. See [Runtime v1 agents](#runtime-v1-agents) for the full
picture.

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
console.log(response.message.text);
```

You can pass optional per-message values for the agent's configured context
variables. The response returns your `agent_variables` back — next to
`thread_id`, exactly as you sent them: same keys, same values, no reshaping —
so you can correlate each reply with the context that produced it:

```ts
const response = await client.messaging.sendMessage({
  user_id: 'end-user-123',
  text: 'Where is my order?',
  agent_variables: {
    customer_name: 'Ada',
    order_id: 'ORD-1042',
  },
});

console.log(response.agent_variables); // { customer_name: 'Ada', order_id: 'ORD-1042' }
```

`streamMessage` echoes them the same way on its terminal `message` frame.

### Stream a message (SSE)

`streamMessage` is the streaming transport: it sends a message and streams the reply
as Server-Sent Events — one HTTP call per turn, the same request body and auth as
`sendMessage`, no connection to keep alive, and resumable after a drop. Ideal for a
live, token-by-token chat UI, and it works for every agent regardless of runtime.

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
      // Terminal frame: the completed reply (authoritative text and cards),
      // plus your agent_variables echoed back exactly as sent.
      reply = event.data?.text ?? reply;
      break;
    case 'suggestions':
      // Optional final frame (runtime v2 agents): ready-made follow-up prompts,
      // with the thread_id and interaction_id they belong to.
      console.log('follow-ups:', event.data?.followup_suggestions);
      break;
    case 'error':
      // The turn failed mid-stream.
      console.error(event.data);
      break;
  }
}
```

The stream ends after the terminal `message` frame — plus, for runtime v2 agents, a
`suggestions` frame whose data carries `followup_suggestions` alongside the
`thread_id` and `interaction_id` they belong to (runtime v1 agents don't emit this
frame; their `followup_suggestions` ride on the message itself). To resume a dropped
stream without re-running the turn, reconnect with the last `seq` you saw as
`'Last-Event-ID'`.

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

`listMessages` returns a thread's messages. Pass the `runtime_version` selector — the
runtime version your agent runs on (see
[Threads and runtime versions](#threads-and-runtime-versions)); runtime v1 threads
take none:

```ts
const messages = await client.messaging.listMessages(threadId, {
  runtime_version: '0.8.0',
});
const v1Messages = await client.messaging.listMessages(v1ThreadId); // runtime v1 thread
```

### Welcome message

`getWelcomeMessage` returns the agent's opening message — what to show before the
first user message:

```ts
const { welcome_message } = await client.messaging.getWelcomeMessage();
```

Agents can also carry a **dynamic welcome message** — a template with
`{{placeholder}}` tokens, e.g. `Hi! Interested in {{page-title}}?`. Pass
`placeholders` (a string-to-string map) to resolve it:

```ts
const { welcome_message } = await client.messaging.getWelcomeMessage({
  placeholders: { 'page-title': 'honda civic' },
});
```

One rule decides what you get back: the dynamic template wins when every
`{{token}}` in it receives a non-empty value (extra keys are ignored); otherwise —
no template on the agent, a token left unfilled, or no `placeholders` passed — the
static welcome message is returned instead. You never receive a half-resolved
template, and the response is always the single `welcome_message` field.

> **Upgrade note:** the endpoint behind this method is now `POST
> /welcome-message` (the body carries `placeholders`) — it previously was a GET.
> The method name and response shape are unchanged, but older SDK releases that
> still issue the GET request no longer work: upgrade the package before relying
> on this call.

### Follow-up suggestions

```ts
const { suggestions } = await client.messaging.generateFollowupSuggestions({
  context: { topic: 'order tracking' },
});
```

(With runtime v2 agents, follow-up suggestions also arrive automatically as the
streaming `suggestions` frame — no extra call needed.)

### Messaging methods at a glance

| Method | Description | `runtime_version`? |
| --- | --- | --- |
| `sendMessage(request)` | Send a message and return the reply. | Optional build pin — normally omit |
| `streamMessage({ body })` | Send a message and stream the reply (SSE). | Optional build pin — normally omit |
| `rerun(threadId, request)` | Regenerate one reply onto a new thread. Requires `interaction_id` and `text`. | Optional build pin — normally omit |
| `listMessages(threadId, request?)` | Return the messages in a thread. | **Required for runtime v2 threads** (e.g. `'0.8.0'`) |
| `threadTrace(threadId, request?)` | Reasoning trace per interaction (paginated). | Runtime v1 agents only |
| `interactionTrace(interactionId)` | Reasoning trace for one interaction. | Runtime v1 agents only |
| `getWelcomeMessage(request?)` | Return the agent's welcome message; pass `placeholders` to resolve its dynamic template. | — |
| `generateFollowupSuggestions(request)` | Generate follow-up prompts from a context. | — |
| `connect(args?)` | Open a [WebSocket session](#websocket-sessions-runtime-v1-agents). | Runtime v1 agents only |
| `getContext()` | Resolve the key's agent and organization. | — |

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
in the [Playground](https://apollo.aui.io).

If you connected a specific phone number through the Playground (SMS or
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
  // Id of the specific number you connected in the Playground.
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
  // Same Playground-connected sender id — starts WhatsApp from that number
  sender_id: '67c1a2b3d4e5f67890123456',
  agent_display_name: 'Support', // bound to template variable {{1}}
});
```

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

Versions report the `runtime_version` build their bundle targets (e.g. `0.8.0`) — a
`0.x` build means the agent runs on runtime v2; a `1.x` value or none means runtime
v1.

### Threads

| Method | Description | `runtime_version`? |
| --- | --- | --- |
| `listThreads(request?)` | List threads, newest first. | Set `runtime_version` (e.g. `'0.8.0'`) to list runtime v2 threads |
| `getThread(threadId, request?)` | Fetch one thread. | **Required for runtime v2 threads** (e.g. `'0.8.0'`) |
| `updateThread(threadId, request)` | Update a thread (currently `title`). | **Required for runtime v2 threads** (e.g. `'0.8.0'`) |
| `getThreadMessages(threadId, request?)` | Return the thread's transcript. | **Required for runtime v2 threads** (e.g. `'0.8.0'`) |
| `getThreadTrace(threadId, request?)` | Reasoning trace per interaction (paginated). | Runtime v1 agents only |
| `getInteractionTrace(interactionId)` | Reasoning trace for one interaction. | Runtime v1 agents only |

Reads and renames name the runtime the thread lives on — pass the selector for
runtime v2 threads; runtime v1 threads take no extra fields:

```ts
// Runtime v2 thread — add runtime_version:
const thread = await client.threads.getThread(threadId, { runtime_version: '0.8.0' });
const transcript = await client.threads.getThreadMessages(threadId, {
  runtime_version: '0.8.0',
});
await client.threads.updateThread(threadId, {
  runtime_version: '0.8.0',
  title: 'Renamed conversation',
});

// Runtime v1 thread — nothing extra:
const v1Thread = await client.threads.getThread(v1ThreadId);
await client.threads.updateThread(v1ThreadId, { title: 'Renamed conversation' });
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

**Listing runtime v2 threads** has two extra rules:

- Set `runtime_version` (e.g. `'0.8.0'`) **and** include an `agent_id` or a
  `user_id` filter (runtime v2 listings are always scoped to an agent or an end
  user; an unscoped listing returns 400).
- Only `agent_id`, `user_id`, and `created` (together with `agent_id`) apply to
  runtime v2 listings. The runtime v1–only filters (`project_id`, `external_id`,
  `tool`, `rule`, `param`) and custom sorts return a clear 400 on the runtime v2
  path.

```ts
const page = await client.threads.listThreads({
  runtime_version: '0.8.0',
  agent_id: [agentId],
});
```

Listed threads include a `version_tag` indicating the agent version the thread runs on.

---

## Runtime v1 agents

Apollo agents run on one of two runtime generations. **Runtime v2** is the current
one — everything above describes it. Agents created before **August 1 2026** run on
**runtime v1** (as a rule of thumb), and a handful of things work differently for
them. Two reliable tells, when you'd rather not rely on a date:

| Tell | Runtime v1 | Runtime v2 |
| --- | --- | --- |
| Thread ids the agent produces | 24-character hex (`68f1…`) | UUID (`01a0…-…`) |
| `runtime_version` on the agent's live version | A `1.x` value, or none | A runtime build such as `0.8.0` |

Sending is identical on both runtimes — the same `sendMessage`, `streamMessage`,
`rerun`, and channel calls route automatically. The differences surface in a few
places only:

| Capability | Runtime v1 | Runtime v2 |
| --- | --- | --- |
| Send / stream / rerun / channels | ✅ Same calls | ✅ Same calls |
| Reading threads back (`listMessages`, `threads.*`) | No selector needed | Pass `runtime_version` (e.g. `'0.8.0'`) |
| Live streaming | `streamMessage` (SSE) or a [WebSocket session](#websocket-sessions-runtime-v1-agents) | `streamMessage` (SSE) |
| `suggestions` stream frame | Not emitted — `followup_suggestions` ride on the message | Emitted after the terminal `message` |
| Traces (`threadTrace`, `interactionTrace`) | ✅ | Not yet available |
| `runtime_version` build pin on sends | Ignored | Honored (advanced; normally omit) |
| Thread id format | 24-character hex | UUID |

### WebSocket sessions (runtime v1 agents)

`connect()` opens a bidirectional real-time messaging session. Authentication is
handled for you, and it works in both Node and the browser.

> **Runtime v1 agents only.** Runtime v2 agents don't accept WebSocket sessions — the
> socket replies with an error frame explaining the session is SSE-only. Runtime v2
> agents stream over HTTP with [`streamMessage`](#stream-a-message-sse): the same
> token-by-token reply, one call per turn, resumable with `Last-Event-ID`, and no
> socket to keep alive.

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

Moving from the socket to `streamMessage` is close to one-to-one:

| WebSocket session (runtime v1) | `streamMessage` (runtime v2) |
| --- | --- |
| `client.connect()` then `socket.sendMessage({ type: 'message', agent_id, user_id, text })` | `client.messaging.streamMessage({ body: { user_id, text } })` |
| `socket.on('message', (envelope) => …)`, switch on `envelope.type` | `for await (const event of stream)`, switch on `event.type` |
| `thread` · `event` · `message` · `error` envelopes | The same four types, plus `suggestions` after the terminal `message` |
| `agent_id` required on every frame | Not needed — the agent comes from your key |
| Reconnect, then `socket.sendResume({ type: 'resume', resume_after: lastSeq })` | Call again with `'Last-Event-ID': String(lastSeq)` |
| `socket.close()` | Nothing to close — the stream ends with the turn |

### Traces (runtime v1 agents)

Runtime v1 agents expose the reasoning trace behind every interaction through
`messaging.threadTrace` / `messaging.interactionTrace` (publishable key) and
`threads.getThreadTrace` / `threads.getInteractionTrace` (organization API key).
`threadTrace` and `getThreadTrace` are paginated. Trace support for runtime v2 is
coming; until then these calls apply to runtime v1 agents only.

### Moving an integration to runtime v2

When the agent behind your key moves to runtime v2, sends keep working untouched.
For everything else:

- **Thread reads** — add `runtime_version` (e.g. `'0.8.0'`) to `listMessages`,
  `threads.getThread`, `getThreadMessages`, and `updateThread`; scope `listThreads`
  with `runtime_version` plus `agent_id` or `user_id`.
- **Thread ids** — stop validating them as 24-character hex ids; runtime v2 ids are
  UUIDs.
- **Streaming** — replace `connect()` + `sendMessage` frames with `streamMessage`,
  drop `agent_id` from the request, and resume with `Last-Event-ID` instead of a
  `resume` frame.
- **Follow-up suggestions** — handle the `suggestions` frame
  (`data.followup_suggestions`) instead of reading them off the message.
- **Traces** — guard trace calls until runtime v2 trace support lands.

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
[Threads and runtime versions](#threads-and-runtime-versions).

## TypeScript

The package ships type definitions. Request and response models are available under the
`Apollo` namespace.

```ts
import { Apollo } from '@aui.io/aui-client';

const request: Apollo.SendMessageRequest = {
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
