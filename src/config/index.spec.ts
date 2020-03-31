/// <reference types="intern" />

import { App } from '../core/app';
import automock, { automockInstance } from '../_support/automock';
import { describeSuite } from '../_support/describeSuite';
import { setupMocks, setupSinon } from '../_support/mocks';
import { Environment } from './loader';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');

describeSuite(() => {
	const sinon = setupSinon();
	const workingDirectory = process.cwd();
	const env: Environment = {
		configPath: workingDirectory,
		properties: {}
	};
	const getLoaderMock = sinon.stub();
	const mockPath = automock('path', sinon);
	const mockFs = automock('fs', sinon);
	setupMocks(
		{
			'ts-node': automock('ts-node', sinon),
			fs: mockFs,
			path: mockPath,
			'./loader': { getLoader: getLoaderMock },
			'../core/app': automock('../core/app', sinon)
		},
		['./index']
	);
	let mockedModule: typeof import('./index');

	beforeEach(() => {
		mockedModule = require('./index');
	});

	// describe('bootService', () => {
	// 	let bootService: typeof mockedModule.bootService;

	// 	beforeEach(() => {
	// 		bootService = mockedModule.bootService;
	// 	});

	// 	it('gets a loader and calls it', async () => {
	// 		const app = new App();
	// 		const config = {
	// 			name: 'name'
	// 		};
	// 		const loader = sinon.stub().returns(Promise.resolve({}));
	// 		getLoaderMock.returns(loader);

	// 		await bootService(app, config, workingDirectory);
	// 		assert.strictEqual(loader.callCount, 1);
	// 		assert.deepEqual(loader.firstCall.args, [config, env]);
	// 	});
	// });

	describe('startServer', () => {
		let startServer: typeof mockedModule.startServer;
		const mockStart = sinon.stub();
		const app: any = {
			start: mockStart
		} as const;

		beforeEach(() => {
			startServer = mockedModule.startServer;
		});

		it('starts the application server with defaults', async () => {
			const controls = {};
			mockStart.returns(Promise.resolve(controls));

			const result = await startServer(app);

			assert.strictEqual(result, controls);
			assert.strictEqual(mockStart.callCount, 1);
			assert.deepEqual(mockStart.firstCall.args, ['http', { port: 8888 }]);
		});

		it('starts the application server with provided values', async () => {
			const controls = {};
			mockStart.returns(Promise.resolve(controls));

			const result = await startServer(app, {
				mode: 'https',
				port: 1024
			});

			assert.strictEqual(result, controls);
			assert.strictEqual(mockStart.callCount, 1);
			assert.deepEqual(mockStart.firstCall.args, ['https', { port: 1024 }]);
		});
	});

	describe('start', () => {
		let start: typeof mockedModule.default;

		beforeEach(() => {
			start = mockedModule.default;
		});

		it('gets multiple loaders and calls them in order', async () => {
			const mockApp = automockInstance(new App(), sinon);
			const config = {
				services: [{ name: 'name1' }, { name: 'name2' }]
			};
			const loader = sinon.stub().returns(Promise.resolve({}));
			getLoaderMock.returns(loader);

			const controls = start(config, { app: mockApp });
			assert.isDefined(controls);
			await controls;
			assert.strictEqual(loader.callCount, 2);
			// since a config; check to make sure the config was not loaded from disk
			assert.strictEqual(mockPath.resolve.callCount, 0);
			// check loaded services
			assert.deepEqual(loader.firstCall.args, [config.services[0], env]);
			assert.deepEqual(loader.secondCall.args, [config.services[1], env]);
		});
	});
});
