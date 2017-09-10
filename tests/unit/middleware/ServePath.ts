import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import * as mockery from 'mockery';
import { SinonStub, stub } from 'sinon';
import { IncomingMessage, ServerResponse } from 'http';
import { createMockSend, loadMockModule } from '../_support/mocks';
import ServePath from 'src/middleware/ServePath';

// tslint:disable
let Middleware: typeof ServePath;
let sendStub: SinonStub;
let mockfs: {
	statSync: SinonStub
};

registerSuite('src/middleware/ServePath', {
	async before() {
		sendStub = createMockSend();
		mockfs = {
			statSync: stub()
		};
		Middleware = await loadMockModule('src/middleware/ServePath', {
			send: sendStub,
			fs: mockfs
		});
	},

	afterEach() {
		sendStub.reset();
		(<any> sendStub).on.reset();
		(<any> sendStub).pipe.reset();
		mockfs.statSync.reset();
	},

	after() {
		mockery.disable();
	},

	tests: {
		handle: {
			'serving a file always returns the file'() {
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
				const middleware = new Middleware({
					basePath: 'root'
				});
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isTrue(sendStub.calledOnce);
				assert.strictEqual(sendStub.firstCall.args[1], '');
				assert.isTrue(sendStub().on.called);
				sendStub().on.firstCall.args[1]();

				return promise;
			}
		}
	}
});
