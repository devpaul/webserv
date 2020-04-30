/// <reference types="intern" />
import { examples } from '../_support/config';
import { assertOk, createServer } from '../_support/createServer';
import { createJanitor, wrapServers } from '../_support/janitor';
import { testLogLevel } from '../_support/testLogLevel';

const { describe, it } = intern.getPlugin('interface.bdd');

describe('proxy example', () => {
	const janitor = createJanitor('afterEach');

	testLogLevel('warn');

	it('test proxy', async () => {
		const configPath = examples('proxy', 'webserv.json');
		const servers = await createServer(configPath, [{}, { port: 3331 }]);
		janitor.track(...servers.map(wrapServers));

		await assertOk(['http://localhost:3331/', 'http://localhost:4110/']);
	});
});
