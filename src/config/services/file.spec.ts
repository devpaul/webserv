/// <reference types="intern" />

import { setupSinon, setupMocks } from '../../_support/mocks';
import { App } from '../../core/app';
import { resolve } from 'path';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');

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

		it('creates a single route from a path', () => {
			const app = new App();
			const config = {
				paths: {
					'*': '.'
				}
			};

			bootFileService(app, config, 'configPath');

			assert.isTrue(mockFileService.calledOnce);
			assert.deepEqual(mockFileService.firstCall.args[0], {
				path: '*',
				basePath: resolve('configPath')
			});
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

			assert.isTrue(mockFileService.calledTwice);
			assert.deepEqual(mockFileService.firstCall.args[0], {
				path: '/uploads/*',
				basePath: resolve('configPath/uploads')
			});
			assert.deepEqual(mockFileService.secondCall.args[0], {
				path: '*',
				basePath: resolve('configPath')
			});
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

			assert.isTrue(mockFileService.calledOnce);
			assert.deepEqual(mockFileService.firstCall.args[0], {
				path: '*',
				basePath: resolve('configPath/serve')
			});
		});
	});
});
