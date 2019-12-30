/// <reference types="intern" />
import { App } from '../../src/core/app';
import { body } from '../../src/core/processors/body.processor';
import { route } from '../../src/core/route';
import { response } from '../../src/core/middleware/response';
import fetch from 'node-fetch';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('basic server test', () => {
	it('starts a log server', async () => {
		const app = new App();
		app.before.push(body({}));
		app.routes.push(route({ middleware: response({ statusCode: 200 }) }));
		const controls = await app.start('http', {
			port: 3000
		});
		assert.isDefined(controls);

		const result = await fetch('http://localhost:3000');
		assert.strictEqual(result.status, 200);

		await controls.stop();
	});
});
