/// <reference types="intern" />

import automock from '../_support/automock';
import { describeSuite } from '../_support/describeSuite';
import { setupMocks, setupSinon } from '../_support/mocks';
import { Environment } from './interfaces';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');

describeSuite(() => {
	const sinon = setupSinon();
	const workingDirectory = process.cwd();
	const env: Environment = {
		configPath: workingDirectory
	};
	const mockPath = automock('path', sinon);
	const mockFs = automock('fs', sinon);
	const bootServerMock = sinon.stub();
	const isEnvironmentMock = sinon.stub();
	setupMocks(
		{
			'ts-node': automock('ts-node', sinon),
			fs: mockFs,
			path: mockPath,
			'./utils/environment': { isEnvironment: isEnvironmentMock },
			'./utils/addons': { checkRegisterTs: sinon.stub() },
			'./utils/config': { loadConfig: sinon.stub() },
			'./utils/externals': { loadExternals: sinon.stub() },
			'./utils/server': { bootServer: bootServerMock },
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
		const config = {
			servers: [
				{
					name: 'server1',
					services: [{ name: 'name1' }, { name: 'name2' }]
				},
				{
					name: 'server2',
					services: [{ name: 'name1' }, { name: 'name2' }]
				}
			]
		};

		beforeEach(() => {
			start = mockedModule.default;
		});

		it('gets multiple servers and starts them in order', async () => {
			isEnvironmentMock.returns(true);

			const controls = start(config, {});

			assert.isDefined(controls);
			await controls;

			assert.strictEqual(bootServerMock.callCount, 2);
			// since a config; check to make sure the config was not loaded from disk
			assert.strictEqual(mockPath.resolve.callCount, 0);
			// check loaded services
			assert.deepEqual(bootServerMock.firstCall.args[0].name, 'server1');
			assert.deepEqual(bootServerMock.secondCall.args[0].name, 'server2');
			// check the passed environment was used
			assert.deepEqual(bootServerMock.firstCall.args[1], {});
		});

		it('creates an environment when using a config', async () => {
			isEnvironmentMock.returns(false);

			await start(config, {});
			assert.deepEqual(bootServerMock.firstCall.args[1], env);
		});
	});
});
