/// <reference types="intern" />

import { createSandbox } from 'sinon';
import { startHttpServer } from '../../src/core/servers/createHttpServer';
import { fileBrowser } from '../../src/core/routes/fileBrowser.route';
import { ServerControls } from '../../src/core/servers/startServer';
import fetch from 'node-fetch';
import { isHttpError } from '../../src/core/HttpError';
import { setLogLevel } from '../../src/core/log';
import { join } from 'path';
import { detectEol } from './_support/eol';
import { ErrorRequestHandler, createRequestHandler } from '../../src/core/servers/createRequestHandler';

const { assert } = intern.getPlugin('chai');
const { describe, it, before, beforeEach, after } = intern.getPlugin('interface.bdd');

let EOL = detectEol();
const CR = '\n';

describe('serve tests', () => {
	const sinon = createSandbox();
	let controls: ServerControls | undefined;

	before(async () => {
		setLogLevel('debug');
		const errorHandler: ErrorRequestHandler = (err, response) => {
			if (isHttpError(err)) {
				response.statusCode = err.statusCode;
				response.end();
			} else {
				console.log('unknown error', err);
				throw err;
			}
		};
		const route = fileBrowser({
			basePath: join(__dirname, '_assets/sample1')
		});
		controls = await startHttpServer({
			port: 3001,
			onRequest: createRequestHandler(route, errorHandler)
		});
	});

	beforeEach(() => {
		sinon.resetHistory();
	});

	after(() => {
		setLogLevel('error');
		controls && controls.stop();
		sinon.restore();
	});

	it('displays a directory listing', async () => {
		const result = await fetch('http://localhost:3001/child/');
		const expected =
			`${CR}\t\t<html>${CR}\t\t<head>${CR}\t\t\t<title>Directory listing</title>${CR}\t\t</head>${CR}\t\t` +
			`<body>${CR}\t\t\t<a href="/child/1.txt">1.txt</a><br>` +
			`<a href="/child/2.txt">2.txt</a><br>` +
			`<a href="/child/directory with spaces">directory with spaces</a><br>` +
			`<a href="/child/file with a space.txt">file with a space.txt</a>${CR}` +
			`\t\t</form>${CR}\t\t</body>` +
			`${CR}\t\t</html>${CR}\t\t`;

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), expected);
	});

	it('sends a file', async () => {
		const result = await fetch('http://localhost:3001/child/1.txt');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), `one${EOL}`);
	});

	it('returns index.html', async () => {
		const result = await fetch('http://localhost:3001/');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), `<html></html>;${EOL}`);
	});

	it('finds the first extensions', async () => {
		const result = await fetch('http://localhost:3001/js/index');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), `ok${EOL}`);
	});

	it('finds esm module extensions', async () => {
		const result = await fetch('http://localhost:3001/js/main');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), `console.log('Hello world');${EOL}`);
	});

	it('handles url encoded file with a space', async () => {
		const result = await fetch('http://localhost:3001/child/file%20with%20a%20space.txt');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), `file with a space${EOL}`);
	});

	it('handles directories with a space', async () => {
		const result = await fetch('http://localhost:3001/child/directory%20with%20spaces/file.txt');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), `file in a directory with a space${EOL}`);
	});
});
