import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import createServer from 'src/commands/createServer';
import { join } from 'path';
import fetch from './_support/fetch';
import { toString } from './_support/stream';
import { BasicServer } from 'src/servers/BasicServer';
import { RequestOptions } from 'http';

let server: BasicServer;
const debugLevel = 'info';
const root = join(__dirname, 'assets');

async function assertTestHtml(directory: string, request: RequestOptions) {
	server = await createServer({
			debugLevel,
			directory,
			start: true
		});
	request = Object.assign({
		hostname: 'localhost',
		port: server.port
	}, request);

	const incomingMessage = await fetch(request);
	const html = await toString(incomingMessage);

	assert.include(html, 'test');
}

async function assertHttpError(directory: string, request: RequestOptions, statusCode: string): Promise<any> {
	server = await createServer({
		debugLevel,
		directory,
		start: true
	});
	request = Object.assign({
		hostname: 'localhost',
		port: server.port
	}, request);

	return fetch(request)
		.then(assert.fail, (error: Error) => {
			assert.include(error.message, statusCode);
			return;
		});
}

registerSuite('integration: ServePath', {
	async afterEach() {
		if (server) {
			await server.stop();
		}
	},

	tests: {
		'serve a single file'() {
			return assertTestHtml(join(root, 'test.html'), {});
		},

		'serve files from a directory'() {
			return assertTestHtml(root, {
				path: '/test.html'
			});
		},

		async 'ignore query strings'() {
			return assertTestHtml(root, {
				path: '/test.html?hello=there'
			});
		},

		async 'does not serve parent directory file'() {
			return assertHttpError(join(root, 'directory'), {
				path: '/../test.html'
			}, '403');
		}
	}
});
