#!/usr/bin/env node
import { resolve } from 'path';
import * as yargs from 'yargs';

import { App } from '../core/app';
import { response } from '../core/middleware/response';
import { body } from '../core/processors/body.processor';
import { logRequest } from '../core/processors/log.processor';
import { crudRoute } from '../core/routes/crud.route';
import { fileBrowser } from '../core/routes/fileBrowser.route';
import { proxyRoute } from '../core/routes/proxy.route';
import { route } from '../core/routes/route';
import { uploadRoute } from '../core/routes/upload.route';
import { startNgrok } from './addons/ngrok';
import { configExists, loadConfig } from './config';
import { setLogLevel } from '../core/log';

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
		choices: ['http', 'https', 'ngrok'],
		default: 'http'
	})
	.option('port', {
		alias: 'p',
		describe: 'sets the server port to use',
		default: 8888,
		type: 'number'
	})
	.option('type', {
		alias: 't',
		describe: 'start a predefined service',
		type: 'array'
	}).argv;

export async function start() {
	const app = new App();

	if (argv.log != null) {
		setLogLevel(argv.log || 'info');
		app.before.push(body({}), logRequest({ logBody: true }));
	}

	if (argv.config) {
		loadConfig(app, resolve(argv.config));
	} else {
		const defaultConfigPath = resolve('./webserv.json');
		if (await configExists(defaultConfigPath)) {
			loadConfig(app, defaultConfigPath);
		}
	}

	if (argv.type) {
		addService(app, argv.type.map((val) => String(val)));
	} else if (!argv.config) {
		addFileService(app, ['file']);
	}

	const mode = argv.mode === 'https' ? 'https' : 'http';
	const controls = await app.start(mode, {
		port: argv.port
	});

	if (argv.mode === 'ngrok') {
		await startNgrok(argv.port);
	}

	return controls;
}

function addService(app: App, options: string[]) {
	switch (options[0]) {
		case 'crud':
			app.routes.push(crudRoute({}));
			break;
		case 'proxy':
			addProxyService(app, options);
			break;
		case 'file':
			addFileService(app, options);
			break;
		case 'upload':
			const directory = String(argv.type[1]);
			app.routes.push(uploadRoute({ directory }));
			break;
		case 'log':
			if (!argv.log) {
				app.before.push(body({}), logRequest({ logBody: true }));
			}
			app.routes.push(route({ middleware: response({ statusCode: 200 }) }));
			break;
		default:
			if (!argv.config) {
				throw new Error(`unknown server type ${argv.type[0]}`);
			}
	}
}

function addFileService(app: App, [, basePath = process.cwd()]: string[]) {
	app.routes.push(fileBrowser({ basePath }));
}

function addProxyService(app: App, [, target]: string[]) {
	const proxy = proxyRoute({
		target,
		changeOrigin: true,
		followRedirects: false,
		ws: true
	});
	app.routes.push(
		route({
			middleware: proxy.middleware
		})
	);
	app.upgrader = proxy.upgrader;
}

start().catch((err: Error) => {
	console.error('failed to start webserv');
	console.error(`reason: ${err.message}`);
	console.error(err.stack);
	process.exitCode = 1;
	process.exit();
});
