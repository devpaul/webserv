import { RequestListener } from 'http';

import { Route } from './routes/route';

export function createRequestHandler(route: Route): RequestListener {
	return (request, response) => {
		if (route.test(request, response)) {
			route.run(request, response);
		}
	}
}
