/// <reference types="intern" />

import { resolve } from 'path';
import { describeSuite } from '../../../_support/describeSuite';
import { setupMocks, setupSinon } from '../../../_support/mocks';
import { $Env, Environment } from '../../utils/environment';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');

const env: Environment = {
	configPath: 'configPath'
};

describeSuite(() => {
	describe('bootFileService', () => {
		const sinon = setupSinon();
		const mockFileService = sinon.stub();
		setupMocks({
			'../../../core/log': { log: { debug: sinon.stub() } },
			'../../../middleware/services/file.service': { fileService: mockFileService },
			'../../utils/environment': {
				$Env
			}
		});
		let factory: typeof import('./file').fileServiceFactory;

		beforeEach(() => {
			factory = require('./file').fileServiceFactory;
			mockFileService.returns({});
		});

		it('creates a single route from a path', async () => {
			const config = {
				routes: {
					'*': '.'
				},
				[$Env]: {
					configPath: 'configPath'
				}
			};

			const service = await factory(config);

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
				},
				[$Env]: env
			};

			const service = await factory(config);

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
				},
				[$Env]: env
			};

			const service = await factory(config);

			assert.isArray(service);
			assert.isTrue(mockFileService.calledOnce);
			assert.deepEqual(mockFileService.firstCall.args[0], {
				route: '*',
				basePath: resolve('configPath/serve')
			});
		});
	});
});
