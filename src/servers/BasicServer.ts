import { Handler } from '../handlers/Handler';
import WebApplication from '../middleware/WebApplication';
import { EventEmitter } from 'events';

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

	constructor(
		handler: T
	) {
		super();
		this.app = handler;
	}

	get state(): ServerState {
		return this._state;
	}

	abstract start(): Promise<ServerState>;

	abstract stop(): Promise<void>;

	protected setState(state: ServerState) {
		this._state = state;
		this.emit('StateChange', state);
	}
}
