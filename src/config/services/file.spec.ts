/// <reference types="intern" />

import { resolve } from 'path';
import { setupMocks, setupSinon } from '../../_support/mocks';
import { Environment } from '../loader';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');

const env: Environment = {
	configPath: 'configPath',
	properties: {}
};

describe('config/services/file', () => {
	describe('bootFileService', () => {
		const sinon = setupSinon();
		const mockFileService = sinon.stub();
		setupMocks({
			'../../core/log': { log: { debug: sinon.stub() } },
			'../../core/services/file.service': { fileService: mockFileService }
		});
		let bootFileService: typeof import('./file').bootFileService;

		beforeEach(() => {
			bootFileService = require('./file').bootFileService;
			mockFileService.returns({});
		});

		it('creates a single route from a path', async () => {
			const config = {
				routes: {
					'*': '.'
				}
			};

			const service = await bootFileService(config, env);

			assert.isArray(service);
			assert.isTrue(mockFileService.calledOnce);
			assert.deepEqual(mockFileService.firstCall.args[0], {
				route: '*',
				basePath: resolve('configPath')
			});
		});

		it('creates multiple routes from a list of paths', async () => {
			const config = {
				routes: {
					'/uploads/*': './uploads',
					'*': '.'
				}
			};

			const service = await bootFileService(config, env);

			assert.isArray(service);
			assert.isTrue(mockFileService.calledTwice);
			assert.deepEqual(mockFileService.firstCall.args[0], {
				route: '/uploads/*',
				basePath: resolve('configPath/uploads')
			});
			assert.deepEqual(mockFileService.secondCall.args[0], {
				route: '*',
				basePath: resolve('configPath')
			});
		});

		it('creates a route using a basePath', async () => {
			const config = {
				basePath: 'serve',
				routes: {
					'*': '.'
				}
			};

			const service = await bootFileService(config, env);

			assert.isArray(service);
			assert.isTrue(mockFileService.calledOnce);
			assert.deepEqual(mockFileService.firstCall.args[0], {
				route: '*',
				basePath: resolve('configPath/serve')
			});
		});
	});
});
