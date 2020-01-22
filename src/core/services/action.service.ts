import {
	realtimeUpgrade,
	Connection,
	ConnectionMethods,
	RealtimeUpgradeProperties
} from '../upgrades/realtime.upgrade';
import { Service } from '../app';

export interface Action<T = any> {
	type: string;
	payload: T;
}

export type ActionMiddleware<T extends Action = Action> = (
	data: T,
	con: Connection,
	methods: ConnectionMethods
) => void | Promise<void>;

export interface ActionHandlerDefinition {
	type: string;
	handler: ActionMiddleware<any>;
}

export interface ActionServiceProperties extends Omit<RealtimeUpgradeProperties, 'onMessage'> {
	handlers: ActionHandlerDefinition[];
	defaultHandler?: ActionMiddleware;
}

interface ErrorPayload {
	message: string;
}

function isAction(value: any): value is Action {
	return value && typeof value === 'object' && typeof value.type === 'string';
}

/**
 * Helper function to send an error response to an action request
 */
export function sendError<T extends object, U extends any>(
	con: Connection | Connection[],
	source: Action<T>,
	payload: ErrorPayload & U
) {
	sendResponse(con, {
		type: `${source.type}-error`,
		payload: {
			...payload,
			source
		}
	});
}

/**
 * Helper function to send a serialized action to a connection
 */
export function sendResponse<T extends object>(con: Connection | Connection[], action: Action<T>) {
	const data = JSON.stringify(action);
	if (Array.isArray(con)) {
		for (let connection of con) {
			connection.client.send(data);
		}
	} else {
		con.client.send(data);
	}
}

/**
 * This is a realtime message-passing service using Websockets built on top of realtime.upgrade.
 */
export function actionService({ handlers, defaultHandler, ...rest }: ActionServiceProperties): Service {
	const handlerMap = new Map<string, ActionMiddleware>(handlers.map((handler) => [handler.type, handler.handler]));

	const upgrade = realtimeUpgrade({
		onMessage(data, con, methods) {
			const action = typeof data === 'string' ? JSON.parse(data) : data;
			if (isAction(action)) {
				const handler = handlerMap.get(action.type) || defaultHandler;
				if (handler) {
					handler(action, con, methods);
				}
			}
		},
		...rest
	});

	return {
		upgrade: {
			upgrade
		}
	};
}
