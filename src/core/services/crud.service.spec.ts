/// <reference types="intern" />

import { IncomingMessage } from 'http';
import { eventuallyRejects } from '../../_support/assertions';
import { describeSuite } from '../../_support/describeSuite';
import { setupSinon } from '../../_support/mocks';
import { mockResponse } from '../../_support/mocks/mockResponse';
import { Service } from '../app';
import { HttpStatus } from '../HttpError';
import { route } from '../route';
import { crudService, CrudServiceProperties, Record } from './crud.service';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

const data = [
	{ id: 'one', value: 1 },
	{ id: 'two', value: 2 }
];
const loaded = [{ id: 'three', value: 3 }];

function createCrudService(config: Omit<CrudServiceProperties, 'path'>) {
	const service = crudService({
		route: '*',
		...config
	});
	assert.isDefined(service.route);
	return service;
}

describeSuite(() => {
	const sinon = setupSinon();

	function serviceFetch(service: Service, request: IncomingMessage) {
		const middleware = route(service.route);
		const response = mockResponse(sinon) as any;
		return middleware.run(
			{
				url: '/',
				...request
			} as IncomingMessage,
			response
		);
	}

	function fetchList(service: Service) {
		const request = {
			method: 'GET'
		} as IncomingMessage;
		return serviceFetch(service, request);
	}

	function fetchDelete(service: Service, id: string) {
		const request = {
			method: 'DELETE',
			url: `/${id}`
		} as IncomingMessage;
		return serviceFetch(service, request);
	}

	function fetchCreate(service: Service, record: Record) {
		const request = {
			method: 'POST',
			body: record
		} as any;
		return serviceFetch(service, request);
	}

	function fetchRead(service: Service, id: string) {
		const request = {
			method: 'GET',
			url: `/${id}`
		} as IncomingMessage;
		return serviceFetch(service, request);
	}

	function fetchUpdate(service: Service, record: Record) {
		const request = {
			method: 'PUT',
			body: record
		} as any;
		return serviceFetch(service, request);
	}

	describe('list', () => {
		it('returns an empty list when there are no records', async () => {
			const service = createCrudService({});
			const result = await fetchList(service);

			assert.deepEqual(result, []);
		});

		it('returns a list of in-memory records', async () => {
			const service = createCrudService({
				data
			});
			const result = await fetchList(service);

			assert.deepEqual(result, data);
		});

		it('returns a list of merged in-memory and fetched records', async () => {
			const service = createCrudService({
				data,
				dataLoader() {
					return loaded as any;
				}
			});
			const result = await fetchList(service);

			assert.deepEqual(result, [...loaded, ...data]);
		});

		it('displays in-memory records over fetched records', async () => {
			const overwritten = [{ id: 'one', value: 'this should be overwritten by local data' }];
			const service = createCrudService({
				data,
				dataLoader() {
					return [...loaded, ...overwritten] as any;
				}
			});
			const result = await fetchList(service);

			assert.deepEqual(result, [...loaded, ...data]);
		});

		it('asynchronously fetches records', async () => {
			const service = createCrudService({
				dataLoader() {
					return Promise.resolve(data) as any;
				}
			});
			const result = await fetchList(service);

			assert.deepEqual(result, data);
		});

		it('hides deleted records from the list', async () => {
			const service = createCrudService({
				data
			});
			await fetchDelete(service, 'one');
			const result = await fetchList(service);

			assert.deepEqual(
				result,
				data.filter((record) => record.id !== 'one')
			);
		});
	});

	describe('create', () => {
		it('creates a new record', async () => {
			const service = createCrudService({});
			await fetchCreate(service, data[0]);

			assert.deepEqual(await fetchList(service), [data[0]]);
		});

		it(`throws a bad request HttpError when body isn't a record`, async () => {
			const service = createCrudService({});

			const error = await eventuallyRejects(fetchCreate(service, 'not a record' as any));

			assert.strictEqual(error.statusCode, HttpStatus.BadRequest);
		});
	});

	describe('read', () => {
		it('reads an in-memory record', async () => {
			const service = createCrudService({ data });

			const result = await fetchRead(service, 'one');

			assert.strictEqual(result, data[0]);
		});

		it('reads a fetched record', async () => {
			const service = createCrudService({
				dataLoader: () => loaded[0] as any
			});

			const result = await fetchRead(service, 'three');

			assert.deepEqual(result, loaded[0]);
		});

		it('reads an asyncronously fetched record', async () => {
			const service = createCrudService({
				dataLoader: () => Promise.resolve(loaded[0] as any)
			});

			const result = await fetchRead(service, 'three');

			assert.deepEqual(result, loaded[0]);
		});

		it('returns a not found status when there is no record', async () => {
			const service = createCrudService({});

			const error = await eventuallyRejects(fetchRead(service, 'none'));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});

		it('returns a not found status when the record has been deleted', async () => {
			const service = createCrudService({ data });

			await fetchDelete(service, data[0].id);
			const error = await eventuallyRejects(fetchRead(service, data[0].id));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});
	});

	describe('update', () => {
		it('updates an in-memory record', async () => {
			const service = createCrudService({ data });

			const result = await fetchUpdate(service, { id: 'one', newValue: 'tacos' });

			assert.deepEqual({ ...data[0], newValue: 'tacos' }, result);
		});

		it('updates a fetched record', async () => {
			const service = createCrudService({
				dataLoader: () => loaded[0] as any
			});

			const result = await fetchUpdate(service, { id: 'three', newValue: 'tacos' });

			assert.deepEqual({ ...loaded[0], newValue: 'tacos' }, result);
		});

		it('updates an asynchronously fetched record', async () => {
			const service = createCrudService({
				dataLoader: () => Promise.resolve(loaded[0] as any)
			});

			const result = await fetchUpdate(service, { id: 'three', newValue: 'tacos' });

			assert.deepEqual({ ...loaded[0], newValue: 'tacos' }, result);
		});

		it('throws a not found status when there is no record', async () => {
			const service = createCrudService({});

			const error = await eventuallyRejects(fetchUpdate(service, { id: 'three', newValue: 'tacos' }));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});

		it('returns a not found status when the record has been deleted', async () => {
			const service = createCrudService({ data });

			await fetchDelete(service, 'one');
			const error = await eventuallyRejects(fetchUpdate(service, { id: 'one', newValue: 'tacos' }));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});
	});

	describe('delete', () => {
		it('deletes an in-memory record', async () => {
			const service = createCrudService({ data });

			const record = await fetchDelete(service, 'one');

			assert.deepEqual(record, data[0]);
		});

		it('deletes a fetched record', async () => {
			const service = createCrudService({
				dataLoader: () => loaded[0] as any
			});

			const record = await fetchDelete(service, 'three');

			assert.deepEqual(record, loaded[0]);
		});

		it('deletes an asynchronously fetched record', async () => {
			const service = createCrudService({
				dataLoader: () => Promise.resolve(loaded[0] as any)
			});

			const record = await fetchDelete(service, 'three');

			assert.deepEqual(record, loaded[0]);
		});

		it('returns a not found status when there is no record', async () => {
			const service = createCrudService({});

			const error = await eventuallyRejects(fetchDelete(service, 'one'));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});

		it('returns a not found status when the record has been deleted', async () => {
			const service = createCrudService({ data });

			await fetchDelete(service, 'one');
			const error = await eventuallyRejects(fetchDelete(service, 'one'));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});
	});

	describe('operations', () => {
		it('can filter the list operation', async () => {
			const service = createCrudService({ data, operations: ['create', 'read', 'update', 'delete'] });

			const error = await eventuallyRejects(fetchList(service));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});

		it('can filter the create operation', async () => {
			const service = createCrudService({ data, operations: ['list', 'read', 'update', 'delete'] });

			const error = await eventuallyRejects(fetchCreate(service, data[0]));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});

		it('can filter to read operation', async () => {
			const service = createCrudService({ data, operations: ['list', 'create', 'update', 'delete'] });

			const error = await eventuallyRejects(fetchRead(service, 'one'));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});

		it('can filter the update operation', async () => {
			const service = createCrudService({ data, operations: ['list', 'create', 'read', 'delete'] });

			const error = await eventuallyRejects(fetchUpdate(service, { id: 'one' }));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});

		it('can filter the delete operation', async () => {
			const service = createCrudService({ data, operations: ['list', 'create', 'read', 'update'] });

			const error = await eventuallyRejects(fetchDelete(service, 'one'));

			assert.strictEqual(error.statusCode, HttpStatus.NotFound);
		});
	});
});
