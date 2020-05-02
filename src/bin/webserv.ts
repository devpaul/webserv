#!/usr/bin/env node
import { dirname } from 'path';
import * as yargs from 'yargs';
import start from '../config';
import { FileConfig } from '../config/factories/services/file';
import { Config, loadConfig } from '../config/utils/config';
import { Server, ServiceConfig } from '../config/utils/server';

const argv = yargs
	.options('config', {
		alias: 'c',
		type: 'string',
		describe: 'load a webserv configuration at the provided location'
	})
	.options('log', {
		alias: 'l',
		describe: 'display all logs to the console',
		type: 'string'
	})
	.option('mode', {
		alias: 'm',
		describe: 'use http or https',
		choices: ['http', 'https']
	})
	.option('port', {
		alias: 'p',
		describe: 'sets the server port to use',
		type: 'number'
	})
	.option('type', {
		alias: 't',
		describe: 'start a predefined service',
		type: 'array'
	})
	.option('typescript', {
		alias: 'tsConfig',
		describe: 'use ts-node to load externals',
		type: 'boolean'
	}).argv;

function defaultConfig(): Config {
	if (argv.config) {
		throw new Error(`Config ${argv.config} not found`);
	}

	const serverConfig: Server = {
		services: []
	};

	if (!argv.type) {
		const fileServiceConfig: FileConfig & ServiceConfig = {
			name: 'file',
			routes: {
				'*': '.'
			}
		};
		serverConfig.services.push(fileServiceConfig);
	}

	return {
		servers: [serverConfig]
	};
}

function getConfig(name: string, ...options: string[]) {
	switch (name) {
		case 'crud':
			return {
				route: '*'
			};
		case 'proxy':
			return {
				target: options[0]
			};
		case 'file':
			return {
				paths: {
					'*': options[0]
				}
			};
		case 'upload':
			return {
				route: '*',
				directory: options[0]
			};
		case 'log':
			return {
				respondOk: true
			};
			break;
		default:
			return {};
	}
}

export async function run() {
	const loadedConfig = await loadConfig(argv.config);
	const config = loadedConfig ? loadedConfig.config : defaultConfig();
	const workingDirectory = loadedConfig ? dirname(loadedConfig.configPath) : process.cwd();
	const server = config.servers[0];

	if (config.servers.length > 1 && (argv.type || argv.port || argv.mode)) {
		console.warn('Multiple servers defined. Command line arguments will apply to the first server.');
	}

	argv.log && (config.logLevel = argv.log);

	if (argv.type) {
		const [name, options] = argv.type.map((val) => String(val));
		server.services.push({
			name,
			...getConfig(name, options)
		});
	}

	argv.port && (server.port = argv.port);
	argv.mode && (server.type = argv.mode as 'http' | 'https');

	return start(config, { configPath: workingDirectory });
}

run().catch((err: Error) => {
	console.error('failed to start webserv');
	console.error(`reason: ${err.message}`);
	console.error(err.stack);
	process.exitCode = 1;
	process.exit();
});
