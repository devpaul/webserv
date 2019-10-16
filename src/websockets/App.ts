import { websocket } from "../core/upgrades/websocket";
import { Upgrade, upgrade } from "../core/upgrades/upgrade";
import { Guard } from "../core/interface";
import uuid = require("uuid");
import { MessageHandler } from "./messagehandler";
import { MessageDispatcher } from "./messagedispatcher";

export interface Action {
	type: string;
	payload: any;
}

export const enum AppAction {
	Closed = 'closed',
	Connected = 'connected'
}

export default class App {
	readonly guards: Guard[] = [];
	readonly handlers: MessageHandler[] = [];
	readonly dispatchers: MessageDispatcher[] = [];

	constructor(public readonly id: string = uuid.v4()) {}

	create(): Upgrade {
		return upgrade({
			guards: this.guards,
			upgrade: websocket({
				onClose: () => {},
				onConnection: (client, id) => {
					console.log('connected', id);
				},
				onMessage: (id, data) => {
					console.log(`${id} sent`)
				},
				onError: () => {}
			})
		})
	}

	dispatch(action: Action) {

	}

	stop() {

	}
}
