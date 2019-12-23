/// <reference types="intern" />

import { bootProxyService } from './proxy';
import { App } from '../../core/app';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('config/services/proxy', () => {
	describe('bootProxyService', () => {
		it('Adds a route and an upgrader', () => {
			const app = new App();
			const config = {
				target: 'https://example.org'
			};
			bootProxyService(app, config);
			assert.lengthOf(app.routes, 1);
			assert.lengthOf(app.upgrades, 1);
		});
	});
});
