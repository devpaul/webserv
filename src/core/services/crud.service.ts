import { Service } from '../app';
import { method } from '../guards/method';
import { HttpError, HttpStatus } from '../HttpError';
import { body } from '../processors/body.processor';
import { jsonTransform } from '../transforms/json.transform';
import { getParams } from '../util/request';
import { pathGuard } from '../guards/path';

export interface CrudServiceProperties {
	path?: string;
	data?: { [key: string]: any };
}

interface Record {
	id: string;
	[key: string]: any;
}

function isRecord(value: any): value is Record {
	return value && typeof value === 'object' && typeof value.id === 'string';
}

export function crudService(props: CrudServiceProperties): Service {
	const { path = '*', data = {} } = props;
	const store: { [key: string]: any } = data;

	return {
		route: {
			guards: [pathGuard({ match: path })],
			before: [body({})],
			transforms: [jsonTransform],
			middleware: [
				{
					guards: [method.get()],
					middleware: () => {
						return store;
					}
				},
				{
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
				{
					guards: [method.get('/id/:id')],
					middleware: (request) => {
						const { params } = getParams(request, 'params');
						if (params.id && store[params.id]) {
							return store[params.id];
						}
						throw new HttpError(HttpStatus.NotFound);
					}
				},
				{
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
				{
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
			]
		}
	};
}
