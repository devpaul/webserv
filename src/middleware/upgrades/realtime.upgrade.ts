import { UpgradeListenerFactory } from '../../core/interface';
import { log } from '../../core/log';
import { websocket } from '../upgrades/websocket.upgrade';
import WebSocket = require('ws');

export interface RealtimeUpgradeProperties {
	onInit?: (methods: ConnectionMethods) => void;
	onConnect?: (connection: Connection, methods: ConnectionMethods) => void;
	onDisconnect?: (connection: Connection, methods: ConnectionMethods) => void;
	onError?: (error: Error, connection: Connection | string) => void;
	onMessage?: (data: any, connection: Connection, methods: ConnectionMethods) => void;
}

/**
 * ConnectionMethods give proxied access to the underlying connection map
 */
export interface ConnectionMethods {
	get(socketId: string): Connection | undefined;
	getAll(): Iterable<Connection>;
	getSize(): number;
}

export class Connection {
	constructor(readonly id: string, readonly client: WebSocket) {}
}

/**
 * This extends the functionality of websocket.upgrade to provide more robust connection tracking of
 * WebSocket connections.
 *
 * Connections are given a unique ID that can retrieve the user's WebSocket client via ConnectionMethods
 * or can be used to link internal data (such as user name or other user information) to the connection.
 */
export const realtimeUpgrade: UpgradeListenerFactory<RealtimeUpgradeProperties> = ({
	onInit,
	onConnect,
	onDisconnect,
	onError,
	onMessage
}) => {
	const connections: Map<string, Connection> = new Map();

	const methods: ConnectionMethods = {
		get(socketId) {
			return connections.get(socketId);
		},
		getAll() {
			return connections.values();
		},
		getSize() {
			return connections.size;
		}
	};

	onInit?.(methods);

	return websocket({
		onClose(socketId, code, reason) {
			log.debug(`[WS] {${socketId}} connection closed (${code}).${reason ? ` Reason: ${reason}` : ''}`);
			const con = connections.get(socketId);

			if (con) {
				connections.delete(socketId);
				onDisconnect?.(con, methods);
			} else {
				log.warn(`[WS] Unregistered user ${socketId} closed connection!`);
			}
		},
		onConnection(client, socketId) {
			log.debug(`[WS] {${socketId}} connected`);
			const con = new Connection(socketId, client);
			connections.set(con.id, con);
			onConnect?.(con, methods);
		},
		onError(socketId, err) {
			log.debug(`[WS] {${socketId}} errored. ${err && err.message}`);
			const con = connections.get(socketId);
			onError?.(err, con || socketId);
		},
		onMessage(socketId, data) {
			log.debug(`[WS] {${socketId}} says: ${data}`);
			if (onMessage) {
				const con = connections.get(socketId);
				if (con) {
					onMessage(data, con, methods);
				}
			}
		}
	});
};
