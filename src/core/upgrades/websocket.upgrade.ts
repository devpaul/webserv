import { IncomingMessage } from 'http';
import { v4 as uuid } from 'uuid';
import WebSocket, { Server } from 'ws';
import { UpgradeListener, UpgradeListenerFactory } from '../interface';

export interface WebSocketProperties {
	onConnection?(client: WebSocket, socketId: string, request: IncomingMessage): void;
	onMessage?(socketId: string, message: any): void;
	onClose?(socketId: string, code: number, reason: string): void;
	onError?(socketId: string, error: Error): void;
}

/**
 * This provides a very basic implementation of the WebSocket upgrade process needed
 * to establish a WebSocket connection.
 */
export const websocket: UpgradeListenerFactory<WebSocketProperties> = ({
	onClose,
	onConnection,
	onError,
	onMessage
}) => {
	const ws = new Server({ noServer: true });

	const upgrader: UpgradeListener = async (request, socket, head) => {
		await new Promise((resolve) => {
			const socketId = uuid();

			ws.handleUpgrade(request, socket, head, (client) => {
				onConnection?.(client, socketId, request);
				onMessage && client.on('message', (data) => onMessage(socketId, data));
				onClose && client.on('close', (code, reason) => onClose(socketId, code, reason));
				onError && client.on('error', (err) => onError(socketId, err));
				resolve();
			});
		});
	};

	Object.defineProperties(upgrader, {
		ws: {
			value: ws,
			writable: false
		}
	});

	return upgrader;
};
