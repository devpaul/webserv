/// <reference types="intern" />

import { App } from '../core/app';
import { setupMocks, setupSinon } from '../_support/mocks';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');

describe('config/index', () => {
	const sinon = setupSinon();
	const workingDirectory = '.';
	const getLoaderMock = sinon.stub();
	const startNgrokMock = sinon.stub();
	setupMocks({
		'./services': { getLoader: getLoaderMock },
		'../addons/ngrok': { startNgrok: startNgrokMock }
	});

	describe('bootService', () => {
		let bootService: typeof import('./index').bootService;

		beforeEach(() => {
			bootService = require('./index').bootService;
		});

		it('gets a loader and calls it', () => {
			const app = new App();
			const config = {
				name: 'name'
			};
			const handler = sinon.stub();
			const handlerPromise = Promise.resolve();
			handler.returns(handlerPromise);
			getLoaderMock.returns(handler);

			const result = bootService(app, config, workingDirectory);
			assert.strictEqual(result, handlerPromise);
			assert.strictEqual(handler.callCount, 1);
			assert.deepEqual(handler.firstCall.args, [app, config, workingDirectory]);
		});
	});

	describe('bootServices', () => {
		let bootServices: typeof import('./index').bootServices;

		beforeEach(() => {
			bootServices = require('./index').bootServices;
		});

		it('gets multiple loaders and calls them in order', async () => {
			const app = new App();
			const configs = [{ name: 'name1' }, { name: 'name2' }];
			const handler = sinon.stub();
			handler.returns(Promise.resolve());
			getLoaderMock.returns(handler);

			const result = bootServices(app, configs, workingDirectory);
			assert.isDefined(result);
			await result;
			assert.strictEqual(handler.callCount, 2);
			assert.deepEqual(handler.firstCall.args, [app, configs[0], workingDirectory]);
			assert.deepEqual(handler.secondCall.args, [app, configs[1], workingDirectory]);
		});
	});

	describe('startServer', () => {
		let startServer: typeof import('./index').startServer;
		const mockStart = sinon.stub();
		const app: any = {
			start: mockStart
		} as const;

		beforeEach(() => {
			startServer = require('./index').startServer;
		});

		it('starts the application server with defaults', async () => {
			const controls = {};
			mockStart.returns(Promise.resolve(controls));

			const result = await startServer(app);

			assert.strictEqual(result, controls);
			assert.strictEqual(startNgrokMock.callCount, 0);
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
			assert.strictEqual(startNgrokMock.callCount, 0);
			assert.strictEqual(mockStart.callCount, 1);
			assert.deepEqual(mockStart.firstCall.args, ['https', { port: 1024 }]);
		});

		it('starts ngrok', async () => {
			const controls = {};
			mockStart.returns(Promise.resolve(controls));

			const result = await startServer(app, {
				mode: 'ngrok'
			});

			assert.strictEqual(result, controls);
			assert.strictEqual(startNgrokMock.callCount, 1);
			assert.deepEqual(startNgrokMock.firstCall.args, [8888]);
			assert.strictEqual(mockStart.callCount, 1);
			assert.deepEqual(mockStart.firstCall.args, ['http', { port: 8888 }]);
		});
	});
});
