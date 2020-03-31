import fetch from 'node-fetch';
import { dirname } from 'path';
import start, { loadConfig } from '../../../src/config';

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

export async function assertResponse(site: FetchRequest | string, expected?: object, status: number = 200) {
	const url = typeof site === 'string' ? site : site.url;
	const init =
		typeof site === 'string'
			? {}
			: {
					method: site.method || 'GET',
					body: site.body || ''
			  };
	const result = await fetch(url, init);
	assert.strictEqual(result.status, status, `${url} did not return 200`);
	expected && assert.deepEqual(await result.json(), expected);
}

export async function createServer(configPath: string) {
	const { config, configPath: path } = await loadConfig(configPath);
	const controls = await start(
		{
			...config,
			port: 3331
		},
		{ workingDirectory: dirname(path) }
	);

	return controls;
}
