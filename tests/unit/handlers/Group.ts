import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import Group from 'src/handlers/Group';
import { createMockResponse, createMockRequest } from '../_support/mocks';
import * as sinon from 'sinon';
import Functional from 'src/handlers/Functional';

registerSuite('src/handlers/Group', {
	tests: {
		construction: {
			'default'() {
				const group = new Group();

				assert.isNotNull(group.handlers);
				assert.isArray(group.handlers);
			},

			'with handlers'() {
				const handler = function () { return Promise.resolve(); };
				const group = new Group([
					handler
				]);

				assert.lengthOf(group.handlers, 1);
				assert.strictEqual(group.handlers[0].handle, handler);
			}
		},

		'#add()': {
			'handler function'() {
				const handler = sinon.spy(() => Promise.resolve());
				const group = new Group();
				group.add(handler);

				assert.lengthOf(group.handlers, 1);
				assert.strictEqual(group.handlers[0].handle, handler);

				return group.handle(null, createMockResponse())
					.then(function () {
						assert.isTrue(handler.calledOnce);
					});
			},

			'Handler instance'() {
				const handleMethod = sinon.spy(() => Promise.resolve());
				const handler = new Functional(handleMethod);
				const group = new Group();
				group.add(handler);

				assert.lengthOf(group.handlers, 1);
				assert.strictEqual(group.handlers[0], handler);

				return group.handle(null, createMockResponse())
					.then(function () {
						assert.isTrue(handleMethod.calledOnce);
					});
			}
		},

		'#handle()': {
			'zero handlers; returns resolved promise'() {
				const group = new Group();

				return group.handle(null, createMockResponse());
			},

			'one handler'() {
				const request = createMockRequest();
				const response = createMockResponse();
				const handlers = [
					sinon.spy(() => Promise.resolve())
				];
				const group = new Group(handlers);

				return group.handle(request, response)
					.then(function () {
						for (let handler of handlers) {
							assert.isTrue(handler.calledOnce);
							assert.deepEqual(handler.firstCall.args, [request, response]);
						}
					});
			},

			'multiple handlers'() {
				const request = createMockRequest();
				const response = createMockResponse();
				const handlers = [
					sinon.spy(() => Promise.resolve()),
					sinon.spy(() => Promise.resolve()),
					sinon.spy(() => Promise.resolve())
				];
				const group = new Group(handlers);

				return group.handle(request, response)
					.then(function () {
						for (let handler of handlers) {
							assert.isTrue(handler.calledOnce);
							assert.deepEqual(handler.firstCall.args, [request, response]);
						}
					});
			},

			'handler returns skip; the remaining handlers are skipped'() {
				const request = createMockRequest();
				const response = createMockResponse();
				const handlers = [
					sinon.spy(() => Promise.resolve()),
					sinon.spy(() => Promise.resolve('skip')),
					sinon.spy(() => Promise.resolve())
				];
				const group = new Group(handlers);

				return group.handle(request, response)
					.then(function (directive: string) {
						for (let i = 0; i < 2; i++) {
							const handler = handlers[0];
							assert.isTrue(handler.calledOnce);
							assert.deepEqual(handler.firstCall.args, [request, response]);
						}
						assert.isFalse(handlers[2].called);
						assert.isUndefined(directive);
					});
			},

			'handler returns immediate; the remaining handlers are skipped and the group returns immediate'() {
				const request = createMockRequest();
				const response = createMockResponse();
				const handlers = [
					sinon.spy(() => Promise.resolve()),
					sinon.spy(() => Promise.resolve('immediate')),
					sinon.spy(() => Promise.resolve())
				];
				const group = new Group(handlers);

				return group.handle(request, response)
					.then(function (directive: string) {
						for (let i = 0; i < 2; i++) {
							const handler = handlers[0];
							assert.isTrue(handler.calledOnce);
							assert.deepEqual(handler.firstCall.args, [request, response]);
						}
						assert.isFalse(handlers[2].called);
						assert.strictEqual(directive, 'immediate');
					});
			}
		}
	}
});
