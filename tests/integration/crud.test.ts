/// <reference types="intern" />
import { ServerControls } from '../../src/core/servers/startServer';
import { examples } from './_support/config';
import { assertResponse, createServer } from './_support/createServer';
import { testLogLevel } from './_support/testLogLevel';

const { describe, it, afterEach } = intern.getPlugin('interface.bdd');

describe('crud server test', () => {
	let controls: ServerControls | undefined;

	testLogLevel('warn');

	afterEach(async () => {
		controls && (await controls.stop());
	});

	it('file crud service', async () => {
		const configPath = examples('crud', 'webserv.json');
		controls = await createServer(configPath);
		await assertResponse('http://localhost:3331/', [{ id: 'one' }, { id: 'two' }]);
		await assertResponse('http://localhost:3331/one/', { id: 'one' });
		await assertResponse('http://localhost:3331/two', { id: 'two' });
	});
});
