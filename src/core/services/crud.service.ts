import { Service } from '../app';
import { method } from '../guards/method';
import { pathGuard } from '../guards/path';
import { HttpError, HttpStatus } from '../HttpError';
import { RouteDescriptor, RouteProperties } from '../interface';
import { body } from '../processors/before/body.processor';
import { jsonTransform } from '../transforms/json.transform';
import { getParams } from '../util/request';

export interface CrudServiceProperties extends RouteProperties {
	data?: Record[];
	operations?: Operation[];
	dataLoader?: DataLoader;
}

export interface Record {
	id: string;
	[key: string]: any;
}

export interface DataLoader {
	(id: string): Promise<Record> | Record | undefined;
	(): Promise<Record[]> | Record[];
}

export type Operation = 'list' | 'create' | 'read' | 'update' | 'delete';

export function isRecord(value: any): value is Record {
	return value && typeof value === 'object' && typeof value.id === 'string';
}

const DELETED = Symbol();

function defaultLoader(id: string): Promise<Record> | Record | undefined;
function defaultLoader(): Promise<Record[]> | Record[];
function defaultLoader(id?: string): Promise<Record> | Record | Promise<Record[]> | Record[] | undefined {
	if (id) {
		return undefined;
	}
	return [] as Record[];
}

/**
 * The CRUD service provides basic in-memory Create Read Update Delete and List support on a record
 * centered around the provided path.
 *
 * - supported operations may be defined in properties
 * - a set of records may be provided to initialize the store
 * - a loader function can be used to load in records from another source (e.g. disk)
 *
 * List: GET {path}/
 * Returns a list of all records
 *
 * Create: POST {path}/
 * Create a new record to be stored in-memory
 *
 * Read: GET {path}/{id}
 * Returns a record if found; or returns a 404 status
 *
 * Update: PUT {path}/
 * Updates a record if found; or returns a 404 status
 *
 * Delete: DELETE {path}/{id}
 * Deletes a record from the in-memory store
 */
export function crudService(props: CrudServiceProperties): Service {
	const {
		route = '/',
		data = [],
		operations = ['list', 'create', 'read', 'update', 'delete'],
		dataLoader = defaultLoader
	} = props;
	const expandedRoute = route.charAt(route.length - 1) === '*' ? route : `${route}*`;
	const store: Map<string, Record | Symbol> = new Map(data.map((data) => [data.id, data]));
	const getRecord = (id: string) => (store.has(id) ? store.get(id) : dataLoader(id));
	const middlewares: { [P in Operation]: RouteDescriptor } = {
		create: {
			guards: [method.post()],
			middleware: (request) => {
				const { body } = getParams(request, 'body');
				if (isRecord(body)) {
					store.set(body.id, body);
				} else {
					throw new HttpError(HttpStatus.BadRequest);
				}
			}
		},
		read: {
			guards: [method.get('/:id')],
			middleware: async (request) => {
				const { params } = getParams(request, 'params');
				if (params.id) {
					const record = await getRecord(params.id);
					if (isRecord(record)) {
						store.set(record.id, record);
						return record;
					}
				}
				throw new HttpError(HttpStatus.NotFound);
			}
		},
		delete: {
			guards: [method.delete('/:id')],
			middleware: async (request) => {
				const { params } = getParams(request, 'params');
				if (params.id) {
					const record = await getRecord(params.id);
					if (isRecord(record)) {
						store.set(record.id, DELETED);
						return record;
					}
				}
				throw new HttpError(HttpStatus.NotFound);
			}
		},
		update: {
			guards: [method.put()],
			middleware: async (request) => {
				const { body } = getParams(request, 'body');
				if (isRecord(body)) {
					const record = await getRecord(body.id);
					if (isRecord(record)) {
						store.set(body.id, {
							...record,
							...body
						});
						return store.get(body.id);
					}
				}
				throw new HttpError(HttpStatus.NotFound);
			}
		},
		list: {
			guards: [method.get('/')],
			middleware: async () => {
				const fileData = await dataLoader();
				return [...fileData.filter((record) => !store.has(record.id)), ...store.values()].filter(isRecord);
			}
		}
	};

	return {
		route: {
			guards: [pathGuard({ match: expandedRoute })],
			before: [body({})],
			transforms: [jsonTransform],
			middleware: Object.entries(middlewares)
				.filter(([op]) => operations.includes(op as any))
				.map(([, desc]) => desc)
		}
	};
}
