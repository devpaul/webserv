import { ServerResponse, RequestListener } from 'http';
import { Route } from '../interface';

export type ErrorUpgradeHandler = (error: any) => void;
export type ErrorRequestHandler = (error: any, response: ServerResponse) => void;

export function createRequestHandler(route: Route, errorHandler?: ErrorRequestHandler): RequestListener {
	return async (request, response) => {
		try {
			if (await route.test(request, response)) {
				await route.run(request, response);
			}
		} catch (e) {
			if (errorHandler) {
				errorHandler(e, response);
			} else {
				throw e;
			}
		}
	};
}
