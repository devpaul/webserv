/// <reference types="intern" />
import { resolve } from 'path';
import { setLogLevel } from '../../src/core/log';
import { ServerControls } from '../../src/core/servers/startServer';
import { assertOk, assertResponse, createServer } from './_support/createServer';

const { describe, it, beforeEach, afterEach } = intern.getPlugin('interface.bdd');

describe('config tests', () => {
	let controls: ServerControls | undefined;

	beforeEach(async () => {
		setLogLevel('warn');
	});

	afterEach(async () => {
		setLogLevel('error');
		controls && (await controls.stop());
	});

	it('boots a simple file server config', async () => {
		const configPath = resolve(__dirname, '_assets', 'webserv_config1.json');
		controls = await createServer(configPath);
		await assertOk([
			'http://localhost:3331',
			'http://localhost:3331/src/index',
			'http://localhost:3331/assets/1.txt'
		]);
	});

	it('boots a multi-service config', async () => {
		const configPath = resolve(__dirname, '_assets', 'webserv_multiple_services.json');
		controls = await createServer(configPath);
		await assertOk([
			'http://localhost:3331/upload/',
			'http://localhost:3331/upload/list',
			'http://localhost:3331/data/',
			'http://localhost:3331/data/one',
			'http://localhost:3331',
			'http://localhost:3331/src/index',
			'http://localhost:3331/assets/1.txt'
		]);
	});

	it('boots a config with an external service', async () => {
		const configPath = resolve(__dirname, '_servers', 'external', 'webserv.json');
		controls = await createServer(configPath);
		await assertResponse('http://localhost:3331', { hello: 'potato' });
	});
});
