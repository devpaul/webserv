import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import ServeFile from 'src/middleware/ServeFile';
import createServer from 'src/commands/createServer';
import { join, resolve } from 'path';
import fetch from './_support/fetch';
import { toString } from './_support/stream';
import { BasicServer } from 'src/servers/BasicServer';

// TODO fix this w/ Intern 4
const dir = /* __dirname || */ resolve(process.cwd(), './_dist/tests/integration');

let server: BasicServer;

registerSuite({
	name: 'src/middleware/ServeFile',

	async afterEach() {
		if (server) {
			await server.stop();
		}
	},

	async 'serve a single file'() {
		server = await createServer({
			debugLevel: 'debug',
			middleware: [
				new ServeFile(join(dir, 'assets/test.html'))
			],
			start: true
		});

		const incomingMessage = await fetch({
			hostname: 'localhost',
			port: server.port
		});

		const html = await toString(incomingMessage);

		assert.include(html, 'test');
	},

	async 'serve files from a directory'() {
		server = await createServer({
			debugLevel: 'debug',
			middleware: [
				new ServeFile(join(dir, 'assets'))
			],
			start: true
		});

		const incomingMessage = await fetch({
			hostname: 'localhost',
			path: '/test.html',
			port: server.port
		});

		const html = await toString(incomingMessage);

		assert.include(html, 'test');
	},

	async 'ignore query strings'() {
		server = await createServer({
			debugLevel: 'debug',
			middleware: [
				new ServeFile(join(dir, 'assets'))
			],
			start: true
		});

		const incomingMessage = await fetch({
			hostname: 'localhost',
			path: '/test.html?hello=there',
			port: server.port
		});

		const html = await toString(incomingMessage);

		assert.include(html, 'test');
	},

	async 'does not serve parent directory file'() {
		server = await createServer({
			debugLevel: 'debug',
			middleware: [
				new ServeFile(join(dir, 'assets'))
			],
			start: true
		});

		const incomingMessage = await fetch({
			hostname: 'localhost',
			path: '/../all.js',
			port: server.port
		});

		const html = await toString(incomingMessage);

		assert.include(html, 'test');
	}
});
