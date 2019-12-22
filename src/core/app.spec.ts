/// <reference types="intern" />

import { ServiceDefinition, App } from './app';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('App', () => {
	describe('addService', () => {
		const beforeProcess = () => {};
		const guard = () => false;
		const transform = () => {};
		const afterProcess = () => {};
		const middleware = () => {};
		const upgrader = () => {};

		it('adds global handlers', () => {
			const service: ServiceDefinition = {
				global: {
					before: [beforeProcess],
					guards: [guard],
					transforms: [transform],
					after: [afterProcess]
				}
			};
			const app = new App();
			app.addService(service);

			assert.deepEqual(app.before, service.global.before);
			assert.deepEqual(app.guards, service.global.guards);
			assert.lengthOf(app.routes, 0);
			assert.deepEqual(app.transforms, service.global.transforms);
			assert.deepEqual(app.after, service.global.after);
			assert.isUndefined(app.upgrader);
		});

		it('adds routes', () => {
			const service: ServiceDefinition = {
				services: [
					{
						before: [beforeProcess],
						guards: [guard],
						middleware,
						transforms: [transform],
						after: [afterProcess]
					}
				]
			};
			const app = new App();
			app.addService(service);

			assert.lengthOf(app.before, 0);
			assert.lengthOf(app.after, 0);
			assert.lengthOf(app.guards, 0);
			assert.lengthOf(app.transforms, 0);
			assert.lengthOf(app.routes, 1);
			assert.isUndefined(app.upgrader);
		});

		it('sets the upgrader', () => {
			const service: ServiceDefinition = {
				upgrader
			};
			const app = new App();
			app.addService(service);

			assert.lengthOf(app.before, 0);
			assert.lengthOf(app.after, 0);
			assert.lengthOf(app.guards, 0);
			assert.lengthOf(app.transforms, 0);
			assert.lengthOf(app.routes, 0);
			assert.strictEqual(app.upgrader, upgrader);
		});
	});
});
