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

export function loadConfigFile(path: string): LoadedConfig {
	const configPath = resolve(path);
	const config = require(configPath);

	return { config, configPath };
}

export async function loadDefaultConfig(): Promise<LoadedConfig | undefined> {
	const configPath = resolve('./webserv.json');
	if (await asyncExists(configPath)) {
		const config = require(configPath);
		return { config, configPath };
	}
}

export function loadConfig(path?: string) {
	return path ? loadConfigFile(path) : loadDefaultConfig();
}

export async function bootConfig(path?: string, app: App = new App()) {
	const configMeta = await loadConfig(path);
	if (configMeta) {
		const { config, configPath } = configMeta;
		const workingDirectory = dirname(configPath);
		bootServices(app, config.services, workingDirectory);
		return config;
	}
}

export function bootService(app: App, config: ServiceConfig, workingDirectory: string) {
	const handler = getLoader(config.name);
	return handler(app, config, workingDirectory);
}

export async function bootServices(app: App, configs: ServiceConfig[] = [], workingDirectory: string) {
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
