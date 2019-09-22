import { Handler, Upgradable } from '../handlers/Handler';
import { createServer as createHttpServer, IncomingMessage, Server, ServerResponse } from 'http';
import WebApplication from '../middleware/WebApplication';
import { BasicServer, ServerState } from './BasicServer';
import { log } from '../log';
import { Socket } from 'net';
import { ServerType } from '../interface';

export interface HttpConfig {
	port: number;
	upgradeHandler?: Upgradable;
}

export default class HttpServer<T extends Handler = WebApplication> extends BasicServer<T> {
	readonly port: number;

	protected _server: Server;

	protected _upgradeHandler?: Upgradable;

	constructor(
		config: HttpConfig,
		handler: T
	) {
		super(handler);
		this.port = config.port;
		this._upgradeHandler = config.upgradeHandler;
	}

	get type() {
		return ServerType.HTTP;
	}

	async start(): Promise<ServerState> {
		if (this.state === ServerState.NEW) {
			this.setState(ServerState.STARTING);

			const server = this._server = this.createServer();

			server.on('close', () => {
				this._server = null;
				this.setState(ServerState.STOPPED);
			});

			server.on('error', (error: Error) => {
				log.error(`Server error: ${ error }`);
			});

			if (this._upgradeHandler) {
				server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
					this._upgradeHandler.upgrade(request, socket, head);
				});
			}

			await new Promise((resolve) => {
				server.listen(this.port, () => {
					this.setState(ServerState.LISTENING);
					resolve();
				});
			});
		}

		return this.state;
	}

	async stop() {
		super.stop();
		if (this._server) {
			this._server.close();
		}
		this._server = null;
		this.setState(ServerState.STOPPED);
	}

	protected createServer(): Server {
		return createHttpServer((request: IncomingMessage, response: ServerResponse) => {
			this.app.handle(request, response);
		});
	}
}
