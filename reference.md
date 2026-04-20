# Reference
## ControllerApi
<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">listUserTasks</a>({ ...params }) -> Apollo.ListTasksResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.controllerApi.listUserTasks({
    user_id: "user_id",
    page: 1,
    size: 1
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

**request:** `Apollo.ListUserTasksRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">createTask</a>({ ...params }) -> Apollo.CreateTaskResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.controllerApi.createTask({
    user_id: "user_id",
    task_origin_type: "stores"
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

**request:** `Apollo.CreateTaskRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">getTask</a>(taskId) -> Apollo.CreateTaskResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.controllerApi.getTask("task_id");

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

**taskId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">getTaskMessages</a>(taskId) -> Apollo.Message[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.controllerApi.getTaskMessages("task_id");

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

**taskId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">sendMessage</a>({ ...params }) -> Apollo.Message</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.controllerApi.sendMessage({
    include_trace_info: true,
    is_external_api: true,
    task_id: "task_id"
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

**request:** `Apollo.SubmitMessageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">getProductMetadata</a>({ ...params }) -> Record<string, unknown></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.controllerApi.getProductMetadata({
    link: "link"
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

**request:** `Apollo.GetProductMetadataRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">getAgentContext</a>({ ...params }) -> Apollo.CreateTopicRequestBody</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.controllerApi.getAgentContext({
    "key": "value"
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

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">getDirectFollowupSuggestions</a>({ ...params }) -> Apollo.DirectFollowupSuggestionsResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.controllerApi.getDirectFollowupSuggestions();

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

**request:** `Apollo.DirectFollowupSuggestionsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">getTraceInfo</a>(taskId, messageId) -> Record<string, unknown></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.controllerApi.getTraceInfo("task_id", "message_id");

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

**taskId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**messageId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">startTextConversation</a>({ ...params }) -> Apollo.TextConversationInitiateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Start a text conversation (WhatsApp or SMS).

Creates a task and then proxies to third-party-auth(BE) service to send the initial message.
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
await client.controllerApi.startTextConversation({
    phoneNumber: "phoneNumber",
    channel: "channel"
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

**request:** `Apollo.TextConversationInitiateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.controllerApi.<a href="/src/api/resources/controllerApi/client/Client.ts">renderWidget</a>({ ...params }) -> Apollo.WidgetRenderResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Render a widget card from integration data. Authenticates via network API key.
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
await client.controllerApi.renderWidget({
    task_id: "task_id",
    integration_code: "integration_code",
    card_template_code: "card_template_code",
    variables: {
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

**request:** `Apollo.ExternalWidgetRenderRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ControllerApi.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
