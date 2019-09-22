import { Handler } from '../handlers/Handler';
import WebApplication from '../middleware/WebApplication';
import { EventEmitter } from 'events';
import { log } from '../log';

export enum ServerState {
	LISTENING = 'listening',
	NEW = 'new',
	STARTING = 'starting',
	STOPPED = 'stopped'
}

export abstract class BasicServer<T extends Handler = WebApplication> extends EventEmitter {
	readonly app: T;

	abstract port: number;

	abstract type: string;

	protected _state: ServerState = ServerState.NEW;

	private handles: { remove(): void }[] = [];

	constructor(handler: T) {
		super();
		this.app = handler;
		this.addListeners();
	}

	get state(): ServerState {
		return this._state;
	}

	abstract start(): Promise<ServerState>;

	async stop(): Promise<void> {
		while (this.handles.length) {
			const handle = this.handles.pop();
			handle.remove();
		}
	}

	protected addListeners() {
		(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((signal) => {
			const handler = () => {
				this.onSignal('SIGINT');
			};
			this.handles.push({
				remove() {
					process.removeListener(signal, handler);
				}
			});
			process.on(signal, handler);
		});
	}

	protected setState(state: ServerState) {
		this._state = state;
		this.emit('StateChange', state);
	}

	protected onSignal(signal: string) {
		log.info(`received ${signal} signal. Stopping server on ${this.port}.`);
		this.stop();
	}
}
