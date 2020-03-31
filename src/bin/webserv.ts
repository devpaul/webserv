#!/usr/bin/env node
import { dirname } from 'path';
import { FileConfig } from 'src/config/services/file';
import { LogConfig } from 'src/config/services/log';
import * as yargs from 'yargs';
import start, { Config, loadConfig, ServiceConfig } from '../config';

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
	}).argv;

function defaultConfig() {
	if (argv.config) {
		throw new Error(`Config ${argv.config} not found`);
	}

	const config: Config = {
		services: []
	};

	if (!argv.type) {
		const fileServiceConfig: FileConfig & ServiceConfig = {
			name: 'file',
			paths: {
				'*': '.'
			}
		};
		config.services.push(fileServiceConfig);
	}

	return config;
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
	config.services = config.services || [];
	const { services } = config;

	if (argv.log != null) {
		const logConfig: LogConfig & ServiceConfig = {
			name: 'log',
			level: argv.log || 'info'
		};
		services.unshift(logConfig);
	}

	if (argv.type) {
		const [name, options] = argv.type.map((val) => String(val));
		services.push({
			name,
			...getConfig(name, options)
		});
	}

	const serverConfig = Object.assign({}, config, argv);
	return start(serverConfig, { workingDirectory });
}

run().catch((err: Error) => {
	console.error('failed to start webserv');
	console.error(`reason: ${err.message}`);
	console.error(err.stack);
	process.exitCode = 1;
	process.exit();
});
