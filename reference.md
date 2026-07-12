# Reference
<details><summary><code>client.<a href="/src/Client.ts">health</a>() -> Record<string, unknown></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Liveness probe. Returns ``{"status": "ok"}`` when the service is up.
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
<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">listAgents</a>(projectId, { ...params }) -> Apollo.PageAgent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List the project's agents, optionally filtered by name.
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

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">createAgent</a>(projectId, { ...params }) -> Apollo.AgentCreateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create an agent in the project. New agents start without a live version
— create and publish a version to make the agent answer.
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

**request:** `Apollo.AgentCreateRequest` 
    
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

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">getAgent</a>(agentId) -> Apollo.Agent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetch one agent, including which version is currently live.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete an agent and all of its versions. This cannot be undone.
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

<details><summary><code>client.agents.<a href="/src/api/resources/agents/client/Client.ts">updateAgent</a>(agentId, { ...params }) -> Apollo.AgentUpdateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Rename an agent. To change which version is live, publish a version
instead.
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

**request:** `Apollo.AgentUpdateRequest` 
    
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Usage metrics for one agent, optionally bounded by a date range.
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
<details><summary><code>client.agentVersions.<a href="/src/api/resources/agentVersions/client/Client.ts">listVersions</a>(agentId, { ...params }) -> Apollo.PageAgentVersion</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List an agent's versions, newest first. Filter by status, tag, label,
or version number; set ``exclude_revisions`` to see only base versions.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new draft version — empty, from a template, or cloned from an
existing version (``source`` selects which). Drafts stay editable until
published.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a version's metadata: label, tags, and notes. The configuration
itself changes through push, never here.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Make this version the agent's live version. Publishing a draft freezes
it first; publishing an already-published version re-activates it — the
same call handles shipping, switching, and rolling back.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Archive a version to retire it from everyday use. The agent's live
version can't be archived — publish another version first.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Upload a configuration bundle to a version, committing a new revision.
The response carries the new revision's tag and content digest.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Download a version's configuration bundle — the current revision, or a
specific one via ``version_tag``.
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
<details><summary><code>client.projects.<a href="/src/api/resources/projects/client/Client.ts">listProjects</a>({ ...params }) -> Apollo.PageProject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List your organization's projects.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a project in your organization. Projects group agents.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetch one project.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a project. It disappears from listings immediately.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Usage metrics aggregated across every agent in the project, optionally
bounded by a date range.
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
<details><summary><code>client.threads.<a href="/src/api/resources/threads/client/Client.ts">listThreads</a>({ ...params }) -> Apollo.PageThreadListItem</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List your organization's conversation threads, newest first. Repeatable
filters (``tool``, ``rule``, ``param``, ``created``) OR within a field and
AND across fields.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Fetch one thread's details — title, participants, and status.
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

<details><summary><code>client.threads.<a href="/src/api/resources/threads/client/Client.ts">updateThread</a>(threadId, { ...params }) -> Apollo.Thread</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Partial update — only ``title`` is updatable for now. Omitted fields are
left unchanged; the full updated thread is returned.
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
await client.threads.updateThread("threadId");

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

**request:** `Apollo.UpdateThreadRequest` 
    
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The reasoning trace of every interaction in the thread — what the agent
understood, which rules fired, and the decisions it took.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The reasoning trace of a single interaction, resolved by its id.
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

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The thread's full transcript, in chronological order.
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

Send a message; auto-create the thread when ``thread_id`` is omitted. For a live
token stream use ``POST /messages/stream`` (SSE). The resolved thread id is
returned in the body.
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

<details><summary><code>client.messaging.<a href="/src/api/resources/messaging/client/Client.ts">streamMessage</a>({ ...params }) -> core.Stream<Apollo.StreamMessageResponse></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Send a message and stream the reply token-by-token over Server-Sent
Events. The thread is created automatically when ``thread_id`` is omitted —
the resolved id arrives as the first ``thread`` event. Resume a dropped
stream with the standard ``Last-Event-ID`` header: missed events replay
without running the turn again.
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
const response = await client.messaging.streamMessage({
    "Last-Event-ID": "Last-Event-ID",
    body: {
        text: "text",
        user_id: "user_id"
    }
});
for await (const item of response) {
    console.log(item);
}

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

**request:** `Apollo.StreamMessageRequest` 
    
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

Regenerate ``interaction_id`` on the thread against the agent's live
version, then replay ``text`` onto the resulting new thread. The response's
``thread_id`` is the new thread's id, not the original.
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

The thread's full transcript, in chronological order.
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

The reasoning trace of a single interaction, resolved by its id.
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

<details><summary><code>client.messaging.<a href="/src/api/resources/messaging/client/Client.ts">generateFollowupSuggestions</a>({ ...params }) -> Apollo.GenerateFollowupSuggestionsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generate suggested follow-up prompts from a context you provide —
useful for offering the end user quick next questions.
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
await client.messaging.generateFollowupSuggestions();

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

**request:** `Apollo.GenerateFollowupSuggestionsRequest` 
    
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

<details><summary><code>client.messaging.<a href="/src/api/resources/messaging/client/Client.ts">getWelcomeMessage</a>() -> Apollo.AgentVersionWelcomeMessageResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The welcome message of the agent's live version — what to show before
the first user message.
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
await client.messaging.getWelcomeMessage();

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

Send the opening message on ``channel`` and bind the recipient's phone
number to a conversation thread. The agent is identified by your access
token. Omit ``thread_id`` to start a new thread (its id is returned); pass
it to continue an existing one. Template fields apply to WhatsApp only.
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
    phone_number: "phone_number"
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

Exchange a credential for a short-lived access token (OAuth 2.0, RFC 6749). Supported grant types: `publishable_key`. Refresh and other grants will be added on the same endpoint.
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
