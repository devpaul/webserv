import { GuardFactory, HttpMethod } from '../interface';
import { every } from './logic';
import { pathGuard } from './path';

export interface MethodGuardProperties {
	method: HttpMethod;
}

export const methodGuard: GuardFactory<MethodGuardProperties> = ({ method }) => {
	return (request) => {
		return request.method.toLowerCase() === method;
	};
};

const routeGuard = (method: HttpMethod) => {
	return (path: string = '/') => {
		if (path) {
			return every({ guards: [methodGuard({ method }), pathGuard({ match: path })] });
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
