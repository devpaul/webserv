/// <reference types="intern" />
import { servers as serverPath, TEST_PORT } from './_support/config';
import { assertOk, createServer } from './_support/createServer';
import { createJanitor, wrapServers } from './_support/janitor';
import { testLogLevel } from './_support/testLogLevel';

const { describe, it } = intern.getPlugin('interface.bdd');

describe('config tests', () => {
	const janitor = createJanitor('afterEach');
	testLogLevel('warn');

	it('boots a simple file server config', async () => {
		const servers = await createServer(serverPath('webserv-file-server.json'));
		janitor.track(...servers.map(wrapServers));

		await assertOk([
			`http://localhost:${TEST_PORT}`,
			`http://localhost:${TEST_PORT}/src/index`,
			`http://localhost:${TEST_PORT}/assets/1.txt`
		]);
	});
});
