/// <reference types="intern" />

import { App, Service } from './app';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('App', () => {
	describe('addService', () => {
		const beforeProcess = () => {};
		const guard = () => false;
		const transform = () => {};
		const afterProcess = () => {};
		const middleware = () => {};
		const upgrade = () => {};

		it('adds route', () => {
			const service: Service = {
				route: {
					before: [beforeProcess],
					guards: [guard],
					middleware,
					transforms: [transform],
					after: [afterProcess]
				}
			};
			const app = new App();
			app.addService(service);

			assert.lengthOf(app.before, 0);
			assert.lengthOf(app.after, 0);
			assert.lengthOf(app.guards, 0);
			assert.lengthOf(app.transforms, 0);
			assert.lengthOf(app.routes, 1);
			assert.lengthOf(app.upgrades, 0);
		});

		it('adds upgrade', () => {
			const service: Service = {
				upgrade: {
					upgrade
				}
			};
			const app = new App();
			app.addService(service);

			assert.lengthOf(app.before, 0);
			assert.lengthOf(app.after, 0);
			assert.lengthOf(app.guards, 0);
			assert.lengthOf(app.transforms, 0);
			assert.lengthOf(app.routes, 0);
			assert.lengthOf(app.upgrades, 1);
		});
	});
});
