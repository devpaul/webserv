import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import ServeFile from 'src/middleware/ServeFile';
import createServer from 'src/commands/createServer';
import { join } from 'path';
import fetch from './_support/fetch';
import { toString } from './_support/stream';
import { BasicServer } from 'src/servers/BasicServer';

let server: BasicServer;
const debugLevel = 'info';

registerSuite('integration: ServeFile', {
	async afterEach() {
		if (server) {
			await server.stop();
		}
	},

	tests: {
		async 'serve a single file'() {
			server = await
				createServer({
					debugLevel,
					middleware: [
						new ServeFile(join(__dirname, 'assets/test.html'))
					],
					start: true
				});

			const incomingMessage = await
				fetch({
					hostname: 'localhost',
					port: server.port
				});

			const html = await
				toString(incomingMessage);

			assert.include(html, 'test');
		},

		async 'serve files from a directory'() {
			server = await
				createServer({
					debugLevel,
					middleware: [
						new ServeFile(join(__dirname, 'assets'))
					],
					start: true
				});

			const incomingMessage = await
				fetch({
					hostname: 'localhost',
					path: '/test.html',
					port: server.port
				});

			const html = await
				toString(incomingMessage);

			assert.include(html, 'test');
		},

		async 'ignore query strings'() {
			server = await
				createServer({
					debugLevel,
					middleware: [
						new ServeFile(join(__dirname, 'assets'))
					],
					start: true
				});

			const incomingMessage = await
				fetch({
					hostname: 'localhost',
					path: '/test.html?hello=there',
					port: server.port
				});

			const html = await
				toString(incomingMessage);

			assert.include(html, 'test');
		},

		async 'does not serve parent directory file'() {
			server = await
				createServer({
					debugLevel,
					middleware: [
						new ServeFile(join(__dirname, 'assets'))
					],
					start: true
				});

			const incomingMessage = await
				fetch({
					hostname: 'localhost',
					path: '/../all.js',
					port: server.port
				});

			const html = await
				toString(incomingMessage);

			assert.include(html, 'test');
		}
	}
});
