import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import HttpsServer from 'src/servers/HttpsServer';
import { Handler } from 'src/handlers/Handler';
import { stub } from 'sinon';
import { createMockServer } from '../_support/mocks';
import { ServerState } from 'src/servers/BasicServer';

let handler: Handler;
let server: HttpsServer<Handler>;
let mockServer: any;

registerSuite({
	name: 'src/servers/HttpServer',

	beforeEach() {
		handler = {
			handle: stub()
		};
		server = new HttpsServer({
			port: 1234
		}, handler);
		mockServer = createMockServer();
		stub(server, 'createServer', () => {
			return mockServer;
		});
	},

	construction() {
		assert.strictEqual(server.port, 1234);
		assert.strictEqual(server.app, handler);
		assert.strictEqual(server.type, 'https');
	},

	async start() {
		await server.start();
		assert.isTrue(mockServer.listen.calledOnce);
		assert.strictEqual(server.state, ServerState.LISTENING);
	},

	async stop() {
		await server.start();
		assert.strictEqual(server.state, ServerState.LISTENING);
		await server.stop();
		assert.isTrue(mockServer.close.calledOnce);
		assert.strictEqual(server.state, ServerState.STOPPED);
		assert.isNull(server['_server']);
	}
});
