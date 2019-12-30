/// <reference types="intern" />
import fetch from 'node-fetch';
import { resolve } from 'path';

import { bootConfig, startServer } from '../../src/config';
import { App } from '../../src/core/app';
import { setLogLevel } from '../../src/core/log';
import { ServerControls } from '../../src/core/servers/startServer';

const { assert } = intern.getPlugin('chai');
const { describe, it, before, afterEach } = intern.getPlugin('interface.bdd');

describe('config tests', () => {
	let controls: ServerControls | undefined;

	before(async () => {
		setLogLevel('warn');
	});

	afterEach(async () => {
		setLogLevel('error');
		controls && (await controls.stop());
	});

	async function assertOk(url: string) {
		assert.strictEqual((await fetch(url)).status, 200, `${url} did not return 200`);
	}

	async function assertConfig(configPath: string, urls: string[]) {
		const app = new App();
		const config = {
			...(await bootConfig(configPath, app)),
			port: 3331
		};
		controls = await startServer(app, config);

		for (let url of urls) {
			await assertOk(url);
		}
	}

	it('boots a simple file server config', async () => {
		const configPath = resolve(__dirname, '_assets', 'webserv_config1.json');
		await assertConfig(configPath, [
			'http://localhost:3331',
			'http://localhost:3331/src/index',
			'http://localhost:3331/assets/1.txt'
		]);
	});

	it('boots a multi-service config', async () => {
		const configPath = resolve(__dirname, '_assets', 'webserv_multiple_services.json');
		await assertConfig(configPath, [
			'http://localhost:3331/upload/',
			'http://localhost:3331/upload/list',
			'http://localhost:3331/data/',
			'http://localhost:3331/data/id/one',
			'http://localhost:3331',
			'http://localhost:3331/src/index',
			'http://localhost:3331/assets/1.txt'
		]);
	});
});
