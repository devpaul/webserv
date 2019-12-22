import { HttpError, HttpStatus } from '../HttpError';
import { MiddlewareFactory, Route } from '../interface';

export interface SubrouteProperties {
	routes: Route[];
}

export const subroute: MiddlewareFactory<SubrouteProperties> = ({ routes }) => {
	return async (request, response) => {
		for (let route of routes) {
			if (await route.test(request, response)) {
				return await route.run(request, response);
			}
		}
		throw new HttpError(HttpStatus.NotFound);
	};
};
