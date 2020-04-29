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

	describe('start', () => {
		let start: typeof mockedModule.default;

		beforeEach(() => {
			start = mockedModule.default;
		});

		it('gets multiple loaders and calls them in order', async () => {
			const mockApp = automockInstance(new App(), sinon);
			const config = {
				servers: [
					{
						services: [{ name: 'name1' }, { name: 'name2' }]
					}
				]
			};
			const loader = sinon.stub().returns(Promise.resolve({}));
			getLoaderMock.returns(loader);

			const controls = start(config, {}, mockApp);
			assert.isDefined(controls);
			await controls;
			assert.strictEqual(loader.callCount, 2);
			// since a config; check to make sure the config was not loaded from disk
			assert.strictEqual(mockPath.resolve.callCount, 0);
			// check loaded services
			assert.deepEqual(loader.firstCall.args, [config.servers[0].services[0], env]);
			assert.deepEqual(loader.secondCall.args, [config.servers[0].services[1], env]);
		});
	});
});
