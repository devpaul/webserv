import { log } from '../log';
import { IncomingMessage } from 'http';
import { Socket, Server } from 'net';

export interface ServerConfig<T extends Server = Server> {
	port: number;
	createServer(): Promise<T>;
	onUpgrade?(request: IncomingMessage, socket: Socket, head: Buffer): void;
	onError?(error: Error): void;
}

export async function startServer<T extends Server = Server>(config: ServerConfig<T>) {
	const server = await config.createServer();
	const handles: { remove(): void }[] = [];
	const stop = async () => {
		server.close();
		for (let handle of handles) {
			handle.remove();
		}
	};
	const closed = new Promise((resolve) => {
		server.on('close', () => {
			resolve();
		});
	});

	server.on('error', config.onError || ((error: Error) => {
		log.error(`Server error: ${error}`);
	}));

	if (config.onUpgrade) {
		server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
			config.onUpgrade(request, socket, head);
		});
	}

	for (let signal of ['SIGINT', 'SIGTERM'] as NodeJS.Signals[]) {
		const handler = () => {
			log.info(`received ${signal} signal. Stopping server on ${config.port}.`);
			stop();
		};
		handles.push({
			remove() {
				process.removeListener(signal, handler);
			}
		});
		process.on(signal, handler);
	}

	return new Promise((resolve) => {
		server.listen(config.port, () => {
			resolve({
				closed,
				addListener: (event: string, listener: () => void) => {
					server.addListener(event, listener);
				},
				stop
			});
		});
	});
}
