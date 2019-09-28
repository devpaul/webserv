#!/usr/bin/env node
import * as yargs from 'yargs';
import { App } from '../core/app';
import { logRequest } from '../core/processors/log.processor';
import { fileBrowser } from '../core/routes/fileBrowser.route';
import { proxyRoute } from '../core/routes/proxy.route';
import { route } from '../core/routes/route';
import { body } from '../core/processors/body.processor';

const argv = yargs
	.option('folder', {
		alias: 'f',
		describe: 'serves this folder',
		type: 'string'
	})
	.options('log', {
		alias: 'l',
		describe: 'display all logs to the console'
	})
	.option('mode', {
		alias: 'm',
		describe: 'use http or https',
		choices: ['http', 'https'],
		default: 'http'
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
	}).argv;

export async function start() {
	const app = new App();

	if (argv.log) {
		app.before.push(body({}), logRequest({ logBody: true }));
	}

	if (argv.proxy) {
		const proxy = proxyRoute({ target: argv.proxy });
		app.routes.push(route({
			middleware: proxy.middleware
		}))
		app.upgrader = proxy.upgrader;
	}
	else {
		app.routes.push(fileBrowser({}));
	}

	return app.start(argv.mode as any, {
		port: argv.port
	});
}

start().catch((err: Error) => {
	console.error('failed to start webserv');
	console.error(`reason: ${err.message}`);
	console.error(err.stack);
	process.exitCode = 1;
	process.exit();
});
