/// <reference types="intern" />

import { App, Service } from './app';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('App', () => {
	describe('add', () => {
		const beforeProcess = () => {};
		const guard = () => false;
		const transform = () => {};
		const afterProcess = () => {};
		const middlewareFunc = () => {};
		const upgrade = () => {};

		it('adds route', () => {
			const service: Service = {
				route: {
					before: [beforeProcess],
					guards: [guard],
					middleware: middlewareFunc,
					transforms: [transform],
					after: [afterProcess]
				}
			};
			const app = new App();
			app.add(service);

			const { before, after, guards, transforms, middleware } = app.globalRoute;
			assert.lengthOf(before, 0);
			assert.lengthOf(after, 0);
			assert.lengthOf(guards, 0);
			assert.lengthOf(transforms, 0);
			assert.lengthOf(middleware, 1);
			assert.lengthOf(app.upgrades, 0);
		});

		it('adds upgrade', () => {
			const service: Service = {
				upgrade: {
					upgrade
				}
			};
			const app = new App();
			app.add(service);

			const { before, after, guards, transforms, middleware } = app.globalRoute;
			assert.lengthOf(before, 0);
			assert.lengthOf(after, 0);
			assert.lengthOf(guards, 0);
			assert.lengthOf(transforms, 0);
			assert.lengthOf(middleware, 0);
			assert.lengthOf(app.upgrades, 1);
		});

		it('adds global', () => {
			const service: Service = {
				global: {
					before: [beforeProcess],
					guards: [guard],
					transforms: [transform],
					after: [afterProcess]
				},
				route: {
					before: [beforeProcess],
					guards: [guard],
					middleware: middlewareFunc,
					transforms: [transform],
					after: [afterProcess]
				}
			};
			const app = new App();
			app.add(service);

			const { before, after, guards, transforms, middleware } = app.globalRoute;
			assert.lengthOf(before, 1);
			assert.lengthOf(after, 1);
			assert.lengthOf(guards, 1);
			assert.lengthOf(transforms, 1);
			assert.lengthOf(middleware, 1);
			assert.lengthOf(app.upgrades, 0);
		});

		it('adds a list of services', () => {
			const services: Service[] = [
				{
					route: {
						middleware: middlewareFunc
					}
				},
				{
					route: {
						middleware: middlewareFunc
					}
				}
			];
			const app = new App();
			app.add(services);

			const { before, after, guards, transforms, middleware } = app.globalRoute;
			assert.lengthOf(before, 0);
			assert.lengthOf(after, 0);
			assert.lengthOf(guards, 0);
			assert.lengthOf(transforms, 0);
			assert.lengthOf(middleware, 2);
			assert.lengthOf(app.upgrades, 0);
		});
	});
});
