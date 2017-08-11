import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import ServeFile from 'src/middleware/ServeFile';
import createServer from 'src/commands/createServer';
import { join } from 'path';
import fetch from './_support/fetch';
import { toString } from './_support/stream';

registerSuite({
	name: 'src/middleware/ServeFile',

	async 'serve files from a directory'() {
		const server = await createServer({
			middleware: [
				new ServeFile(join(__dirname, 'assets'))
			],
			start: true
		});

		const html = await toString(await fetch({
			hostname: 'localhost',
			port: server.port
		}));

		assert.include(html, 'test');

		await server.stop();
	},

	async 'serve a single file'() {

	},

	async 'does not serve parent directory file'() {

	}
});
