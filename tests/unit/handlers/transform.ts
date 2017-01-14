import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { transform, proxy as transformProxy } from 'src/handlers/transform';
import { createMockRequest, createMockResponse } from '../_support/mocks';
import * as sinon from 'sinon';

registerSuite({
	name: 'src/transform',

	transform() {
		const request = createMockRequest();
		const response = createMockResponse();
		const handlerFunc = sinon.stub();
		const transformFunc = sinon.spy(function () {
			return createMockRequest();
		});
		const proxy = transform(handlerFunc, transformFunc);

		proxy(request, response);
		assert.isTrue(handlerFunc.calledOnce);
		assert.isTrue(transformFunc.calledOnce);
		assert.isTrue(transformFunc.calledBefore(handlerFunc));
		assert.isTrue(transformFunc.calledWith(request));
		assert.equal(transformFunc.args[0][0], request);
		assert.notEqual(handlerFunc.args[0][0], request);
	},

	proxy: {
		handle() {
			const request = createMockRequest();
			const response = createMockResponse();
			const handler = { handle: sinon.stub() };
			const transformFunc = sinon.spy(function () {
				return createMockRequest();
			});
			const proxy = transformProxy(handler, transformFunc);

			proxy.handle(request, response);
			assert.isTrue(handler.handle.calledOnce);
			assert.isTrue(transformFunc.calledOnce);
			assert.isTrue(transformFunc.calledBefore(handler.handle));
			assert.equal(transformFunc.args[0][0], request);
			assert.notEqual(handler.handle.args[0][0], request);
		}
	}
});
