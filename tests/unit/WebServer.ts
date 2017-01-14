import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import WebServer, { Server } from 'src/WebServer';
import WebApplication from 'src/WebApplication';
import { Handler } from 'src/handlers/Handler';
import * as sinon from 'sinon';

registerSuite({
	name: 'src/WebServer',

	construction: {
		'default construction'() {
			const server = new WebServer();

			assert.instanceOf(server.app, WebApplication);
			assert.property(server.config, 'type');
			assert.property(server.config, 'port');
		},

		'passed variables'() {
			const handler: Handler = <any> {
				handler: sinon.stub()
			};
			const server = new Server(handler, {
				type: 'http',
				port: '3345'
			});

			assert.equal(server.app, handler);
			assert.equal(server.config.type, 'http');
			assert.equal(server.config.port, '3345');
		}
	},

	start() {
		const server = new WebServer();
		const listenMethod = sinon.spy(function (_port: string, resolve: Function) {
			resolve();
		});
		server['_server'] = {
			listen: listenMethod
		};
		return server.start().then(function () {
			assert.isTrue(listenMethod.called);
		});
	},

	stop() {
		const server = new WebServer();
		const closeMethod = sinon.stub();
		server['_server'] = {
			close: closeMethod
		};
		server.stop();
		assert.isTrue(closeMethod.calledOnce);
		assert.isNull(server['_server']);
	}
});
