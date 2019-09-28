#!/usr/bin/env node
import { RequestListener } from 'http';
import { createRequestHandler } from 'src/core/app';
import { Process, Upgrader } from 'src/core/interface';
import { logRequest } from 'src/core/processors/log.processor';
import { fileBrowser } from 'src/core/routes/fileBrowser.route';
import { proxyRoute } from 'src/core/routes/proxy.route';
import { route } from 'src/core/routes/route';
import { startHttpServer } from 'src/core/servers/createHttpServer';
import { startHttpsServer } from 'src/core/servers/createHttpsServer';
import * as yargs from 'yargs';

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
	}).argv;

export async function start() {
	const before: Process[] = [];
	let onRequest: RequestListener;
	let onUpgrade: Upgrader | undefined;

	if (argv.log) {
		before.push(logRequest({}))
	}

	if (argv.proxy) {
		const proxy = proxyRoute({ target: argv.proxy });
		onRequest = createRequestHandler(route({
			middleware: proxy.middleware
		}));
		onUpgrade = proxy.upgrader;
	}
	else {
		onRequest = createRequestHandler(fileBrowser({}))
	}

	if (argv.mode === 'https') {
		return startHttpsServer({
			port: argv.port,
			onRequest,
			onUpgrade
		});
	}
	else {
		return startHttpServer({
			port: argv.port,
			onRequest,
			onUpgrade
		})
	}
}

async function run() {
	await start();
	console.log(`server started on port ${argv.port}`);
}

run().catch((err: Error) => {
	console.error('failed to start webserv');
	console.error(`reason: ${err.message}`);
	console.error(err.stack);
	process.exitCode = 1;
	process.exit();
});
