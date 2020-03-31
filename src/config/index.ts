import { exists } from 'fs';
import { dirname, resolve } from 'path';
import { startNgrok } from '../addons/ngrok';
import { App } from '../core/app';
import { Environment, getLoader } from './loader';

export interface Config {
	mode?: 'http' | 'https' | 'ngrok';
	port?: number;
	services?: ServiceConfig[];
	externals?: {
		[name: string]: ExternalConfig;
	};
}

export interface ServiceConfig {
	name: string;
	[key: string]: any;
}

export interface ExternalConfig {
	path: string;
}

export interface LoadedConfig {
	config: Config;
	configPath: string;
}

function asyncExists(path: string) {
	return new Promise((done) => {
		exists(path, done);
	});
}

/**
 * Loads the configuration file from the provided path
 */
export function loadConfigFile(path: string): LoadedConfig {
	const configPath = resolve(path);
	const config = require(configPath);

	return { config, configPath };
}

/**
 * Loads the configuration file from the default location relative to the cwd
 */
export async function loadDefaultConfig(): Promise<LoadedConfig | undefined> {
	const configPath = resolve('./webserv.json');
	if (await asyncExists(configPath)) {
		const config = require(configPath);
		return { config, configPath };
	}
}

/**
 * @returns a config at the provided path, the default config, or undefined if none exist
 */
export function loadConfig(path?: string) {
	return path ? loadConfigFile(path) : loadDefaultConfig();
}

export async function bootConfig(path?: string, app: App = new App()) {
	const configMeta = await loadConfig(path);
	if (configMeta) {
		const { config, configPath } = configMeta;
		const workingDirectory = dirname(configPath);
		await bootServices(app, config.services, workingDirectory);
		return config;
	}
}

export async function bootService(app: App, config: ServiceConfig, workingDirectory: string) {
	const loader = getLoader(config.name);
	const environment: Environment = {
		configPath: workingDirectory,
		properties: {}
	};
	const service = await loader(config, environment);
	app.add(service);
}

async function bootServices(app: App, configs: ServiceConfig[] = [], workingDirectory: string) {
	for (let service of configs) {
		await bootService(app, service, workingDirectory);
	}
}

export async function startServer(app: App, config: Config = {}) {
	const { mode = 'http', port = 8888 } = config;
	const controls = await app.start(mode === 'https' ? 'https' : 'http', {
		port
	});

	if (mode === 'ngrok') {
		await startNgrok(port);
	}

	return controls;
}

export default async function start(config: Config | string, app = new App()) {
	if (typeof config === 'string') {
		const loadedConfig = await bootConfig(config, app);
		return await startServer(app, loadedConfig);
	} else {
		await bootServices(app, config.services, process.cwd());
		return startServer(app, config);
	}
}
