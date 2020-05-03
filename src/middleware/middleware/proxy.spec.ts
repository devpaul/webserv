/// <reference types="intern" />
import { IncomingMessage, ServerResponse } from 'http';
import { afterEach } from 'intern/lib/interfaces/tdd';
import * as mockery from 'mockery';
import { createSandbox } from 'sinon';
import { MiddlewareFactory } from '../../core/interface';
import { ProxyProperties } from './proxy';

const { assert } = intern.getPlugin('chai');
const { describe, it, before, after, beforeEach } = intern.getPlugin('interface.bdd');

describe('core/middleware/proxy', () => {
	describe('proxy', () => {
		const sinon = createSandbox();
		const createProxyMock = sinon.mock();
		const request = {} as IncomingMessage;
		const response = {} as ServerResponse;
		const mockProxy = {
			web: sinon.stub()
		};
		let proxyFactory: MiddlewareFactory<ProxyProperties>;

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnUnregistered: false
			});
			mockery.registerMock('../util/createProxy', { createProxy: createProxyMock });
			proxyFactory = require('./proxy').proxy;
		});

		beforeEach(() => {
			mockProxy.web.callsFake((_request, _response, _options, cb) => {
				cb();
			});
			createProxyMock.reset();
			createProxyMock.returns(mockProxy);
		});

		afterEach(() => {
			sinon.resetHistory();
		});

		after(() => {
			mockery.deregisterAll();
			mockery.disable();
			sinon.restore();
		});

		it('uses createProxy when a proxy is not provided', async () => {
			const middleware = proxyFactory({ baseUrl: '/' });

			await middleware(request, response);
			assert.strictEqual(createProxyMock.callCount, 1);
			assert.strictEqual(createProxyMock.firstCall.args[0].target, '/');
		});

		it('uses the provided proxy to make requests', async () => {
			const middleware = proxyFactory({ baseUrl: '/', proxy: mockProxy as any });

			await middleware(request, response);

			assert.strictEqual(mockProxy.web.callCount, 1);
			assert.strictEqual(mockProxy.web.firstCall.args[0], request);
			assert.strictEqual(mockProxy.web.firstCall.args[1], response);
		});

		it('uses the provided onProxyCallback', async () => {
			const onProxyCallback = sinon.mock();
			const middleware = proxyFactory({ baseUrl: '/', onProxyCallback });

			await middleware(request, response);

			assert.strictEqual(onProxyCallback.callCount, 1);
		});

		it('eventually rejects when an error is returned', async () => {
			const middleware = proxyFactory({ baseUrl: '/' });

			mockProxy.web.callsFake((request, _response, _options, cb) => {
				cb(new Error(), request);
			});

			return Promise.resolve(middleware(request, response)).then(
				() => {
					throw new Error('expected rejection');
				},
				() => {}
			);
		});
	});
});
