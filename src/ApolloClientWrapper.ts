import { WebSocket as NodeWebSocket } from "ws";
import { ApolloClient as _GeneratedClient } from "./Client.js";
import { ApolloEnvironment } from "./environments.js";
import type { ApolloEnvironmentUrls } from "./environments.js";
import * as core from "./core/index.js";
import { SessionSocket } from "./api/resources/session/client/Socket.js";
import type { Session } from "./api/resources/session/client/Client.js";

// A publishable key is exchanged (POST /management/v1/auth/token) for a short-lived
// bearer token; every request then sends Authorization: Bearer <token>.
const TOKEN_EXCHANGE_PATH = "/management/v1/auth/token";
// Re-exchange this many ms before the token expires.
const REFRESH_SKEW_MS = 60_000;
// Messaging WebSocket channel path (relative to the environment's WS base).
const SESSION_WS_PATH = "/messaging/v1/session";
// The v2 messaging server negotiates this subprotocol on the WS upgrade; the
// connection is rejected without it. Fern emits protocols: [], so we set it here.
const WS_SUBPROTOCOL = "aui-websocket";

/** Publishable-key family, inferred from the key prefix. */
export type PublishableKeyType = "agent" | "org" | "unknown";

interface TokenCache {
    token: string;
    expiresAt: number;
    agentId?: string;
    organizationId?: string;
}

// Publishable-key exchange + token caching. Kept as a standalone object so the header
// suppliers can close over it — a subclass may not touch `this` before super() runs.
class Auth {
    readonly pk?: string;
    readonly keyType: PublishableKeyType;
    private readonly _staticToken?: string;
    private readonly _baseUrl: string;
    private _cache?: TokenCache;
    private _inflight?: Promise<string>;

    constructor(baseUrl: string, publishableKey?: string, organizationApiKey?: string) {
        this.pk = publishableKey;
        this.keyType = detectKeyType(publishableKey);
        this._staticToken = organizationApiKey;
        this._baseUrl = baseUrl;
    }

    get hasCredential(): boolean {
        return Boolean(this.pk || this._staticToken);
    }

    get agentId(): string | undefined {
        return this._cache?.agentId;
    }

    get organizationId(): string | undefined {
        return this._cache?.organizationId;
    }

    async getContext(): Promise<{ agentId?: string; organizationId?: string; keyType: PublishableKeyType }> {
        if (this.pk) await this.getToken();
        return { agentId: this._cache?.agentId, organizationId: this._cache?.organizationId, keyType: this.keyType };
    }

    async getToken(): Promise<string> {
        if (this._staticToken) return this._staticToken;
        if (!this.pk) return "";
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

export declare namespace ApolloClient {
    export interface Options {
        /** Deployment environment. Defaults to ApolloEnvironment.Gcp. */
        environment?: ApolloEnvironmentUrls;
        /** Publishable key (pk_network_ or pk_org_); exchanged for a bearer token. */
        publishableKey?: string;
        /** Organization API key; used directly as the bearer token. */
        organizationApiKey?: string;
    }

    export interface ConnectArgs extends Session.ConnectArgs {}
}

/**
 * ApolloClient adds authentication on top of the generated client: it takes a
 * publishable key (or organization API key) and handles the token exchange/refresh
 * transparently. Every generated resource (agents, threads, messaging, …) is
 * inherited unchanged.
 */
export class ApolloClient extends _GeneratedClient {
    private readonly _tokenAuth: Auth;
    private readonly _env: ApolloEnvironmentUrls;

    constructor(options: ApolloClient.Options = {}) {
        const env = options.environment ?? ApolloEnvironment.Gcp;
        const auth = new Auth(env.base, options.publishableKey, options.organizationApiKey);
        super({
            environment: env,
            headers: {
                ...(auth.hasCredential ? { Authorization: async () => `Bearer ${await auth.getToken()}` } : {}),
            },
        });
        this._tokenAuth = auth;
        this._env = env;
    }

    /** Publishable-key family (agent / org / unknown). */
    get keyType(): PublishableKeyType {
        return this._tokenAuth.keyType;
    }

    /** Agent resolved from an agent-scoped key. Populated after the first exchange. */
    get agentId(): string | undefined {
        return this._tokenAuth.agentId;
    }

    /** Organization the key belongs to. Populated after the first exchange. */
    get organizationId(): string | undefined {
        return this._tokenAuth.organizationId;
    }

    /** Force a token exchange (if needed) and return the resolved scope. */
    getContext(): Promise<{ agentId?: string; organizationId?: string; keyType: PublishableKeyType }> {
        return this._tokenAuth.getContext();
    }

    /**
     * Open a messaging WebSocket session. The bearer token is resolved and sent as
     * Authorization on the upgrade, and the required `aui-websocket` subprotocol is
     * negotiated. Built here (rather than via the generated session resource) so the
     * generated code stays vanilla — Fern emits protocols: [] and forwards only
     * per-call headers, neither of which the v2 server accepts.
     */
    async connect(args: ApolloClient.ConnectArgs = {}): Promise<SessionSocket> {
        const token = await this._tokenAuth.getToken();
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...args.headers };
        const socket = new core.ReconnectingWebSocket({
            url: core.url.join(this._env.production, SESSION_WS_PATH),
            protocols: [WS_SUBPROTOCOL],
            queryParameters: {},
            headers,
            options: {
                debug: args.debug ?? false,
                maxRetries: args.reconnectAttempts ?? 30,
                // On Node 22+ the global (undici) WebSocket drops custom headers on the
                // upgrade, so the bearer token never arrives. Force the `ws` library on
                // Node; browsers fall back to the native global WebSocket.
                WebSocket: core.RUNTIME.type === "node" ? NodeWebSocket : undefined,
            },
        });
        return new SessionSocket({ socket });
    }
}

function detectKeyType(publishableKey?: string): PublishableKeyType {
    if (!publishableKey) return "unknown";
    if (publishableKey.startsWith("pk_network_")) return "agent";
    if (publishableKey.startsWith("pk_org_")) return "org";
    return "unknown";
}
