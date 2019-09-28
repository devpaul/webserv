import { MiddlewareFactory } from "../interface";
import { Route } from "../routes/route";

export interface SubrouteProperties {
	routes: Route[];
}

export const subroute: MiddlewareFactory<SubrouteProperties> = ({ routes }) => {
	return async (request, response) => {
		for (let route of routes) {
			if (await route.test(request, response)) {
				return route.run(request, response);
			}
		}
	}
}
