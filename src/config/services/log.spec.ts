/// <reference types="intern" />

import { setupMocks, setupSinon } from '../../_support/mocks';

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
		it('Adds a global before processors', async () => {
			const config = {};

			const service = (await bootLogService(config)) as any;

			assert.isNotArray(service);
			assert.strictEqual(setLogLevelMock.callCount, 0);
			assert.isUndefined(service.route);
			assert.lengthOf(service.global.before, 2);
		});

		it('adds a route when respondOk is true', async () => {
			const config = {
				respondOk: true
			};
			const service = (await bootLogService(config)) as any;

			assert.strictEqual(setLogLevelMock.callCount, 0);
			assert.isDefined(service.route);
		});
	});
});
