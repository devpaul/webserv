import { exists } from 'fs';
import { resolve, dirname } from 'path';
import { App } from '../core/app';
import { getLoader } from './services';
import { startNgrok } from '../addons/ngrok';

export interface Config {
	mode?: 'http' | 'https' | 'ngrok';
	port?: number;
	services?: ServiceConfig[];
}

export interface ServiceConfig {
	name: string;
}

export interface LoadedConfig {
	config: Config;
	configPath: string;
}

export type ServiceLoader = (app: App, config: any, basePath: string) => Promise<void> | void;

function asyncExists(path: string) {
	return new Promise((done) => {
		exists(path, done);
	});
}

export async function runConfig(path?: string, app: App = new App(), overrides?: object) {
	const configMeta = path ? loadConfigFile(path) : await loadDefaultConfig();
	if (configMeta) {
		const { config, configPath } = configMeta;
		for (let service of config.services || []) {
			await bootService(app, service, configPath);
		}
	}
	const { mode = 'http', port = 8888 } = {
		...(configMeta ? configMeta.config : {}),
		...overrides
	};
	const controls = await app.start(mode === 'https' ? 'https' : 'http', {
		port
	});

	if (mode === 'ngrok') {
		await startNgrok(port);
	}

	return controls;
}

export function loadConfigFile(path: string): LoadedConfig {
	const configPath = resolve(path);
	const config = require(configPath);

	return { config, configPath: dirname(configPath) };
}

export async function loadDefaultConfig(): Promise<LoadedConfig | undefined> {
	const configPath = resolve('./webserv.json');
	if (await asyncExists(configPath)) {
		const config = require(configPath);
		return { config, configPath };
	}
}

export function bootService(app: App, config: ServiceConfig, basePath: string) {
	const handler = getLoader(config.name);
	return handler(app, config, basePath);
}
