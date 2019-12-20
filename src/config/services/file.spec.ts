/// <reference types="intern" />

import { setupSinon, setupMocks } from '../../_support/mocks';
import { App } from '../../core/app';
import { resolve } from 'path';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');

describe('config/services/file', () => {
	describe('bootFileService', () => {
		const sinon = setupSinon();
		const mockMethodGet = sinon.stub();
		const mockServe = sinon.stub();
		setupMocks({
			'../../core/log': { log: { debug: sinon.stub() } },
			'../../core/guards/method': { method: { get: mockMethodGet } },
			'../../core/middleware/serve': { serve: mockServe }
		});
		let bootFileService: typeof import('./file').bootFileService;

		beforeEach(() => {
			bootFileService = require('./file').bootFileService;
		});

		it('creates a single route from a path', () => {
			const app = new App();
			const config = {
				paths: {
					'*': '.'
				}
			};

			bootFileService(app, config, 'configPath');

			assert.lengthOf(app.routes, 1);
			assert.isTrue(mockMethodGet.calledOnce);
			assert.isTrue(mockServe.calledOnce);
			assert.strictEqual(mockMethodGet.firstCall.args[0], '*');
			assert.deepEqual(mockServe.firstCall.args[0], { basePath: resolve('configPath') });
		});

		it('creates multiple routes from a list of paths', () => {
			const app = new App();
			const config = {
				paths: {
					'/uploads/*': './uploads',
					'*': '.'
				}
			};

			bootFileService(app, config, 'configPath');

			assert.lengthOf(app.routes, 2);
			assert.isTrue(mockMethodGet.calledTwice);
			assert.isTrue(mockServe.calledTwice);
			assert.strictEqual(mockMethodGet.firstCall.args[0], '/uploads/*');
			assert.deepEqual(mockServe.firstCall.args[0], { basePath: resolve('configPath/uploads') });
			assert.strictEqual(mockMethodGet.secondCall.args[0], '*');
			assert.deepEqual(mockServe.secondCall.args[0], { basePath: resolve('configPath') });
		});

		it('creates a route using a basePath', () => {
			const app = new App();
			const config = {
				basePath: 'serve',
				paths: {
					'*': '.'
				}
			};

			bootFileService(app, config, 'configPath');

			assert.lengthOf(app.routes, 1);
			assert.isTrue(mockMethodGet.calledOnce);
			assert.isTrue(mockServe.calledOnce);
			assert.strictEqual(mockMethodGet.firstCall.args[0], '*');
			assert.deepEqual(mockServe.firstCall.args[0], { basePath: resolve('configPath/serve') });
		});
	});
});
