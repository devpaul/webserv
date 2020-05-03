import fetch from 'node-fetch';
import { dirname } from 'path';
import start from '../../../src/config';
import { loadConfig } from '../../../src/config/utils/config';
import { Environment } from '../../../src/config/utils/environment';
import { Server } from '../../../src/config/utils/server';

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

export async function createServer(configPath: string, serverOverrides: Partial<Server>[] = []) {
	const { config, configPath: path } = await loadConfig(configPath);
	const env: Environment = {
		configPath: dirname(path)
	};
	for (let i = 0; i < serverOverrides.length; i++) {
		const override = serverOverrides[i];
		const server = config.servers[i];
		config.servers[i] = {
			...server,
			...override
		};
	}

	return await start(config, env);
}
