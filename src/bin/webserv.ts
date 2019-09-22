#!/usr/bin/env node

import createServer, { ServerType, Config } from '../configuration/createServer';
import * as yargs from 'yargs';
import { join } from 'path';
import WebProxy from '../core/middleware/WebProxy';
import { loadConfiguration } from '../configuration/loader';

const argv = yargs
	.option('config', {
		alias: 'c',
		describe: 'select a configuration file',
		type: 'string'
	})
	.option('folder', {
		alias: 'f',
		describe: 'serves this folder',
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
		default: 8888,
		type: 'number'
	})
	.option('proxy', {
		describe: 'create a proxy to an external url',
		type: 'string'
	})
	.option('server', {
		alias: 's',
		describe: 'starts a server defined in the configuration',
		type: 'string'
	})
	.option('showConfig', {
		describe: 'prints the config to the console before starting',
		type: 'boolean'
	})
	.argv;

const config: Config = {
	... (argv.config ? loadConfiguration(argv.config, argv.server) : {}),
	port: argv.port,
	type: argv.mode === 'https' ? ServerType.HTTPS : ServerType.HTTP
};

if (argv.folder) {
	config.directory = join(process.cwd(), argv.folder);
}
if (argv.proxy) {
	const wsProxy = new WebProxy(argv.proxy, {
		changeOrigin: true,
		ws: true
	});
	config.middleware = [ wsProxy ];
	config.upgrade = wsProxy;
}
else if (!argv.folder) {
	config.directory = process.cwd();
}

/**
 * Basic CLI support used to start a server that serves files and a directory index of the current directory
 */
export async function run() {
	if (argv.showConfig) {
		console.log(config);
	}
	const server = await createServer(config);
	server.start();
	console.log(`started server on ${server.port}`);
}

run().catch((err: Error) => {
	console.error('failed to start webserv');
	console.error(`reason: ${ err.message }`);
	console.error(err.stack);
	process.exitCode = 1;
	process.exit();
});
