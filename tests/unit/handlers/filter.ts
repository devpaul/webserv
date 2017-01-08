import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { filter, wrap, FILTER, method, first, FilterFunction, every, createFilter } from 'src/handlers/filter';
import { IncomingMessage, ServerResponse } from 'http';
import Functional from 'src/handlers/Functional';
import * as sinon from 'sinon';
import { createMockRequest, createMockResponse } from '../_support/mocks';
import { HandlerFunction, Handler } from 'src/handlers/Handler';

let handlerMethod: HandlerFunction & sinon.SinonSpy;
let handler: Handler;
let request: IncomingMessage;
let response: ServerResponse;
let passingFilter: FilterFunction & sinon.SinonSpy;
let failingFilter: FilterFunction & sinon.SinonSpy;

registerSuite({
	name: 'src/handlers/util/filter',

	beforeEach() {
		handlerMethod = sinon.spy(function () {
			return Promise.resolve();
		});

		handler = new Functional(handlerMethod);

		request = createMockRequest();
		response = createMockResponse();
		passingFilter = sinon.spy(function (_req: IncomingMessage) {
			return true;
		});
		failingFilter = sinon.spy(function (_req: IncomingMessage) {
			return false;
		});
	},

	'#filter() creates a handler with a filter': {
		'when filter passes; the underlying handler is ran'() {
			return filter(handlerMethod, passingFilter)(request, response)
				.then(function () {
					assert.isTrue(passingFilter.calledOnce);
					assert.isTrue(handlerMethod.calledOnce);
				});

		},

		'when filter failes; the underlying handler is not ran'() {
			return filter(handlerMethod, failingFilter)(request, response)
				.then(function () {
					assert.isTrue(failingFilter.calledOnce);
					assert.isFalse(handlerMethod.called);
				});
		}
	},

	'#wrap()': {
		'when filter passes; the underlying handler is ran'() {
			return wrap(handler, passingFilter).handle(request, response)
				.then(function () {
					assert.isTrue(passingFilter.calledOnce);
					assert.isTrue(handlerMethod.called);
				});
		},

		'when filter fails; the underlying handler is not ran'() {
			return wrap(handler, failingFilter).handle(request, response)
				.then(function () {
					assert.isTrue(failingFilter.calledOnce);
					assert.isFalse(handlerMethod.called);
				});
		},

		'get underlying filter using the symbol'() {
			return assert.strictEqual((<any> wrap(handler, failingFilter))[FILTER], failingFilter);
		}
	},

	'#method()'() {
		const filterMethod = method('GET');

		assert.isTrue(filterMethod(<any> {
			method: 'get'
		}));

		assert.isFalse(filterMethod(<any> {
			method: 'post'
		}));
	},

	'#first()': {
		'zero filters; returns false'() {
			const filterMethod = first();

			assert.isFalse(filterMethod(null));
		},

		'one filter'() {
			assert.isTrue(first(
				passingFilter
			)(request));

			assert.isFalse(first(
				failingFilter
			)(request));
		},

		'multiple filters': {
			'all passing; passes'() {
				const filterMethod = first(
					passingFilter,
					passingFilter,
					passingFilter
				);
				assert.isTrue(filterMethod(request));
				assert.isTrue(passingFilter.calledOnce);
			},

			'at least one passing; passes'() {
				const filterMethod = first(
					failingFilter,
					passingFilter,
					passingFilter
				);
				assert.isTrue(filterMethod(request));
				assert.isTrue(failingFilter.calledOnce);
				assert.isTrue(passingFilter.calledOnce);
			},

			'none passing; fails'() {
				const filterMethod = first(
					failingFilter,
					failingFilter,
					failingFilter
				);
				assert.isFalse(filterMethod(request));
				assert.isTrue(failingFilter.calledThrice);
			}
		},
	},

	'#every()': {
		'zero filters; returns true'() {
			const filterMethod = every();
			assert.isTrue(filterMethod(null));
		},

		'one filter'() {
			assert.isTrue(every(
				passingFilter
			)(request));

			assert.isFalse(every(
				failingFilter
			)(request));
		},

		'multiple filters': {
			'all passing; passes'() {
				const filterMethod = every(
					passingFilter,
					passingFilter,
					passingFilter
				);
				assert.isTrue(filterMethod(request));
				assert.isTrue(passingFilter.calledThrice);
			},

			'at least one failing; fails'() {
				const filterMethod = every(
					passingFilter,
					failingFilter,
					passingFilter
				);
				assert.isFalse(filterMethod(request));
				assert.isTrue(failingFilter.calledOnce);
				assert.isTrue(passingFilter.calledOnce);
			},

			'none passing; fails'() {
				const filterMethod = every(
					failingFilter,
					failingFilter,
					failingFilter
				);
				assert.isFalse(filterMethod(request));
				assert.isTrue(failingFilter.calledOnce);
			}
		}
	},

	'#createFilter()': {
		'string filter'() {
			const filterMethod = createFilter('/favicon.ico');

			assert.isTrue(filterMethod(<any> {
				url: 'http://example.com/favicon.ico'
			}));
		},

		'regular expression filter'() {
			const filterMethod = createFilter(/favicon\.ico$/);

			assert.isTrue(filterMethod(<any> {
				url: 'http://example.com/favicon.ico'
			}));
		},

		'function filter'() {
			const filterMethod = createFilter(passingFilter);

			assert.strictEqual(filterMethod, passingFilter);

			assert.isTrue(filterMethod(request));
		},

		'object filter'() {
			const filterMethod = createFilter({
				method: 'get'
			});

			assert.isTrue(filterMethod(<any> {
				method: 'get',
				url: 'http://example.com/favicon.ico'
			}));
		},

		'no match; throws'() {
			assert.throws(function () {
				createFilter(null);
			});
		}
	}
});
