# Upgrades

A http client requests an upgrade to establish bi-directional socket communication. This is the mechanism that websockets use to create a real-time connection through the http protocol.

webserv supports websocket communication through [upgrades](https://github.com/devpaul/webserv/tree/master/src/core/upgrades).

```ts
export type UpgradeListener = (request: IncomingMessage, socket: Socket, head: Buffer) => void | Promise<void>;
```

The `UpgradeListener` takes an incoming request and gains access to the raw socket used for communicating with the client.

## WebSockets & The Action Service

The action service is webserv's built-in support for creating a WebSocket protocol.

The Action service connects realtime requests from the client to `ActionMiddleware` that handles these request.

```ts
export interface ActionHandlerDefinition {
	type: string;
	handler: ActionMiddleware<any>;
}
```

The system expects the browser to send JSON with a `type` string and additional data for the request. The request is then routed to the appropriate `ActionMiddleware` to create and send a response.
