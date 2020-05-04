import { GuardFactory, HttpMethod } from '../../core/interface';
import { every } from './logic';
import { pathGuard, PathGuardProperties } from './path';

export interface MethodGuardProperties {
	method: HttpMethod;
}

export const methodGuard: GuardFactory<MethodGuardProperties> = ({ method }) => {
	return (request) => {
		return request.method.toLowerCase() === method;
	};
};

const routeGuard = (method: HttpMethod) => {
	return (route?: PathGuardProperties['match']) => {
		if (route) {
			return every({ guards: [methodGuard({ method }), pathGuard({ match: route })] });
		}
		return methodGuard({ method });
	};
};

export const method = {
	get: routeGuard('get'),
	post: routeGuard('post'),
	put: routeGuard('put'),
	delete: routeGuard('delete')
};
