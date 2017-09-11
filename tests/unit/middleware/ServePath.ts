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
	existsSync: SinonStub;
	readdir: SinonStub;
	statSync: SinonStub;
};

const request: Partial<IncomingMessage> = {
	url: 'http://localhost:1234/test/webserv.html?query=param1&queryparam=2'
};

registerSuite('src/middleware/ServePath', {
	async before() {
		sendStub = createMockSend();
		mockfs = {
			existsSync: stub(),
			readdir: stub(),
			statSync: stub()
		};
		Middleware = await loadMockModule('src/middleware/ServePath', {
			fs: mockfs,
			send: sendStub
		});
	},

	afterEach() {
		sendStub.reset();
		(<any> sendStub).on.reset();
		(<any> sendStub).pipe.reset();
		mockfs.statSync.reset();
		mockfs.existsSync.reset();
		mockfs.readdir.reset();
	},

	after() {
		mockery.disable();
	},

	tests: {
		constructor: {
			'string options parameter'() {
				mockfs.statSync.returns({
					isFile() { return true }
				});
				const middleware = new Middleware('test');
				assert.strictEqual(middleware.basePath, 'test');
			}
		},

		handle: {
			'basePath is a file; only serves file'() {
				const response: Partial<ServerResponse> = {
					finished: false,
					end: stub()
				};
				mockfs.statSync.returns({
					isFile() { return true }
				});
				mockfs.existsSync.returns(true);
				const middleware = new Middleware({
					basePath: 'root'
				});
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isTrue(sendStub.calledOnce);
				assert.strictEqual(sendStub.firstCall.args[1], '');
				assert.isTrue(sendStub().on.called);
				sendStub().on.firstCall.args[1]();

				return promise;
			},

			'response is finished; returns immediately'() {
				const response: Partial<ServerResponse> = {
					finished: true
				};
				mockfs.statSync.returns({
					isFile() { return false }
				});
				const middleware = new Middleware({ basePath: 'root' });
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isFalse(sendStub.called);
				return promise;
			},

			'target file does not exists; returns immediately'() {
				const response: Partial<ServerResponse> = {
					finished: false
				};
				mockfs.statSync.returns({
					isFile() { return false }
				});
				mockfs.existsSync.returns(false);
				const middleware = new Middleware({ basePath: 'root' });
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isFalse(sendStub.called);
				return promise;
			},

			'on error; rejects'() {
				const response: Partial<ServerResponse> = {
					finished: false,
					end: stub()
				};
				mockfs.statSync.returns({
					isFile() { return true }
				});
				mockfs.existsSync.returns(true);
				const middleware = new Middleware({
					basePath: 'root'
				});
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isTrue(sendStub.calledOnce);
				assert.strictEqual(sendStub.firstCall.args[1], '');
				assert.isTrue(sendStub().on.called);
				sendStub().on.secondCall.args[1]();

				return promise.then(assert.fail, () => { /* expected */ });
			},

			'serve directory; lists contents'() {
				const writeStub = stub();
				const response: Partial<ServerResponse> = {
					finished: false,
					end: stub(),
					write: writeStub
				};
				mockfs.statSync.returns({
					isFile() { return false }
				});
				mockfs.existsSync.returns(true);
				const middleware = new Middleware({
					basePath: 'root'
				});
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isTrue(sendStub.calledOnce);
				assert.strictEqual(sendStub.firstCall.args[1], 'test/webserv.html');
				assert.isTrue(sendStub().on.called);
				sendStub().on.thirdCall.args[1](response);
				assert.isTrue(mockfs.readdir.calledOnce);
				mockfs.readdir.firstCall.args[1](null, [ 'file' ]);
				assert.include(writeStub.firstCall.args[0], 'test');

				return promise;
			}
		}
	}
});
