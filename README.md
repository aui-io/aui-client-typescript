# @aui.io/aui-client

[![npm version](https://img.shields.io/npm/v/@aui.io/aui-client)](https://www.npmjs.com/package/@aui.io/aui-client)
[![docs](https://img.shields.io/badge/docs-docs.aui.io-7c6cf6)](https://docs.aui.io/sdk/overview)

Official TypeScript/JavaScript SDK for the AUI Apollo API. Provides REST access to
messaging, projects, agents, threads, and reasoning traces, real-time reply streaming
over Server-Sent Events, and a WebSocket feed that pushes a conversation's new
messages as they arrive. Agents on runtime v1 additionally accept turns over a
WebSocket session — see [Runtime v1 agents](#runtime-v1-agents).

> **Full documentation:** this README is the quick reference. The complete guides,
> the API reference (every endpoint, request and response field), and the changelog
> live at **[docs.aui.io](https://docs.aui.io)** — start with the
> [SDK overview](https://docs.aui.io/sdk/overview), then
> [Messaging](https://docs.aui.io/sdk/messaging),
> [Management](https://docs.aui.io/sdk/management),
> [Traces](https://docs.aui.io/api/messaging/traces),
> [Best practices](https://docs.aui.io/sdk/best-practices), and the
> [Changelog](https://docs.aui.io/changelog).

## Installation

```bash
npm install @aui.io/aui-client
```

Requires Node.js 18 or later — or a modern browser, for the messaging client.

## Clients

The package exposes two clients, one per credential. Import and use the one that
matches your environment.

| Client | Credential | Browser | Purpose |
| --- | --- | --- | --- |
| `ApolloMessagingClient` | Publishable key (`pk_network_...`) | Yes | End-user messaging, streaming, file attachments, live conversation updates, traces, and channels |
| `ApolloManagementClient` | Organization API key | No — server only | Managing projects, agents, versions, threads, traces, and usage |

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

The trace endpoints are the exception: they take no selector — the thread id's shape
already says which runtime the thread lives on. See [Traces](#traces).

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
  // include_trace: true,  // also return the reasoning trace as message.trace_info — see Traces
});

console.log(response.thread_id);
console.log(response.message.text);
```

You can pass optional per-message values for the agent's configured context
variables as `agent_variables` — a flat object of key/value pairs, whose keys are the
context variables the agent's program declares (see
[Agent variables](https://docs.aui.io/api/messaging/send-messages#agent-variables)):

```ts
const response = await client.messaging.sendMessage({
  user_id: 'end-user-123',
  text: 'Where is my order?',
  agent_variables: {
    customer_name: 'Ada',
    order_id: 'ORD-1042',
  },
});
```

`streamMessage` takes them the same way, inside `body`. The reply does not carry them
back — keep your own copy if you need to match a reply to the context it ran with.

### Attach files

Attach a file in three steps: create an upload, `PUT` the file's bytes to it, then
pass the upload's `file_url` in the message's `file_urls`.

```ts
const file = fileInput.files[0]; // a File in the browser; a Buffer or Uint8Array works in Node

// 1. Declare the file: its name, with extension, and its exact size in bytes.
const upload = await client.messaging.createUpload({
  filename: file.name,
  size: file.size,
});

// 2. PUT exactly those bytes, with every header the upload returned.
const put = await fetch(upload.upload_url, {
  method: 'PUT',
  headers: upload.headers,
  body: file,
});
if (!put.ok) throw new Error(`Upload failed with status ${put.status}`);

// 3. Attach it to a message.
const response = await client.messaging.sendMessage({
  user_id: 'end-user-123',
  text: 'What does this invoice say?',
  file_urls: [upload.file_url],
});
```

- **One upload per file.** `filename` must end in one of `png`, `jpg`, `jpeg`, `gif`,
  `webp`, `pdf`, `docx`, `xlsx`, `pptx`, `csv`, `txt`, `md`, or `json`. `size` is at
  most 20 MB, and the upload accepts only a body of exactly that size. The file is
  stored under a cleaned name, returned as `upload.file_name`.
- **Links expire after 15 minutes.** Until then, `file_url` also reads the file back —
  for a preview, say. Attaching it to a message still works after the link expires.
- **Up to 10 files per message.** An `image_url` counts toward the same limit.
  `streamMessage` takes `file_urls` the same way; `rerun` and WebSocket sessions don't
  take files.
- **Retention.** An upload that no message attaches is deleted after 1 day. The first
  message that attaches it keeps it for 30 days, and it can be attached again during
  that time.
- **Runtime v2 agents read files.** A [runtime v1 agent](#runtime-v1-agents) refuses a
  send that carries files.

> **New in 3.4.1.**

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
    // include_trace: true,  // the terminal message frame then carries data.trace_info
  },
});

let reply = '';
let cards: Apollo.MessageCard[] = [];
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
    case 'cards':
      // Optional (runtime v2 agents): the turn's cards so far, ahead of the reply.
      // Each frame carries the complete list and replaces the previous one.
      cards = event.data.cards ?? [];
      break;
    case 'message':
      // Terminal frame: the completed reply (authoritative text and cards) and —
      // with include_trace — the reasoning trace as data.trace_info.
      reply = event.data?.text ?? reply;
      cards = event.data?.cards ?? [];
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

**Live cards.** Runtime v2 agents can emit `cards` frames while the turn runs, so
you can show cards before the reply is complete. Each frame carries the turn's
complete card list so far and replaces the previous one. The terminal `message`
frame's `cards` replace them all, and an empty `cards` frame before an `error` or the
end of the stream withdraws them. The frame is optional — a turn without cards emits
none — and runtime v1 agents never emit it. New in 3.4.2.

### Rerun an interaction

`rerun` regenerates one agent reply. Both `interaction_id` (the agent message's id
from the transcript) and `text` are required. The regenerated turn lands on a **new
thread** — read the response's `thread_id`:

```ts
const rerun = await client.messaging.rerun(threadId, {
  interaction_id: agentMessageId,
  text: 'Where is my order?',
  // include_trace: true,  // the regenerated reply then carries message.trace_info
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

Transcripts never carry traces — use the trace calls below for history.

### Traces

Every interaction produces a **trace** — a structured record of the agent's reasoning
for that turn: what it understood, which sources it relied on, what it decided. The
shape follows the runtime the agent runs on, and every trace carries a `runtime`
field that says which one you got:

| `trace.runtime` | Agents | Shape |
| --- | --- | --- |
| `"v2"` | Agents on the current runtime | The runtime's own turn trace, as typed sections named in your program's vocabulary: `understood`, `learned`, `sources`, `passages_used`, `citations_used`, `decided`, `checks`, `did`, `refused_by`, `answer`, `narrative` |
| `"v1"` | [Runtime v1 agents](#runtime-v1-agents) | The typed runtime v1 trace: `input`, `understanding`, `decisions`, `computed_parameters`, `rules_evaluations`, `response` |

> **New in 3.4.0:** traces for every agent (previously runtime v1 agents only),
> `include_trace` on sends, and `Trace` as a discriminated union. No other method
> changed.

Read `trace.runtime` first — `Apollo.Trace` is a discriminated union, so the branch
narrows the type:

```ts
const trace = await client.messaging.interactionTrace(interactionId, { thread_id });

if (trace.runtime === 'v2') {
  trace.citations_used;   // the passages the reply provably cited — what to show as "sources"
  trace.did;              // the capabilities the turn carried out
  trace.narrative;        // the turn in plain sentences
} else {
  trace.decisions;        // runtime v1 agents: the typed decision list
}
```

**Two endpoints, one rule.** `threadTrace(threadId)` returns every interaction's trace
in the thread, oldest first and paginated; `interactionTrace(interactionId, { thread_id })`
returns one. A runtime v2 interaction is identified by its thread *and* its id, so
`thread_id` is **required for runtime v2 agents** — without it the API answers a
`400` (`Apollo.BadRequestError`) that says so. Runtime v1 interactions are read by
their id alone; a `thread_id` passed anyway is ignored. Neither endpoint takes
`runtime_version` — the thread id's shape decides. Keep the thread id next to
the interaction id when you store `message.id`.

```ts
// Every interaction in the thread, paginated:
let cursor: string | undefined;
do {
  const page = await client.messaging.threadTrace(threadId, {
    'page[size]': 20,
    'page[after]': cursor,
  });
  page.results.forEach((trace) => console.log(trace.runtime));
  cursor = page.meta.has_more ? page.meta.after_cursor : undefined;
} while (cursor);
```

**With the reply, in one request.** Set `include_trace: true` on `sendMessage`,
`streamMessage`, or `rerun` and the reply carries the same object as
`message.trace_info` — no second request. On a stream it rides the terminal `message`
frame. It is off by default (a trace can be large), and `trace_info` is `null` when
not requested:

```ts
const { message } = await client.messaging.sendMessage({
  user_id: 'end-user-123',
  text: 'Which plan covers dental?',
  include_trace: true,
});
message.trace_info; // Apollo.Trace — runtime "v1" or "v2"
```

**Showing sources to end users.** For runtime v2 agents, render `citations_used`
(the passages the reply provably cites — each names its `document` and `section`),
falling back to `passages_used`. `sources[].evidence` is everything retrieval
returned, selected or not — useful for debugging, not for the end user.

```ts
const trace = message.trace_info;
const cited = trace?.runtime === 'v2' ? (trace.citations_used ?? []) : [];
const sources = trace?.runtime === 'v2'
  ? (cited.length ? cited : (trace.passages_used ?? []))
  : [];
sources.map((p) => `${p.document}${p.section ? ` — ${p.section}` : ''}`);
```

Traces are scoped to the agent behind your key — a thread of another agent answers
`404` (`Apollo.NotFoundError`). The full field reference for both shapes is at
[docs.aui.io/api/messaging/traces](https://docs.aui.io/api/messaging/traces).

### Watch a conversation live

A reply to a send is not the only message a conversation receives. A person on your
team can answer in it (see [Human handover](#human-handover)), and the agent can
speak again on its own — after an outside approval, for example. To show those
messages as they arrive, open a WebSocket with `connect()` and **watch** the
conversation: every message it saves is then pushed to you.

Watching is receive-only, and it follows conversations of runtime v2 agents. Keep
sending turns with `sendMessage` or `streamMessage`.

```ts
const socket = await client.connect();

const messages = new Map<string, Apollo.Message>(); // on screen, by id, in order
let lastSequence: number | undefined;

async function loadTranscript(threadId: string) {
  const transcript = await client.messaging.listMessages(threadId, {
    runtime_version: '0.8.0',
  });
  // Keep anything the feed delivered while the transcript was being read.
  const newer = [...messages.values()].filter((m) => !transcript.some((t) => t.id === m.id));
  messages.clear();
  for (const message of [...transcript, ...newer]) messages.set(message.id, message);
  render([...messages.values()]);
}

// Runs on the first connection and again after every automatic reconnect.
socket.on('open', () => {
  lastSequence = undefined;
  socket.sendWatch({ type: 'watch', thread_id: threadId });
});

socket.on('message', (frame) => {
  if (frame.type === 'watching') {
    void loadTranscript(frame.thread_id); // the watch is in place: read the transcript
    return;
  }
  if (frame.type === 'error') {
    console.error(frame.data); // the watch was refused — see the codes below
    return;
  }
  if (!('sequence' in frame)) return; // not a watched turn

  // frame.type is 'message' (a message to show) or 'silent' (a turn with nothing to show).
  if (lastSequence !== undefined && frame.sequence > lastSequence + 1) {
    void loadTranscript(frame.thread_id); // a number was skipped: a turn was missed
  } else if (frame.type === 'message' && !messages.has(frame.data.id)) {
    messages.set(frame.data.id, frame.data); // show each id once
    render([...messages.values()]);
  }
  lastSequence = Math.max(lastSequence ?? 0, frame.sequence);
});
```

| Frame `type` | Meaning | Carries |
| --- | --- | --- |
| `watching` | The answer to `watch`: the conversation's turns are pushed from now on. | `thread_id` |
| `message` | A message the end user is shown — a reply, an answer from a person on your team, the agent speaking after an outside approval. | `thread_id`, `sequence`, and `data`: an `Apollo.Message`, the same object `sendMessage` returns |
| `silent` | A turn with nothing to show — the conversation returned to the agent, say. `data.text` is `null`, and `data.disposition` says what happened. | `thread_id`, `sequence`, `data` |
| `error` | The watch was refused. The socket stays open. | `data.error`, `data.code`, `data.error_code` |

The rules to follow:

- **Wait for `watching`, then read the transcript.** The feed carries what the
  conversation saves from then on, not its history.
- **Show each `data.id` once.** The reply to your own `sendMessage` or `streamMessage`
  is pushed too, and a message can be pushed again after a reconnect.
- **Show what the end user typed yourself.** A frame carries the turn's outcome, not
  the end user's message that started it. A transcript read returns both.
- **Keep `sequence` order.** `sequence` numbers the conversation's turns in the order
  they were saved. A frame that skips a number means a turn was missed: read the
  transcript again.
- **After a reconnect, watch again and read the transcript again.** The socket
  reconnects on its own (30 attempts by default), so sending `watch` from the `open`
  handler covers it.
- **One conversation per socket.** A new `watch` replaces the socket's previous one.

A refused watch says why in `data.code`: `400` for a thread of a runtime v1 agent,
`404` for a thread that is not your agent's, `429` when too many sessions already
watch the conversation (try again shortly), and `503` when live events are not
available — with `error_code: 'messaging.watch_retry'`, send `watch` again shortly.
The socket closes with `1013` when the server could not keep the watch whole: let it
reconnect, then watch and read the transcript again. `1008` is an authentication
failure and `1011` a server error.

> **New in 3.4.2.** Existing TypeScript socket handlers may need a small change — see
> [Upgrading to 3.4.2](#upgrading-to-342).

### Human handover

An agent can hand a conversation to a person on your team. While the person holds
it, the end user's messages go to that person instead of the agent, and the person's
answers arrive in the same conversation. `message.disposition` says what happened to
each message of such a conversation. It is `null` on every other message.

Two cases matter in a chat UI:

```ts
// 1. A send while a person holds the conversation: the agent does not answer.
const { message } = await client.messaging.sendMessage({ user_id, thread_id, text });
if (message.disposition?.kind === 'passed_on' && message.disposition.to === 'human') {
  // message.text is null: there is no reply to render. The person's answer
  // arrives later — watch the conversation to receive it.
}

// 2. A message a person on your team wrote — pushed on the watch feed, and in
//    the transcript afterwards.
if (pushed.sender?.type === 'human') {
  showFromPerson(pushed.sender.name, pushed.text); // sender.name: the name to show
}
```

`sender.name` is set only when `sender.type` is `human`. The `disposition` fields:

| Field | Values | Meaning |
| --- | --- | --- |
| `kind` | `passed_on` · `authority` · `refused` | `passed_on`: the message went between the end user and the person. `authority`: who answers the conversation changed. `refused`: your team asked for a change the conversation does not allow. |
| `to` | `human` | The end user's message went to the person, and the agent did not answer it. |
| `from` | `human` | The person wrote this message. |
| `human` | `{ id, name }` | The person who wrote the message, or who took the conversation over, returned it, or stopped the agent. |
| `holder` | `human` · `apollo` · `human_for_good` | Who answers the conversation now: the person the agent handed it to, the agent, or the person for good. |
| `by` | `apollo` · `client` | Who moved it: the agent, handing the conversation to the person, or your team. |
| `via` | `help_desk` · `playground` | Where the person who moved it works from. |
| `asked` | `pass_on` · `take_over` · `return` · `pull_out` | On a refusal: what your team asked for. |
| `reason` | `apollo_holds_authority` · `apollo_pulled_out` · `newer_end_user_message` · `held_by_another` | On a refusal: why. |
| `held_by` | `{ id, name, via, since }` | On a `held_by_another` refusal: the person who holds the conversation. |

Only `kind` is always present, and every value is typed as a plain `string` — compare
against the values above and keep a default branch. Transcripts (`listMessages`,
`threads.getThreadMessages`) carry the same `disposition` and `sender.name`, so a
conversation renders the same way live and on reload.

Your team's side — the person's messages, taking a conversation over, returning it to
the agent — is sent from your backend, not through this SDK: `POST
/messaging/v1/events` with a `handover` body and your agent API key. See
[Events](https://docs.aui.io/api/messaging/events#human-handover).

> **New in 3.4.2.** Human handover applies to runtime v2 agents.

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
| `sendMessage(request)` | Send a message and return the reply. Set `include_trace` to get the trace with it. | Optional build pin — normally omit |
| `streamMessage({ body })` | Send a message and stream the reply (SSE). `include_trace` applies to the terminal frame. | Optional build pin — normally omit |
| `createUpload(request)` | Get a link to upload one file to, then attach it to a message with `file_urls`. | — |
| `rerun(threadId, request)` | Regenerate one reply onto a new thread. Requires `interaction_id` and `text`; accepts `include_trace`. | Optional build pin — normally omit |
| `listMessages(threadId, request?)` | Return the messages in a thread. | **Required for runtime v2 threads** (e.g. `'0.8.0'`) |
| `threadTrace(threadId, request?)` | Reasoning trace per interaction (paginated); `trace.runtime` says which shape. | — (both runtimes; the thread id decides) |
| `interactionTrace(interactionId, request?)` | Reasoning trace for one interaction; pass `{ thread_id }` for runtime v2 agents. | — (both runtimes) |
| `getWelcomeMessage(request?)` | Return the agent's welcome message; pass `placeholders` to resolve its dynamic template. | — |
| `generateFollowupSuggestions(request)` | Generate follow-up prompts from a context. | — |
| `connect(args?)` | Open a WebSocket: [watch a conversation](#watch-a-conversation-live) (runtime v2 agents), or run a [session](#websocket-sessions-runtime-v1-agents) (runtime v1 agents). | — |
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
  organizationApiKey: process.env.AUI_ORG_API_KEY!,
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
| `getProjectUsage(projectId, request?)` | Usage metrics aggregated across the project (optional `created_from` / `created_to` window). |

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
| `getAgentUsage(agentId, request?)` | Usage metrics for one agent (optional `created_from` / `created_to` window). |

```ts
const page = await client.agents.listAgents(projectId, {});
const filtered = await client.agents.listAgents(projectId, { name: 'support' });
const agent = await client.agents.createAgent(projectId, { name: 'Support bot' });
const usage = await client.agents.getAgentUsage(agent.id);
```

Both usage calls return an `Apollo.UsageResponse`: `interaction_count`,
`input_tokens`, `output_tokens`, `cache_read_tokens`, `cache_write_tokens`,
`reasoning_tokens`, `incomplete_usage_calls`, and `total_tokens`.
`cache_write_tokens` is the part of `input_tokens` that was written to the cache —
not an addition to it — and `incomplete_usage_calls` counts the model calls whose
token usage was reported incompletely. Both fields are new in 3.4.2.

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
| `getThreadTrace(threadId, request?)` | Reasoning trace per interaction (paginated); `trace.runtime` says which shape. | — (both runtimes; the thread id decides) |
| `getInteractionTrace(interactionId, request?)` | Reasoning trace for one interaction; pass `{ thread_id }` for runtime v2 threads. | — (both runtimes) |

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

The trace methods are the management twins of the messaging ones — same shapes,
same `thread_id` rule (see [Traces](#traces)), authenticated with the organization
API key:

```ts
const page = await client.threads.getThreadTrace(threadId, { 'page[size]': 20 });
const trace = await client.threads.getInteractionTrace(interactionId, { thread_id: threadId });
if (trace.runtime === 'v2') trace.citations_used;
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
| `cards` stream frame | Not emitted — cards ride on the message | Emitted ahead of the terminal `message` |
| File attachments (`createUpload`, `file_urls`) | A send with files is refused | ✅ |
| Watching a conversation (`sendWatch`) | Refused with code `400` — replies stream on the session as each turn runs | ✅ |
| Human handover (`message.disposition`, `sender.name`) | — | ✅ |
| Traces (`threadTrace`, `interactionTrace`) | ✅ — the typed runtime v1 trace, `runtime: "v1"`; read by the interaction id alone | ✅ — the runtime's own turn trace, `runtime: "v2"`; `interactionTrace` also takes `{ thread_id }` |
| `runtime_version` build pin on sends | Ignored | Honored (advanced; normally omit) |
| Thread id format | 24-character hex | UUID |

### WebSocket sessions (runtime v1 agents)

`connect()` opens a bidirectional real-time messaging session. Authentication is
handled for you, and it works in both Node and the browser.

> **Runtime v1 agents only.** Runtime v2 agents don't run turns over the socket — a
> `message` frame is answered with an `error` frame explaining the agent is SSE-only.
> Runtime v2 agents stream over HTTP with [`streamMessage`](#stream-a-message-sse):
> the same token-by-token reply, one call per turn, resumable with `Last-Event-ID`.
> They use the socket for one thing only: to
> [watch a conversation](#watch-a-conversation-live).

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
`error`, `close`), `sendMessage(request)`, `sendResume(request)`, `sendWatch(request)`,
and `close()`.
Note that `on()` registers a single handler per event; calling it again for the same
event replaces the previous handler. The socket type is exported as `SessionSocket`.
The terminal `message` envelope embeds the turn's trace as `data.trace_info`
(sessions are opened with `include_trace=true` by default) — the same
`Apollo.Trace` object as the trace calls, with `runtime: "v1"`.

Session envelopes (`thread`, `event`, `message`, `error`) carry a `seq` — the cursor
for `sendResume`. The frames of a [watched conversation](#watch-a-conversation-live)
arrive on the same handler and carry a `sequence` instead, so narrow before you read
`seq`:

```ts
let lastSeq = -1;

socket.on('message', (envelope) => {
  if ('seq' in envelope && envelope.seq > 0) lastSeq = envelope.seq; // session envelopes only
  if (envelope.type === 'message') console.log(envelope.data.text);
});

// After a reconnect, replay what you missed instead of re-running the turn:
socket.sendResume({ type: 'resume', resume_after: lastSeq });
```

Moving from the socket to `streamMessage` is close to one-to-one:

| WebSocket session (runtime v1) | `streamMessage` (runtime v2) |
| --- | --- |
| `client.connect()` then `socket.sendMessage({ type: 'message', agent_id, user_id, text })` | `client.messaging.streamMessage({ body: { user_id, text } })` |
| `socket.on('message', (envelope) => …)`, switch on `envelope.type` | `for await (const event of stream)`, switch on `event.type` |
| `thread` · `event` · `message` · `error` envelopes | The same four types, plus `cards` before and `suggestions` after the terminal `message` |
| `agent_id` required on every frame | Not needed — the agent comes from your key |
| Reconnect, then `socket.sendResume({ type: 'resume', resume_after: lastSeq })` | Call again with `'Last-Event-ID': String(lastSeq)` |
| `socket.close()` | Nothing to close — the stream ends with the turn |

### Traces on runtime v1 agents

The same calls apply — `messaging.threadTrace` / `messaging.interactionTrace`
(publishable key) and `threads.getThreadTrace` / `threads.getInteractionTrace`
(organization API key), and `include_trace` on sends — with two differences: the
trace is the typed runtime v1 record (`runtime: "v1"`: `input`, `understanding`,
`decisions`, `computed_parameters`, `rules_evaluations`, `response`), and an
interaction is read by its id alone (`interactionTrace(interactionId)` — a
`thread_id` passed anyway is ignored). See [Traces](#traces).

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
- **Live cards** — optionally handle the `cards` frame to show cards before the
  reply completes; the terminal `message` still carries the final list.
- **Traces** — branch on `trace.runtime` (`"v1"` keeps today's fields; `"v2"` is the
  runtime's own turn trace), and pass `{ thread_id }` to `interactionTrace` /
  `getInteractionTrace` for runtime v2 interactions.

---

## Pagination

List endpoints — including thread traces — return `{ results, meta }`. Use
`meta.has_more` to detect further pages and pass `meta.after_cursor` as
`page[after]` to fetch the next one.

## Timeouts

There is no client-wide timeout. Set `timeoutInSeconds` per call when needed:

```ts
await client.threads.listThreads({}, { timeoutInSeconds: 120 });
```

## Error handling

`ApolloError` and `ApolloTimeoutError` are exported at the top level. Per-status errors
are available under the `Apollo` namespace: `BadRequestError` (400),
`UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404),
`ConflictError` (409), `ContentTooLargeError` (413), `UnprocessableEntityError` (422),
`InternalServerError` (500), and `ServiceUnavailableError` (503). Any other status
arrives as a plain `ApolloError` — read its `statusCode`.

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

Every error body is the API's envelope — `{ error: { code, message, request_id } }`
— so `error.body.error.message` says what went wrong. Two common ones to know:

- A **404 when reading a thread** usually means the `runtime_version` selector didn't
  match where the thread lives — see
  [Threads and runtime versions](#threads-and-runtime-versions).
- A **400 on `interactionTrace` / `getInteractionTrace`** for a runtime v2 agent means
  `thread_id` is missing — see [Traces](#traces).

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

Traces are typed per runtime: `Apollo.Trace` is the union of `Apollo.Trace.V1`
(`Apollo.RuntimeV1Trace` with `runtime: "v1"`) and `Apollo.Trace.V2`
(`Apollo.RuntimeV2Trace` with `runtime: "v2"`), narrowed by checking `runtime`; the
runtime v2 sections are typed as well (`Apollo.RuntimeTraceFact`,
`Apollo.RuntimeTracePassage`, and the item types under `Apollo.RuntimeV2Trace`).
`Apollo.Message.trace_info` and `Apollo.PageTrace` (`{ results, meta, links }`) use
the same types.

### Upgrading to 3.4.2

3.4.2 only adds to the SDK, and nothing changes at runtime. Three compile-time changes
can surface in existing TypeScript code:

- **Socket frames.** `socket.on('message', …)` now also receives the frames of a
  [watched conversation](#watch-a-conversation-live): `watching`, and `message` /
  `silent` frames that carry `sequence` instead of `seq`. Reading `frame.seq` without
  narrowing no longer compiles — guard it with `'seq' in frame`.
- **Exhaustive switches.** A `switch` with a `never` check on a socket frame's `type`
  needs the new `watching` and `silent` cases; one on a stream event's `type` needs
  `cards`.
- **Envelopes.** `type` and `data` are now required on `ThreadEnvelope`,
  `MessageEnvelope`, `EventEnvelope`, and `ErrorEnvelope`. Code that reads them keeps
  compiling; code that builds one by hand — a test fixture, say — must set both.

## Resources

- Documentation: [docs.aui.io](https://docs.aui.io) — [SDK guide](https://docs.aui.io/sdk/overview) · [API reference](https://docs.aui.io/api/overview) · [Traces](https://docs.aui.io/api/messaging/traces) · [Changelog](https://docs.aui.io/changelog)
- npm: [@aui.io/aui-client](https://www.npmjs.com/package/@aui.io/aui-client)
- GitHub: [aui-io/aui-client-typescript](https://github.com/aui-io/aui-client-typescript)
- Issues: [GitHub Issues](https://github.com/aui-io/aui-client-typescript/issues)

## License

Proprietary. Unauthorized copying or distribution is prohibited.
