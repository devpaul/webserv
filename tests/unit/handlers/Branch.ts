import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import { stub } from 'sinon';
import Branch, { ConditionMap, contentNegotiator, headerResolver, methodResolver, Resolver } from 'src/handlers/Branch';
import { createMockRequest, createMockResponse, MockHandler } from '../_support/mocks';
import { IncomingMessage } from 'http';
import { Handler } from 'src/handlers/Handler';

function mockResolver(match: string) {
	return function (_request: IncomingMessage, map: ConditionMap) {
		return map.get(match);
	};
}

registerSuite('src/handlers/Branch', {
	tests: {
		'Handlers called'() {
			const handler = new MockHandler();
			handler.handle.returns('expected');
			const map = new Branch({
				map: {
					condition: handler
				},
				resolver: mockResolver('condition')
			});
			const result = map.handle(createMockRequest(), createMockResponse());
			assert.strictEqual(result, 'expected');
			assert.isTrue(handler.handle.calledOnce);
		},

		'handler functions called'() {
			const handler = stub();
			const map = new Branch({
				map: {
					condition: handler
				},
				resolver: mockResolver('condition')
			});
			const result = map.handle(createMockRequest(), createMockResponse());
			assert.isUndefined(result);
			assert.isTrue(handler.calledOnce);
		},

		'missing condition; returns void'() {
			const handler = stub();
			const map = new Branch({
				map: {
					condition: handler
				},
				resolver: mockResolver('not a match')
			});
			const result = map.handle(createMockRequest(), createMockResponse());
			assert.isUndefined(result);
			assert.isFalse(handler.called);
		}
	}
});

registerSuite('src/handlers/Branch#content negotiator', () => {
	let request: any;
	let map: Map<string, Handler>;

	return {
		beforeEach() {
			request = createMockRequest();
			request.headers = { };
			map = new Map([
				[ '*/*', new MockHandler() ],
				[ 'text/html', new MockHandler() ],
				[ 'image/jpeg', new MockHandler() ],
				[ 'image/png', new MockHandler() ]
			]);
		},

		tests: {
			'missing accept header; returns any mime type'() {
				const actual = contentNegotiator(request, map);
				assert.strictEqual(actual, map.get('*/*'));
			},

			'type/subtype match'() {
				request.headers = { accept: 'text/html' };
				const actual = contentNegotiator(request, map);
				assert.strictEqual(actual, map.get('text/html'));
			},

			'type match w/ any subtype; returns first match'() {
				request.headers = { accept: 'image/*' };
				const actual = contentNegotiator(request, map);
				assert.strictEqual(actual, map.get('image/jpeg'));
			},

			'no match; uses any mime type'() {
				request.headers = { accept: 'no match' };
				const actual = contentNegotiator(request, map);
				assert.strictEqual(actual, map.get('*/*'));
			},

			'no match & no default; returns undefined'() {
				map.delete('*/*');
				request.headers = { accept: 'no match' };
				const actual = contentNegotiator(request, map);
				assert.isUndefined(actual);
			}
		}
	};
});

registerSuite('src/handlers/Branch#headerResolver', () => {
	let request: any;
	let resolver: Resolver;
	let map: Map<string, Handler>;

	return {
		beforeEach() {
			resolver = headerResolver('x-header');
			request = createMockRequest();
			request.headers = {};
			map = new Map([
				[ 'match', new MockHandler() ]
			]);
		},

		tests: {
			'missing header; no match'() {
				const actual = resolver(request, map);
				assert.isUndefined(actual);
			},

			'matching header value'() {
				request.headers = { 'x-header': 'match' };
				const actual = resolver(request, map);
				assert.strictEqual(actual, map.get('match'));
			},

			'default header value'() {
				map.set('default', new MockHandler());
				request.headers = { 'x-header': 'no match' };
				const actual = resolver(request, map);
				assert.strictEqual(actual, map.get('default'));
			},

			'no matching value'() {
				request.headers = { 'x-header': 'no match' };
				const actual = resolver(request, map);
				assert.isUndefined(actual);
			}
		}
	};
});

registerSuite('src/handlers/Branch#methodResolver', () => {
	let request: any;
	let map: Map<string, Handler>;

	return {
		beforeEach() {
			request = createMockRequest();
			map = new Map([
				[ 'GET', new MockHandler() ]
			]);
		},

		tests: {
			'matching method handler'() {
				request.method = 'GET';
				const actual = methodResolver(request, map);
				assert.strictEqual(actual, map.get('GET'));
			},

			'no matching method handler'() {
				request.method = 'POST';
				const actual = methodResolver(request, map);
				assert.isUndefined(actual);
			},

			'no match uses default'() {
				map.set('default', new MockHandler());
				request.method = 'POST';
				const actual = methodResolver(request, map);
				assert.strictEqual(actual, map.get('default'));
			}
		}
	};
});
