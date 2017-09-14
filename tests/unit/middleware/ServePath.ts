import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import * as mockery from 'mockery';
import { SinonStub, stub } from 'sinon';
import { IncomingMessage, ServerResponse } from 'http';
import { createMockSend, loadMockModule } from '../_support/mocks';
import ServePath from 'src/middleware/ServePath';
import { sep } from 'path';

// tslint:disable
let Middleware: typeof ServePath;
let sendStub: SinonStub;
let mockfs: {
	existsSync: SinonStub;
	readdir: SinonStub;
	statSync: SinonStub;
};
let response: Partial<ServerResponse>;
let request: Partial<IncomingMessage>;

function assertFileSent(path: string) {
	assert.isTrue(sendStub.calledOnce);
	assert.strictEqual(sendStub.firstCall.args[1], path);
	(<any> sendStub).on.firstCall.args[1]();
	assert.isTrue((<SinonStub> response.end).calledOnce);
}

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

	beforeEach() {
		request = {
			url: 'http://localhost:1234/test/webserv.html?query=param1&queryparam=2'
		};
		response = {
			end: stub(),
			finished: false,
			setHeader: stub(),
			write: stub(),
		};
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
			'response is finished; returns immediately'() {
				response.finished = true;
				const middleware = new Middleware({ basePath: 'root' });
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isFalse(sendStub.called);
				return promise;
			},

			'target file does not exists; returns immediately'() {
				mockfs.existsSync.returns(false);
				const middleware = new Middleware({ basePath: 'root' });
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isFalse(sendStub.called);
				return promise;
			},

			'serve directory; lists contents'() {
				request.url = 'http://example.org/test/';
				mockfs.statSync.returns({
					isDirectory() { return true; },
					isFile() { return false; }
				});
				mockfs.existsSync.returns(true);
				const middleware = new Middleware({
					basePath: 'root'
				});
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isFalse(sendStub.calledOnce);
				assert.isTrue(mockfs.readdir.calledOnce);
				mockfs.readdir.firstCall.args[1](null, [ 'file' ]);
				assert.include((<SinonStub> response.write).firstCall.args[0], 'test');

				return promise;
			},

			'missing trailing slash; redirects'() {
				request.url = 'http://example.org/test';
				mockfs.statSync.returns({
					isDirectory() { return true; },
					isFile() { return false; }
				});
				mockfs.existsSync.returns(true);
				const middleware = new Middleware({
					basePath: 'root'
				});
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assert.isFalse(sendStub.calledOnce);
				assert.isFalse(mockfs.readdir.calledOnce);
				assert.strictEqual(response.statusCode, 301);
				assert.strictEqual((<SinonStub> response.setHeader).firstCall.args[1], request.url + '/');

				return promise;
			},

			'directory with default file; serves file'() {
				request.url = 'http://example.org/test/';
				mockfs.statSync.returns({
					isDirectory() { return true; },
					isFile() { return true; }
				});
				mockfs.existsSync.returns(true);
				const middleware = new Middleware({
					basePath: 'root'
				});
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assertFileSent(`root${ sep }test${ sep }index.html`);
				return promise;
			},

			'file url; serves file'() {
				mockfs.statSync.returns({
					isDirectory() { return false; },
					isFile() { return true; }
				});
				mockfs.existsSync.returns(true);
				const middleware = new Middleware({
					basePath: 'root'
				});
				const promise = middleware.handle(<IncomingMessage> request, <ServerResponse> response);

				assertFileSent(`root${ sep }test${ sep }webserv.html`);
				return promise;
			}
		}
	}
});
