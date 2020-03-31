import { exists } from 'fs';
import { dirname, join, resolve } from 'path';
import { App } from '../core/app';
import { Environment, getLoader, setLoader } from './loader';

export interface Config {
	mode?: 'http' | 'https';
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

function asyncExists(path: string): Promise<boolean> {
	return new Promise((done) => {
		exists(path, done);
	});
}

/**
 * Loads the configuration file from the provided path
 */
function loadConfigFile(path: string): LoadedConfig {
	const configPath = resolve(path);
	const config = require(configPath);

	return { config, configPath };
}

/**
 * Loads the configuration file from the default location relative to the cwd
 */
async function loadDefaultConfig(): Promise<LoadedConfig | undefined> {
	const configPath = resolve('./webserv.json');
	if (await asyncExists(configPath)) {
		const config = require(configPath);
		return { config, configPath };
	}
	return undefined;
}

function loadExternals(externals: Config['externals'] = {}, workingDirectory: string) {
	for (let [name, config] of Object.entries(externals)) {
		const path = resolve(join(workingDirectory, config.path));
		setLoader(name, path);
	}
}

async function bootConfig(path?: string, app: App = new App()) {
	const configMeta = await loadConfig(path);
	if (configMeta) {
		const { config, configPath } = configMeta;
		const workingDirectory = dirname(configPath);
		loadExternals(config.externals, workingDirectory);
		await bootServices(app, config.services, workingDirectory);
		return config;
	}
}

async function bootService(app: App, config: ServiceConfig, workingDirectory: string) {
	const loader = getLoader(config.name);
	if (!loader) {
		throw new Error(`Service ${config.name} does not exist`);
	}
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

	return controls;
}

/**
 * @returns a config at the provided path, the default config, or undefined if none exist
 */
export function loadConfig(path?: string) {
	return path ? loadConfigFile(path) : loadDefaultConfig();
}

/**
 * Starts a server from a config.
 *
 * Lifecycle for start:
 *
 * 1. load the configuration
 * 2. load externals
 * 3. boot services
 * 4. start the server
 *
 * @param config a Config or a path that can be used to load a config
 * @param app an App to manage the server
 */
export default async function start(
	config: Config | string,
	{ app = new App(), workingDirectory = process.cwd() } = {}
) {
	if (typeof config === 'string') {
		const loadedConfig = await bootConfig(config, app);
		const controls = await startServer(app, loadedConfig);
		return { ...controls, app };
	} else {
		loadExternals(config.externals, workingDirectory);
		await bootServices(app, config.services, workingDirectory);
		const controls = await startServer(app, config);
		return { ...controls, app };
	}
}
