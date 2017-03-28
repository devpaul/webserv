import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import ServeFile from 'src/middleware/ServeFile';
import * as mockery from 'mockery';
import { stub, SinonStub } from 'sinon';
import { IncomingMessage } from 'http';
import { ServerResponse } from 'http';
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

// tslint:disable
let Middleware: typeof ServeFile;
let sendStub: SinonStub;
let mockfs: {
	statSync: SinonStub
};

registerSuite({
	name: 'src/middleware/ServeFile',

	setup() {
		sendStub = <any> stub();
		mockfs = {
			statSync: stub()
		};
		mockery.enable({
			warnOnUnregistered: false
		});
		mockery.registerMock('send', sendStub);
		mockery.registerMock('fs', mockfs);
		return new Promise(function (resolve) {
			require([ require.toUrl('src/middleware/ServeFile') ], function (Module) {
				Middleware = <any> Module.default;
				resolve();
			});
		})
	},

	beforeEach() {
		sendStub.reset();
		sendStub.returns({
			on: stub().returns( { pipe: stub() })
		});
		mockfs.statSync.reset();
	},

	teardown() {
		mockery.disable();
	},

	handle: {
		path() {
			const request: Partial<IncomingMessage> = {
				url: 'http://localhost:1234/test/webserv.html?query=param1&queryparam=2'
			};
			const response: Partial<ServerResponse> = {
				end: stub()
			};
			mockfs.statSync.returns({
				isDirectory() { return false; }
			});
			const middleware = new Middleware('root');
			middleware.handle(<IncomingMessage> request, <ServerResponse> response);

			assert.isTrue(sendStub.calledOnce);
			assert.strictEqual(sendStub.firstCall.args[1], 'root/test/webserv.html');
			assert.isTrue(sendStub().on.calledOnce);
			sendStub().on.firstCall.args[1]();
		}
	}
});
