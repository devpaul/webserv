import { Service } from '../app';
import { method } from '../guards/method';
import { HttpError, HttpStatus } from '../HttpError';
import { body } from '../processors/body.processor';
import { jsonTransform } from '../transforms/json.transform';
import { getParams } from '../util/request';
import { pathGuard } from '../guards/path';
import { RouteDescriptor } from '../interface';

export interface CrudServiceProperties {
	path?: string;
	data?: { [key: string]: any };
	operations?: Operation[];
}

export type Operation = 'list' | 'create' | 'get' | 'delete' | 'put';

interface Record {
	id: string;
	[key: string]: any;
}

function isRecord(value: any): value is Record {
	return value && typeof value === 'object' && typeof value.id === 'string';
}

export function crudService(props: CrudServiceProperties): Service {
	const { path = '*', data = {}, operations = ['list', 'create', 'get', 'delete', 'put'] } = props;
	const store: { [key: string]: any } = data;
	const middlewares: { [P in Operation]: RouteDescriptor } = {
		list: {
			guards: [method.get()],
			middleware: () => {
				return store;
			}
		},
		create: {
			guards: [method.post()],
			middleware: (request) => {
				const { body } = getParams(request, 'body');
				if (isRecord(body)) {
					store[body.id] = body;
				} else {
					throw new HttpError(HttpStatus.BadRequest);
				}
			}
		},
		get: {
			guards: [method.get('/id/:id')],
			middleware: (request) => {
				const { params } = getParams(request, 'params');
				if (params.id && store[params.id]) {
					return store[params.id];
				}
				throw new HttpError(HttpStatus.NotFound);
			}
		},
		delete: {
			guards: [method.delete('/id/:id')],
			middleware: (request) => {
				const { params } = getParams(request, 'params');
				if (params.id && store[params.id]) {
					const record = store[params.id];
					delete store[params.id];
					return record;
				}
				throw new HttpError(HttpStatus.NotFound);
			}
		},
		put: {
			guards: [method.put()],
			middleware: (request) => {
				const { body } = getParams(request, 'body');
				if (isRecord(body)) {
					store[body.id] = {
						...store[body.id],
						...body
					};
					return store[body.id];
				}
				throw new HttpError(HttpStatus.NotFound);
			}
		}
	};

	return {
		route: {
			guards: [pathGuard({ match: path })],
			before: [body({})],
			transforms: [jsonTransform],
			middleware: operations.map((op) => {
				return middlewares[op as Operation];
			})
		}
	};
}
