/// <reference types="intern" />

import { describeSuite } from '../../../_support/describeSuite';
import { setupMocks, setupSinon } from '../../../_support/mocks';
import { $Env, Environment } from '../../utils/environment';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');

const env: Environment = {
	configPath: 'configPath'
};

describeSuite(() => {
	describe('bootCrudService', () => {
		const sinon = setupSinon();
		const mockCrudService = sinon.stub();
		setupMocks({
			'../../../core/services/crud.service': { crudService: mockCrudService }
		});
		let factory: typeof import('./crud').crudServiceFactory;

		beforeEach(() => {
			factory = require('./crud').crudServiceFactory;
			mockCrudService.returns({});
		});

		it('creates a crud route', async () => {
			const config = {
				route: '*',
				[$Env]: env
			};

			const service = await factory(config);

			assert.isDefined(service);
			assert.isTrue(mockCrudService.calledOnce);
			assert.deepEqual(mockCrudService.firstCall.args[0], config);
		});

		it('creates a crud route with initial data', async () => {
			const config = {
				route: '*',
				data: [{ id: 'id-1', data: 'one' }],
				[$Env]: env
			};

			const service = await factory(config);

			assert.isDefined(service);
			assert.isTrue(mockCrudService.calledOnce);
			assert.deepEqual(mockCrudService.firstCall.args[0], config);
		});
	});
});
