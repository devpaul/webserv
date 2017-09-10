import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import route from 'src/handlers/route';
import { Handler, HandlerFunction } from 'src/handlers/Handler';
import * as sinon from 'sinon';
import { FilterFunction } from 'src/handlers/filter';
import { Transform } from 'src/handlers/transform';
import { IncomingMessage, ServerResponse } from 'http';
import { createMockRequest, createMockResponse } from '../_support/mocks';

type Target = Handler | HandlerFunction | Array<Handler | HandlerFunction>;

function createTests(factory: () => Target) {
	let filter: FilterFunction & sinon.SinonSpy;
	let transform: Transform & sinon.SinonSpy;
	let target: Target;
	let request: IncomingMessage;
	let response: ServerResponse;

	return {
		beforeEach() {
			target = factory();
			filter = sinon.spy(() => true);
			transform = sinon.spy((req: IncomingMessage) => req);
			request = createMockRequest();
			response = createMockResponse();
		},

		tests: {
			construct() {
				const proxy = route().wrap(target);
				assert.property(proxy, 'handle');
			},

			async filter() {
				const proxy = route().filter(filter).wrap(target);
				await proxy.handle(request, response);

				assert.isTrue(filter.calledOnce);
			},

			async transform() {
				const proxy = route().transform(transform).wrap(target);
				await proxy.handle(request, response);

				assert.isTrue(transform.calledOnce);
				assert.notStrictEqual(target, proxy);
			},

			async 'filter and transform'() {
				const proxy = route().transform(transform).filter(filter).wrap(target);
				await proxy.handle(request, response);

				assert.isTrue(transform.calledOnce, `transform called once (${ transform.callCount })`);
				assert.isTrue(filter.calledOnce, 'filter called once');
				assert.isTrue(transform.calledBefore(filter), 'transform called before filter');
				assert.notStrictEqual(target, proxy, 'middleware is different from proxy');
			}
		}
	};
}

let request: any;
let response: any;
let handlerStub: any;

registerSuite('src/handlers/route#Route', {
	tests: {
		'array': createTests(() => [sinon.stub(), sinon.stub()]),

		'Handler': createTests(() => {
			return {handle: sinon.stub()};
		}),

		'function': createTests(() => sinon.stub()),

		async method() {
			const target = sinon.stub();
			request = createMockRequest();
			request.method = 'post';
			response = createMockResponse();
			const proxy = route().method('post').wrap(target);
			await proxy.handle(request, response);

			assert.isTrue(target.calledOnce);
		}
	}
});

registerSuite('src/handlers/route#route', {
	beforeEach() {
		request = createMockRequest();
		response = createMockResponse();
		handlerStub = sinon.stub();
	},

	tests: {
		'string route': {
			async 'no match; handler not called'() {
				const handler = route('/test').wrap(handlerStub);
				request.url = 'http://example.com/';
				await handler.handle(request, response);
				assert.isFalse(handlerStub.called);
			},

			async 'match; calls handler'() {
				const handler = route('/test').wrap(handlerStub);
				request.url = 'http://example.com/test';
				await handler.handle(request, response);
				assert.isTrue(handlerStub.calledOnce);
				const actualRequest: any = handlerStub.lastCall.args[0];
				assert.strictEqual(actualRequest.url, 'http://example.com/');
			}
		},

		'matching string': {
			async 'basic parameters; params on request'() {
				const handler = route('/test/:id').wrap(handlerStub);
				request.url = 'http://example.com/test/1';
				await handler.handle(request, response);
				assert.isTrue(handlerStub.calledOnce);
				assert.strictEqual(handlerStub.lastCall.args[0].params.id, '1');
			},

			async 'rest parameter; relative url on request'() {
				const handler = route('/test/(.*)').wrap(handlerStub);
				request.url = 'http://example.com/test/therest';
				await handler.handle(request, response);
				assert.isTrue(handlerStub.calledOnce);
				const actualRequest: any = handlerStub.lastCall.args[0];
				assert.strictEqual(actualRequest.params[0], 'therest');
				assert.strictEqual(actualRequest.url, 'http://example.com/therest');
			}
		},

		async 'regular expression'() {
			const handler = route(/te.t/).wrap(handlerStub);
			request.url = 'http://example.com/test/therest';
			await handler.handle(request, response);
			assert.isTrue(handlerStub.calledOnce);
			const actualRequest: any = handlerStub.lastCall.args[0];
			assert.strictEqual(actualRequest.url, 'http://example.com/test/therest');
		}
	}
});
