/// <reference types="intern" />
import fetch from 'node-fetch';
import { App } from '../../src/core/app';
import { response } from '../../src/middleware/handlers/response';
import { body } from '../../src/middleware/processors/before/body.processor';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('basic server test', () => {
	it('starts a log server', async () => {
		const app = new App();
		app.add({
			global: {
				before: [body({})]
			},
			route: {
				middleware: response({ statusCode: 200 })
			}
		});
		const controls = await app.start('http', {
			port: 3000
		});
		assert.isDefined(controls);

		const result = await fetch('http://localhost:3000');
		assert.strictEqual(result.status, 200);

		await controls.stop();
	});
});
