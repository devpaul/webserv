import fetch from 'node-fetch';
import { bootConfig, startServer } from '../../../src/config';
import { App } from '../../../src/core/app';

const { assert } = intern.getPlugin('chai');

export interface FetchRequest {
	url: string;
	method?: string;
	body?: string;
}

export async function assertOk(sites: string[]) {
	for (let site of sites) {
		await assertResponse(site);
	}
}

export async function assertResponse(site: FetchRequest | string, expected?: object) {
	const url = typeof site === 'string' ? site : site.url;
	const init =
		typeof site === 'string'
			? {}
			: {
					method: site.method || 'GET',
					body: site.body || ''
			  };
	const result = await fetch(url, init);
	assert.strictEqual(result.status, 200, `${url} did not return 200`);
	expected && assert.deepEqual(await result.json(), expected);
}

export async function createServer(configPath: string) {
	const app = new App();
	const config = {
		...(await bootConfig(configPath, app)),
		port: 3331
	};
	const controls = await startServer(app, config);

	return controls;
}
