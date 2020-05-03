/// <reference types="intern" />

import { Service } from '../../../core/app';
import { describeSuite } from '../../../_support/describeSuite';
import { proxyServiceFactory } from './proxy';

const { assert } = intern.getPlugin('chai');
const { it } = intern.getPlugin('interface.bdd');

describeSuite(() => {
	it('Adds a route and an upgrader', async () => {
		const config = {
			target: 'https://example.org'
		};
		const service = (await proxyServiceFactory(config)) as Service;
		assert.isDefined(service.route);
		assert.isDefined(service.upgrade);
	});
});
