import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import route from 'src/handlers/route';
import { HandlerFunction, Handler } from 'src/handlers/Handler';
import * as sinon from 'sinon';
import { FilterFunction } from 'src/handlers/filter';
import { Transform } from 'src/handlers/transform';
import { IncomingMessage } from 'http';
import { createMockRequest, createMockResponse } from '../_support/mocks';
import { ServerResponse } from 'http';

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

		construct() {
			const proxy = route(target).end();
			assert.property(proxy, 'handle');
		},

		filter() {
			const proxy = route(target).filter(filter).end();
			proxy.handle(request, response);

			assert.isTrue(filter.calledOnce);
		},

		transform() {
			const proxy = route(target).transform(transform).end();
			proxy.handle(request, response);

			assert.isTrue(transform.calledOnce);
			assert.notStrictEqual(target, proxy);
		},

		'filter and transform'() {
			const proxy = route(target).transform(transform).filter(filter).end();
			proxy.handle(request, response);

			assert.isTrue(transform.calledOnce);
			assert.isTrue(filter.calledOnce);
			assert.isTrue(transform.calledBefore(filter));
			assert.notStrictEqual(target, proxy);
		}
	};
}

registerSuite({
	name: 'src/route',

	'array': createTests(() => [sinon.stub(), sinon.stub()]),

	'Handler': createTests(() => { return { handle: sinon.stub() }; }),

	'function': createTests(() => sinon.stub())
});
