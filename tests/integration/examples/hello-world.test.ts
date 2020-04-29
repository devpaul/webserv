/// <reference types="intern" />
import { examples } from '../_support/config';
import { assertOk, createServer } from '../_support/createServer';
import { createJanitor, wrapServers } from '../_support/janitor';
import { testLogLevel } from '../_support/testLogLevel';

const { describe, it } = intern.getPlugin('interface.bdd');

describe('hello-world example', () => {
	const janitor = createJanitor('afterEach');

	testLogLevel('warn');

	it('test hello-world', async () => {
		const configPath = examples('hello-world', 'webserv.json');
		const servers = await createServer(configPath, [{ port: 3331 }]);
		janitor.track(...servers.map(wrapServers));

		await assertOk([
			'http://localhost:3331/',
			'http://localhost:3331/hello/world',
			'http://localhost:3331/hello/person',
			'http://localhost:3331/hello/webserv',
			'http://localhost:3331/hello/tacos'
		]);
	});
});
