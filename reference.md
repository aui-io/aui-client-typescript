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
    is_external_api: true,
    task_id: "task_id",
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
