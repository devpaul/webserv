/// <reference types="intern" />
import { servers as serverPath } from './_support/config';
import { assertOk, createServer } from './_support/createServer';
import { createJanitor, wrapServers } from './_support/janitor';
import { testLogLevel } from './_support/testLogLevel';

const { describe, it } = intern.getPlugin('interface.bdd');

describe('config tests', () => {
	const janitor = createJanitor('afterEach');
	testLogLevel('warn');

	it('boots a simple file server config', async () => {
		const { servers } = await createServer(serverPath('webserv-file-server.json'));
		janitor.track(...servers.map(wrapServers));

		await assertOk([
			'http://localhost:3331',
			'http://localhost:3331/src/index',
			'http://localhost:3331/assets/1.txt'
		]);
	});
});
