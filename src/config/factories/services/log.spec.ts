/// <reference types="intern" />

import { describeSuite } from '../../../_support/describeSuite';
import { setupMocks, setupSinon } from '../../../_support/mocks';

const { assert } = intern.getPlugin('chai');
const { it, beforeEach } = intern.getPlugin('interface.bdd');

describeSuite(() => {
	let factory: typeof import('./log').logServiceFactory;

	const sinon = setupSinon();
	const setLogLevelMock = sinon.stub();

	setupMocks({
		'../../core/log': { setLogLevel: setLogLevelMock }
	});

	beforeEach(() => {
		factory = require('./log').logServiceFactory;
	});

	describeSuite(() => {
		it('Adds a global before processors', async () => {
			const config = {};

			const service = (await factory(config)) as any;

			assert.isNotArray(service);
			assert.strictEqual(setLogLevelMock.callCount, 0);
			assert.isUndefined(service.route);
			assert.lengthOf(service.global.before, 2);
		});

		it('adds a route when respondOk is true', async () => {
			const config = {
				respondOk: true
			};
			const service = (await factory(config)) as any;

			assert.strictEqual(setLogLevelMock.callCount, 0);
			assert.isDefined(service.route);
		});
	});
});
