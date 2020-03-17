/// <reference types="intern" />

import { Service } from 'src/core/app';
import { bootProxyService } from './proxy';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('config/services/proxy', () => {
	describe('bootProxyService', () => {
		it('Adds a route and an upgrader', async () => {
			const config = {
				target: 'https://example.org'
			};
			const service = (await bootProxyService(config)) as Service;
			assert.isDefined(service.route);
			assert.isDefined(service.upgrade);
		});
	});
});
