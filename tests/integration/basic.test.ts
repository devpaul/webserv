/// <reference types="intern" />
import fetch from 'node-fetch';
import { App } from '../../src/core/app';
import { response } from '../../src/middleware/handlers/response';
import { body } from '../../src/middleware/processors/before/body.processor';
import { TEST_PORT } from './_support/config';
import { testLogLevel } from './_support/testLogLevel';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('basic server test', () => {
	testLogLevel('warn');

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
			port: TEST_PORT
		});
		assert.isDefined(controls);

		const result = await fetch(`http://localhost:${TEST_PORT}`);
		assert.strictEqual(result.status, 200);

		await controls.stop();
	});
});
