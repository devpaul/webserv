import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import ServeFile from 'src/middleware/ServeFile';
import * as mockery from 'mockery';
import { stub, SinonStub } from 'sinon';
import { IncomingMessage } from 'http';
import { ServerResponse } from 'http';
import { resolve } from 'path';
import { loadMockModule } from '../_support/mocks';

// tslint:disable
let Middleware: typeof ServeFile;
let sendStub: SinonStub;
let mockfs: {
	statSync: SinonStub
};

registerSuite('src/middleware/ServeFile', {
	async before() {
		sendStub = <any> stub();
		mockfs = {
			statSync: stub()
		};
		Middleware = await loadMockModule('src/middleware/ServeFile', {
			send: sendStub,
			fs: mockfs
		});
	},

	beforeEach() {
		sendStub.reset();
		sendStub.returns({
			on: stub().returns( { pipe: stub() })
		});
		mockfs.statSync.reset();
	},

	after() {
		mockery.disable();
	},

	tests: {
		handle: {
			path() {
				const request: Partial<IncomingMessage> = {
					url: 'http://localhost:1234/test/webserv.html?query=param1&queryparam=2'
				};
				const response: Partial<ServerResponse> = {
					end: stub()
				};
				mockfs.statSync.returns({
					isDirectory() { return false; },
					isFile() { return true }
				});
				const middleware = new Middleware('root');
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isTrue(sendStub.calledOnce);
				assert.strictEqual(sendStub.firstCall.args[1], resolve(process.cwd(), 'root/test/webserv.html'));
				assert.isTrue(sendStub().on.calledOnce);
				sendStub().on.firstCall.args[1]();

				return promise;
			}
		}
	}
});
