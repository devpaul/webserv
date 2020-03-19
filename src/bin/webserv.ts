#!/usr/bin/env node
import * as yargs from 'yargs';

import { bootConfig, bootService, startServer } from '../config';
import { bootFileService } from '../config/services/file';
import { bootLogService } from '../config/services/log';
import { App } from '../core/app';

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
		choices: ['http', 'https', 'ngrok']
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

export async function start() {
	const app = new App();
	const basePath = process.cwd();

	if (argv.log != null) {
		app.add(await bootLogService({ level: argv.log || 'info' }));
	}

	if (argv.type) {
		const [name, options] = argv.type.map((val) => String(val));
		const config = {
			name,
			...getConfig(name, options)
		};
		bootService(app, config, basePath);
	}

	const config = await bootConfig(argv.config, app);
	if (!config) {
		if (argv.config) {
			throw new Error(`Config ${argv.config} not found`);
		}
		if (!argv.type) {
			app.add(
				await bootFileService(
					{
						paths: { '*': '.' }
					},
					{ configPath: basePath, properties: {} }
				)
			);
		}
	}
	const serverConfig = Object.assign({}, config, argv);
	return startServer(app, serverConfig);
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

start().catch((err: Error) => {
	console.error('failed to start webserv');
	console.error(`reason: ${err.message}`);
	console.error(err.stack);
	process.exitCode = 1;
	process.exit();
});
