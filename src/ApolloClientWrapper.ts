import { WebSocket as NodeWebSocket } from "ws";
import { ApolloClient as _GeneratedClient } from "./Client.js";
import { ApolloEnvironment } from "./environments.js";
import type { ApolloEnvironmentUrls } from "./environments.js";
import * as core from "./core/index.js";
import { SessionSocket } from "./api/resources/session/client/Socket.js";
import type { Session } from "./api/resources/session/client/Client.js";
import type { Messaging } from "./api/resources/messaging/client/Client.js";
import type { Channels } from "./api/resources/channels/client/Client.js";
import type { Projects } from "./api/resources/projects/client/Client.js";
import type { Agents } from "./api/resources/agents/client/Client.js";
import type { AgentVersions } from "./api/resources/agentVersions/client/Client.js";
import type { Threads } from "./api/resources/threads/client/Client.js";

const TOKEN_EXCHANGE_PATH = "/management/v1/auth/token";
const REFRESH_SKEW_MS = 60_000;
const SESSION_WS_PATH = "/messaging/v1/session";
const WS_SUBPROTOCOL = "aui-websocket";
const ORG_API_KEY_HEADER = "x-organization-api-key";

// Strip Fern's telemetry headers (null deletes them); they trip browser CORS preflight.
const STRIPPED_SDK_HEADERS: Record<string, null> = {
    "X-Fern-Language": null,
    "X-Fern-SDK-Name": null,
    "X-Fern-SDK-Version": null,
    "X-Fern-Runtime": null,
    "X-Fern-Runtime-Version": null,
};

/** Publishable-key family, inferred from the key prefix. */
export type PublishableKeyType = "agent" | "org" | "unknown";

// Header value: literal, async supplier (bearer token), or null to strip.
type AuthHeaders = Record<string, string | (() => Promise<string>) | null>;

interface TokenCache {
    token: string;
    expiresAt: number;
    agentId?: string;
    organizationId?: string;
}

// Publishable-key exchange + token cache.
class PkAuth {
    readonly pk: string;
    readonly keyType: PublishableKeyType;
    private readonly _baseUrl: string;
    private _cache?: TokenCache;
    private _inflight?: Promise<string>;

    constructor(baseUrl: string, publishableKey: string) {
        this.pk = publishableKey;
        this.keyType = detectKeyType(publishableKey);
        this._baseUrl = baseUrl;
    }

    get agentId(): string | undefined {
        return this._cache?.agentId;
    }

    get organizationId(): string | undefined {
        return this._cache?.organizationId;
    }

    async getContext(): Promise<{ agentId?: string; organizationId?: string; keyType: PublishableKeyType }> {
        await this.getToken();
        return { agentId: this._cache?.agentId, organizationId: this._cache?.organizationId, keyType: this.keyType };
    }

    async getToken(): Promise<string> {
        if (this._cache?.token && Date.now() < this._cache.expiresAt - REFRESH_SKEW_MS) {
            return this._cache.token;
        }
        this._inflight ??= this._exchange().finally(() => {
            this._inflight = undefined;
        });
        return this._inflight;
    }

    private async _exchange(): Promise<string> {
        const res = await fetch(`${this._baseUrl}${TOKEN_EXCHANGE_PATH}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grant_type: "publishable_key", publishable_key: this.pk }),
        });

        if (!res.ok) {
            let reason = String(res.status);
            try {
                reason = ((await res.json()) as { error_description?: string })?.error_description ?? reason;
            } catch {
                /* non-JSON error body */
            }
            throw new Error(`Publishable key exchange failed (${res.status}): ${reason}`);
        }

        const { access_token, expires_in, agent_id, organization_id } = (await res.json()) as {
            access_token: string;
            expires_in: number;
            agent_id?: string | null;
            organization_id?: string | null;
        };
        this._cache = {
            token: access_token,
            expiresAt: Date.now() + expires_in * 1000,
            agentId: agent_id ?? undefined,
            organizationId: organization_id ?? undefined,
        };
        return access_token;
    }
}

// Shared base: wraps the generated client, strips telemetry headers, defaults the
// environment, and lets each client expose only its own audience's resources. Not exported.
class BaseApolloClient {
    protected readonly _client: _GeneratedClient;
    protected readonly _env: ApolloEnvironmentUrls;

    constructor(env: ApolloEnvironmentUrls, authHeaders: AuthHeaders) {
        // `organizationApiKey` is typed as required by Fern but we authenticate via
        // headers, so cast to the generated options shape.
        this._client = new _GeneratedClient({
            environment: env,
            headers: { ...STRIPPED_SDK_HEADERS, ...authHeaders },
        } as ConstructorParameters<typeof _GeneratedClient>[0]);
        this._env = env;
    }
}

export declare namespace ApolloMessagingClient {
    export interface Options {
        /** Publishable key (pk_network_ / pk_org_). */
        publishableKey: string;
        /** Internal: override the API host. Defaults to production. */
        baseUrl?: string;
    }

    export interface ConnectArgs extends Session.ConnectArgs {}
}

/**
 * Publishable-key client for end-user / widget messaging (browser-safe).
 * Exposes the `messaging` audience only.
 */
export class ApolloMessagingClient extends BaseApolloClient {
    private readonly _pkAuth: PkAuth;

    constructor(options: ApolloMessagingClient.Options) {
        if (!options?.publishableKey) {
            throw new Error("ApolloMessagingClient requires a publishableKey.");
        }
        const env = resolveEnv(options.baseUrl);
        const auth = new PkAuth(env.base, options.publishableKey);
        super(env, { Authorization: async () => `Bearer ${await auth.getToken()}` });
        this._pkAuth = auth;
    }

    /** Send / stream messages and read thread & interaction traces. */
    get messaging(): Messaging {
        return this._client.messaging;
    }

    /** Initiate channel-scoped threads (e.g. SMS). */
    get channels(): Channels {
        return this._client.channels;
    }

    /** Publishable-key family (agent / org / unknown). */
    get keyType(): PublishableKeyType {
        return this._pkAuth.keyType;
    }

    /** Agent resolved from an agent-scoped key. Populated after the first exchange. */
    get agentId(): string | undefined {
        return this._pkAuth.agentId;
    }

    /** Organization the key belongs to. Populated after the first exchange. */
    get organizationId(): string | undefined {
        return this._pkAuth.organizationId;
    }

    /** Force a token exchange (if needed) and return the resolved scope. */
    getContext(): Promise<{ agentId?: string; organizationId?: string; keyType: PublishableKeyType }> {
        return this._pkAuth.getContext();
    }

    /** Open a messaging WebSocket session. */
    async connect(args: ApolloMessagingClient.ConnectArgs = {}): Promise<SessionSocket> {
        const token = await this._pkAuth.getToken();
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...args.headers };
        const socket = new core.ReconnectingWebSocket({
            url: core.url.join(this._env.production, SESSION_WS_PATH),
            // Token as the first subprotocol is how the gateway reads auth (browsers can't
            // set upgrade headers); `aui-websocket` must follow.
            protocols: token ? [token, WS_SUBPROTOCOL] : [WS_SUBPROTOCOL],
            queryParameters: {},
            headers,
            options: {
                debug: args.debug ?? false,
                maxRetries: args.reconnectAttempts ?? 30,
                // Node's global WebSocket drops upgrade headers; force the `ws` library there.
                WebSocket: core.RUNTIME.type === "node" ? NodeWebSocket : undefined,
            },
        });
        return new SessionSocket({ socket });
    }
}

export declare namespace ApolloManagementClient {
    export interface Options {
        /** Organization API key. Server-side only. */
        organizationApiKey: string;
        /** Internal: override the API host. Defaults to production. */
        baseUrl?: string;
    }
}

/**
 * Organization-API-key client for backend services and CI (server-side only).
 * Exposes the `management` audience only.
 */
export class ApolloManagementClient extends BaseApolloClient {
    constructor(options: ApolloManagementClient.Options) {
        if (!options?.organizationApiKey) {
            throw new Error("ApolloManagementClient requires an organizationApiKey.");
        }
        const env = resolveEnv(options.baseUrl);
        super(env, { [ORG_API_KEY_HEADER]: options.organizationApiKey });
    }

    /** Projects: listing, retrieval, and usage. */
    get projects(): Projects {
        return this._client.projects;
    }

    /** Agents: listing, retrieval, and usage. */
    get agents(): Agents {
        return this._client.agents;
    }

    /** Agent versions. */
    get agentVersions(): AgentVersions {
        return this._client.agentVersions;
    }

    /** Threads: listing, retrieval, updates, and traces. */
    get threads(): Threads {
        return this._client.threads;
    }
}

// Build the REST + WS URLs from an optional host override, deriving ws(s):// from http(s)://.
function resolveEnv(baseUrl?: string): ApolloEnvironmentUrls {
    if (!baseUrl) return ApolloEnvironment.Gcp;
    const base = baseUrl.replace(/\/+$/, "");
    return { base, production: base.replace(/^http/i, "ws") };
}

function detectKeyType(publishableKey?: string): PublishableKeyType {
    if (!publishableKey) return "unknown";
    if (publishableKey.startsWith("pk_network_")) return "agent";
    if (publishableKey.startsWith("pk_org_")) return "org";
    return "unknown";
}
