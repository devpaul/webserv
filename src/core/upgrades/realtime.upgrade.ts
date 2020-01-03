import WebSocket = require('ws');
import { UpgradeMiddlewareFactory } from '../interface';
import { log } from '../log';
import { websocket } from './websocket.upgrade';

export interface RealtimeServiceProperties {
	onConnect?: (connection: Connection) => void;
	onDisconnect?: (connection: Connection) => void;
	onError?: (error: Error, connection: Connection | string) => void;
	onMessage?: (data: any, connection: Connection, connections: Iterable<Connection>) => void;
}

export class Connection {
	constructor(readonly id: string, readonly client: WebSocket) {}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const realtimeService: UpgradeMiddlewareFactory<RealtimeServiceProperties> = ({
	onConnect,
	onDisconnect,
	onError,
	onMessage
}) => {
	const connections: Map<string, Connection> = new Map();

	return websocket({
		onClose(socketId, code, reason) {
			log.debug(`{${socketId}} connection closed (${code}).${reason ? ` Reason: ${reason}` : ''}`);
			const con = connections.get(socketId);

			if (con) {
				connections.delete(socketId);
				onDisconnect && onDisconnect(con);
			} else {
				log.warn(`Unregistered user ${socketId} closed connection!`);
			}
		},
		onConnection(client, socketId) {
			log.debug(`{${socketId}} connected`);
			const con = new Connection(socketId, client);
			connections.set(con.id, con);
			onConnect && onConnect(con);
		},
		onError(socketId, err) {
			log.debug(`{${socketId}} errored. ${err && err.message}`);
			const con = connections.get(socketId);
			onError && onError(err, con || socketId);
		},
		onMessage(socketId, data) {
			log.debug(`{${socketId}} says: ${data}`);
			if (onMessage) {
				const con = connections.get(socketId);
				con && onMessage(data, con, connections.values());
			}
		}
	});
};
