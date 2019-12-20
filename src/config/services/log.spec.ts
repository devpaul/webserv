/// <reference types="intern" />

import { setupMocks, setupSinon } from '../../_support/mocks';
import { App } from '../../core/app';

const { assert } = intern.getPlugin('chai');
const { describe, it, beforeEach } = intern.getPlugin('interface.bdd');

describe('config/services/log', () => {
	let bootLogService: typeof import('./log').bootLogService;

	const sinon = setupSinon();
	const setLogLevelMock = sinon.stub();

	setupMocks({
		'../../core/log': { setLogLevel: setLogLevelMock }
	});

	beforeEach(() => {
		bootLogService = require('./log').bootLogService;
	});

	describe('bootLogService', () => {
		it('Adds a global before processors', () => {
			const app = new App();
			const config = {};
			bootLogService(app, config);
			assert.strictEqual(setLogLevelMock.callCount, 0);
			assert.lengthOf(app.routes, 0);
			assert.lengthOf(app.before, 2);
		});

		it('sets the log level when level is passed', () => {
			const app = new App();
			const config = {
				level: 'taco'
			};
			bootLogService(app, config);
			assert.strictEqual(setLogLevelMock.callCount, 1);
			assert.strictEqual(setLogLevelMock.firstCall.args[0], 'taco');
		});

		it('adds a route when respondOk is true', () => {
			const app = new App();
			const config = {
				respondOk: true
			};
			bootLogService(app, config);
			assert.strictEqual(setLogLevelMock.callCount, 0);
			assert.lengthOf(app.routes, 1);
		});
	});
});
