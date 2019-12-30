/// <reference types="intern" />

import { App } from '../../core/app';
import { setupMocks, setupSinon } from '../../_support/mocks';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach, after } = intern.getPlugin('interface.bdd');

describe('config/services/crud', () => {
	describe('bootCrudService', () => {
		const sinon = setupSinon();
		const mockPathGuard = sinon.stub();
		const mockCrudRoute = sinon.stub();
		setupMocks({
			'../../core/guards/path': { pathGuard: mockPathGuard },
			'../../core/routes/crud.route': { crudRoute: mockCrudRoute }
		});
		let bootCrudService: typeof import('./crud').bootCrudService;

		beforeEach(() => {
			bootCrudService = require('./crud').bootCrudService;
			mockCrudRoute.returns({ middleware: () => {} });
		});

		after(() => {
			sinon.restore();
		});

		function assertBoot(app: App, match: string, data?: any) {
			assert.lengthOf(app.routes, 1);
			assert.isTrue(mockPathGuard.calledOnce);
			assert.isTrue(mockCrudRoute.calledOnce);
			assert.deepEqual(mockPathGuard.firstCall.args[0], {
				match
			});
			assert.deepEqual(mockCrudRoute.firstCall.args[0], { data });
		}

		it('creates a crud route', () => {
			const app = new App();
			const config = {
				path: '*'
			};

			bootCrudService(app, config);

			assertBoot(app, config.path);
		});

		it('creates a crud route with initial data', () => {
			const app = new App();
			const config = {
				path: '*',
				data: { 'id-1': 'one' }
			};

			bootCrudService(app, config);

			assertBoot(app, config.path, config.data);
		});
	});
});
