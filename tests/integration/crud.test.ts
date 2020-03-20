/// <reference types="intern" />
import { resolve } from 'path';
import { ServerControls } from '../../src/core/servers/startServer';
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
		const configPath = resolve(__dirname, '_assets', 'webserv_crud.json');
		controls = await createServer(configPath);
		await assertResponse('http://localhost:3331/', [{ id: 'one' }, { id: 'two' }]);
		await assertResponse('http://localhost:3331/one/', { id: 'one' });
		await assertResponse('http://localhost:3331/two', { id: 'two' });
	});
});
