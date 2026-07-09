# Reference
<details><summary><code>client.<a href="/src/Client.ts">health</a>() -> Record<string, unknown></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.health();

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `ApolloClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## 
## Agents
<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">listAgents</a>(projectId, { ...params }) -> Apollo.ExternalPageExternalAgent</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.listAgents("projectId", {
    filters: {}
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**projectId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.ListAgentsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">createAgent</a>(projectId, { ...params }) -> Apollo.ExternalAgentCreateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.createAgent("projectId", {
    name: "name"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**projectId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.ExternalAgentCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getAgent</a>(agentId) -> Apollo.ExternalAgent</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.getAgent("agentId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">deleteAgent</a>(agentId) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.deleteAgent("agentId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">updateAgent</a>(agentId, { ...params }) -> Apollo.ExternalAgentUpdateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.updateAgent("agentId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.ExternalAgentUpdateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getAgentUsage</a>(agentId, { ...params }) -> Apollo.UsageResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agents.getAgentUsage("agentId", {
    created_from: "2024-01-15T09:30:00Z",
    created_to: "2024-01-15T09:30:00Z"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.GetAgentUsageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Agents.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## AgentVersions
<details><summary><code>client.agentVersions.<a href="/src/api/resources/agentVersions/client/Client.ts">listVersions</a>(agentId, { ...params }) -> Apollo.ExternalPageAgentVersion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agentVersions.listVersions("agentId", {
    filters: {}
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.ListVersionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentVersions.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agentVersions.<a href="/src/api/resources/agentVersions/client/Client.ts">createVersion</a>(agentId, { ...params }) -> Apollo.AgentVersionCreateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agentVersions.createVersion("agentId", {
    source: "version"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.AgentVersionCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentVersions.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agentVersions.<a href="/src/api/resources/agentVersions/client/Client.ts">updateVersion</a>(agentId, versionId, { ...params }) -> Apollo.AgentVersionUpdateResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agentVersions.updateVersion("agentId", "versionId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**versionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.AgentVersionUpdateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentVersions.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agentVersions.<a href="/src/api/resources/agentVersions/client/Client.ts">publishVersion</a>(agentId, versionId) -> Apollo.AgentVersionPublishResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agentVersions.publishVersion("agentId", "versionId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**versionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentVersions.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agentVersions.<a href="/src/api/resources/agentVersions/client/Client.ts">archiveVersion</a>(agentId, versionId) -> Apollo.AgentVersionArchiveResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agentVersions.archiveVersion("agentId", "versionId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**versionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentVersions.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agentVersions.<a href="/src/api/resources/agentVersions/client/Client.ts">pushVersion</a>(agentId, versionId, { ...params }) -> Apollo.AgentVersionPushResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agentVersions.pushVersion("agentId", "versionId", {
    caller: "agent_builder",
    bundle: {
        "key": "value"
    }
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**versionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.AgentVersionPushRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentVersions.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.agentVersions.<a href="/src/api/resources/agentVersions/client/Client.ts">pullVersion</a>(agentId, versionId, { ...params }) -> Apollo.AgentVersionPullResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.agentVersions.pullVersion("agentId", "versionId", {
    version_tag: "version_tag"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**agentId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**versionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.PullVersionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AgentVersions.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Projects
<details><summary><code>client.projects.<a href="/src/api/resources/projects/client/Client.ts">listProjects</a>({ ...params }) -> Apollo.ExternalPageProject</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.projects.listProjects({
    "page[size]": 1,
    "page[after]": "page[after]",
    "page[before]": "page[before]",
    sort_by: "sort_by",
    sort_order: "asc"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Apollo.ListProjectsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Projects.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.projects.<a href="/src/api/resources/projects/client/Client.ts">createProject</a>({ ...params }) -> Apollo.Project</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.projects.createProject({
    name: "name"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Apollo.ProjectCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Projects.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.projects.<a href="/src/api/resources/projects/client/Client.ts">getProject</a>(projectId) -> Apollo.Project</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.projects.getProject("projectId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**projectId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Projects.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.projects.<a href="/src/api/resources/projects/client/Client.ts">deleteProject</a>(projectId) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.projects.deleteProject("projectId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**projectId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Projects.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.projects.<a href="/src/api/resources/projects/client/Client.ts">getProjectUsage</a>(projectId, { ...params }) -> Apollo.UsageResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.projects.getProjectUsage("projectId", {
    created_from: "2024-01-15T09:30:00Z",
    created_to: "2024-01-15T09:30:00Z"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**projectId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.GetProjectUsageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Projects.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Threads
<details><summary><code>client.threads.<a href="/src/api/resources/threads/client/Client.ts">listThreads</a>({ ...params }) -> Apollo.ExternalPageThreadListItem</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.threads.listThreads({
    filters: {}
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Apollo.ListThreadsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Threads.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.threads.<a href="/src/api/resources/threads/client/Client.ts">getThread</a>(threadId) -> Apollo.Thread</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.threads.getThread("threadId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**threadId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Threads.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.threads.<a href="/src/api/resources/threads/client/Client.ts">getThreadTrace</a>(threadId) -> Apollo.Trace[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.threads.getThreadTrace("threadId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**threadId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Threads.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.threads.<a href="/src/api/resources/threads/client/Client.ts">getInteractionTrace</a>(interactionId) -> Apollo.Trace</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.threads.getInteractionTrace("interactionId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**interactionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Threads.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.threads.<a href="/src/api/resources/threads/client/Client.ts">getThreadMessages</a>(threadId) -> Apollo.Message[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.threads.getThreadMessages("threadId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**threadId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Threads.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Messaging
<details><summary><code>client.messaging.<a href="/src/api/resources/messaging/client/Client.ts">sendMessage</a>({ ...params }) -> Apollo.SendMessageResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Send a message; auto-create the thread when ``thread_id`` is omitted. Streams
tokens over SSE when the client sends ``Accept: text/event-stream``. The resolved
thread id is returned in the body (and the ``x-aui-thread-id`` header on SSE).
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.messaging.sendMessage({
    accept: "accept",
    "Last-Event-ID": "Last-Event-ID",
    agent_id: "agent_id",
    text: "text",
    user_id: "user_id"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Apollo.SendMessageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Messaging.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.messaging.<a href="/src/api/resources/messaging/client/Client.ts">rerun</a>(threadId, { ...params }) -> Apollo.SendMessageResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regenerate ``interaction_id`` on the thread against the live version, then
replay ``text`` onto the clone. The acting user is optional — absent for the
agent-scoped publishable-key flow, where IA attributes the thread's own user.
``thread_id`` in the response is the clone's id, not the original.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.messaging.rerun("threadId", {
    agent_id: "agent_id",
    interaction_id: "interaction_id",
    text: "text"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**threadId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.RerunMessageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Messaging.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.messaging.<a href="/src/api/resources/messaging/client/Client.ts">listMessages</a>(threadId) -> Apollo.Message[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The thread transcript, scoped to the key's agent.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.messaging.listMessages("threadId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**threadId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Messaging.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.messaging.<a href="/src/api/resources/messaging/client/Client.ts">threadTrace</a>(threadId) -> Apollo.Trace[]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Every interaction trace in the thread.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.messaging.threadTrace("threadId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**threadId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Messaging.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.messaging.<a href="/src/api/resources/messaging/client/Client.ts">interactionTrace</a>(interactionId) -> Apollo.Trace</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

One interaction's trace, resolved directly by interaction id.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.messaging.interactionTrace("interactionId");

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**interactionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Messaging.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Channels
<details><summary><code>client.channels.<a href="/src/api/resources/channels/client/Client.ts">initiateThread</a>(channel, { ...params }) -> Apollo.InitiateThreadResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Send the opener on ``channel`` and bind the recipient's phone to a thread.
Omit ``thread_id`` to start a new thread (its id is returned); pass it to
continue an existing one. Template fields apply to WhatsApp only.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.channels.initiateThread("channel", {
    phone_number: "phone_number",
    agent_id: "agent_id"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**channel:** `string` — Channel id: 'whatsapp' or 'sms'.
    
</dd>
</dl>

<dl>
<dd>

**request:** `Apollo.InitiateThreadRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Channels.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Auth
<details><summary><code>client.auth.<a href="/src/api/resources/auth/client/Client.ts">issueToken</a>({ ...params }) -> Apollo.TokenResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Exchange a credential for a short-lived access token. Supported grant types: `publishable_key`. Refresh and other grants will be added on the same endpoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.auth.issueToken({
    "grant_type": "publishable_key",
    "publishable_key": "pk_network_..."
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Record<string, unknown>` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Auth.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
