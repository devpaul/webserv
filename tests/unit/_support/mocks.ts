import { ServerResponse } from 'http';
import * as sinon from 'sinon';
import { Handler } from 'src/handlers/Handler';
import { IncomingMessage } from 'http';

export function createMockMiddleware(): Handler {
	const middleware: Handler = <Handler> {
		handle: sinon.spy(function () {
			return Promise.resolve();
		})
	};
	return <Handler> middleware;
}

export function createMockResponse(): ServerResponse {
	const response = {
		finished: true,
		end: sinon.spy(function (_message: string, cb: Function) {
			cb();
		})
	};
	return <any> response;
}

export function createMockRequest(): IncomingMessage {
	const request = { };

	return <any> request;
}
