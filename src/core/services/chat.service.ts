import { Service } from '../app';
import { websocket } from '../upgrades/websocket.upgrade';
import { log } from '../log';
import WebSocket from 'ws';

export interface ChatServiceProperties {}

class User {
	constructor(readonly id: string, readonly client: WebSocket) {}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function chatService(_props: ChatServiceProperties): Service {
	const users: User[] = [];
	const upgrade = websocket({
		onClose(socketId, code, reason) {
			log.debug(`{${socketId}} connection closed (${code}).${reason ? ` Reason: ${reason}` : ''}`);
			const index = users.findIndex((user) => user.id === socketId);
			if (index >= 0) {
				users.splice(index, 1);
			} else {
				log.warn(`Unregistered user ${socketId} closed connection!`);
			}
		},
		onConnection(client, socketId) {
			log.debug(`{${socketId}} connected`);
			const user = new User(socketId, client);
			users.push(user);
		},
		onError(socketId, err) {
			log.debug(`{${socketId}} errored. ${err && err.message}`);
		},
		onMessage(socketId, data) {
			log.debug(`{${socketId}} says: ${data}`);
			for (let user of users) {
				if (user.id !== socketId) {
					user.client.send(data);
				}
			}
		}
	});
	return {
		upgrade: {
			upgrade
		}
	};
}
