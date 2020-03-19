/// <reference types="intern" />
import { resolve } from 'path';
import { ServerControls } from '../../src/core/servers/startServer';
import { createServer, assertOk } from './_support/createServer';

const { describe, it, afterEach } = intern.getPlugin('interface.bdd');

describe('crud server test', () => {
	let controls: ServerControls | undefined;

	afterEach(async () => {
		controls && (await controls.stop());
	});

	it('file crud service', async () => {
		const configPath = resolve(__dirname, '_assets', 'webserv_crud.json');
		controls = await createServer(configPath);
		await assertOk(['http://localhost:3331/', 'http://localhost:3331/id/one']);
	});
});
