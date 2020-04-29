/// <reference types="intern" />
import { examples } from '../_support/config';
import { assertResponse, createServer } from '../_support/createServer';
import { createJanitor, wrapServers } from '../_support/janitor';
import { testLogLevel } from '../_support/testLogLevel';

const { describe, it } = intern.getPlugin('interface.bdd');

describe('crud server test', () => {
	const janitor = createJanitor('afterEach');

	testLogLevel('warn');

	it('file crud service', async () => {
		const configPath = examples('crud', 'webserv.json');
		const { servers } = await createServer(configPath, [{ port: 3331 }]);
		janitor.track(...servers.map(wrapServers));

		await assertResponse('http://localhost:3331/', [{ id: 'one' }, { id: 'two' }]);
		await assertResponse('http://localhost:3331/one/', { id: 'one' });
		await assertResponse('http://localhost:3331/two', { id: 'two' });
	});
});
