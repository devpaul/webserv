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
	return await toString(incomingMessage);
}

async function assertHttpError(directory: string, request: RequestOptions, statusCode: string): Promise<any> {
	return assertTestHtml(directory, request)
		.then(assert.fail, (error: Error) => {
			assert.include(error.message, statusCode);
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
			return assertTestHtml(join(root, 'test.html'), {})
				.then((html) => {
					assert.include(html, 'test');
				});
		},

		'serve files from a directory'() {
			return assertTestHtml(root, {
				path: '/test.html'
			}).then((html) => {
				assert.include(html, 'test');
			});
		},

		async 'ignore query strings'() {
			return assertTestHtml(root, {
				path: '/test.html?hello=there'
			}).then((html) => {
				assert.include(html, 'test');
			});
		},

		async 'serve files from child directory'() {
			return assertTestHtml(root, {
				path: '/directory/index.html'
			}).then((html) => {
				assert.include(html, 'Title');
			});
		},

		async 'does not serve parent directory file'() {
			return assertHttpError(join(root, 'directory'), {
				path: '/../test.html'
			}, '403');
		}
	}
});
