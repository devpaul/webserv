/// <reference types="intern" />
import { examples } from '../_support/config';
import { assertOk, createServer } from '../_support/createServer';
import { createJanitor, wrapServers } from '../_support/janitor';
import { testLogLevel } from '../_support/testLogLevel';

const { describe, it } = intern.getPlugin('interface.bdd');

describe('file-host example', () => {
	const janitor = createJanitor('afterEach');

	testLogLevel('warn');

	it('test file-host', async () => {
		const configPath = examples('file-host', 'webserv.json');
		const servers = await createServer(configPath, [{ port: 3331 }]);
		janitor.track(...servers.map(wrapServers));

		await assertOk(['http://localhost:3331/', 'http://localhost:3331/files/']);
	});
});
