/// <reference types="intern" />

import { createSandbox } from 'sinon';
import { startHttpServer } from '../../src/core/servers/createHttpServer';
import { createRequestHandler, ErrorRequestHandler } from '../../src/core/app';
import { fileBrowser } from '../../src/core/routes/fileBrowser.route';
import { ServerControls } from '../../src/core/servers/startServer';
import fetch from 'node-fetch';
import { isHttpError } from '../../src/core/HttpError';
import { setLogLevel } from '../../src/core/log';
import { join } from 'path';

const { assert } = intern.getPlugin('chai');
const { describe, it, before, beforeEach, after } = intern.getPlugin('interface.bdd');

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
			'\n\t\t<html>\n\t\t<head>\n\t\t\t<title>Directory listing</title>\n\t\t</head>\n\t\t<body>\n\t\t\t<a href="/child/1.txt">1.txt</a><br><a href="/child/2.txt">2.txt</a>\n\t\t</form>\n\t\t</body>\n\t\t</html>\n\t\t';

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), expected);
	});

	it('sends a file', async () => {
		const result = await fetch('http://localhost:3001/child/1.txt');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), 'one\n');
	});

	it('returns index.html', async () => {
		const result = await fetch('http://localhost:3001/');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), '<html></html>;\n');
	});

	it('finds the first extensions', async () => {
		const result = await fetch('http://localhost:3001/js/index');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), 'ok\n');
	});

	it('finds esm module extensions', async () => {
		const result = await fetch('http://localhost:3001/js/main');

		assert.strictEqual(result.status, 200);
		assert.strictEqual(await result.text(), "console.log('Hello world');\n");
	});
});
