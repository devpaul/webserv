/// <reference types="intern" />

import { setupSinon, setupMocks } from '../../_support/mocks';
import { MiddlewareFactory } from '../interface';
import { ServeProperties } from './serve';
import { beforeEach } from 'intern/lib/interfaces/tdd';
import { eventuallyRejects } from '../../_support/assertions';
import { IncomingMessage, ServerResponse } from 'http';
import { constants } from 'fs';
import { HttpStatus } from '../HttpError';
import { mockResponse, assertHeader } from '../../_support/mocks/mockResponse';
import { join } from 'path';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('core/middleware/serve', () => {
	describe('serve middleware', () => {
		const sinon = setupSinon();
		const mockfs = {
			readdir: sinon.stub(),
			access: sinon.stub(),
			constants,
			stat: sinon.stub()
		};
		const mockSend = sinon.stub();
		setupMocks({
			fs: mockfs,
			send: mockSend
		});
		let serveFactory: MiddlewareFactory<ServeProperties>;

		function assertSendTarget(target: string, base = process.cwd()) {
			assert.strictEqual(mockSend.callCount, 1);
			assert.strictEqual(mockSend.lastCall.args[1], join(base, target));
		}

		function setupDirectoryMocks(expected: object = {}) {
			mockfs.access.onFirstCall().callsFake((_1, _2, cb) => {
				cb();
			});
			mockfs.access.onSecondCall().callsFake((_1, _2, cb) => {
				cb(new Error());
			});
			mockfs.stat.callsFake((_1, cb) => {
				cb(null, {
					isDirectory: sinon.mock().returns(true)
				});
			});
			mockfs.readdir.callsFake((_1, cb) => {
				cb(null, expected);
			});
		}

		beforeEach(() => {
			serveFactory = require('./serve').serve;
			assert.isDefined(serveFactory);
			mockSend.returns({
				on: sinon.mock().callsFake((type: string, cb) => {
					if (type === 'end') {
						cb();
					}
				})
			});
		});

		it('throws NotFound status when file not found', async () => {
			const serveMiddleware = serveFactory({});
			const request = {
				url: 'http://example.org/'
			} as IncomingMessage;
			const response = {} as ServerResponse;

			mockfs.access.callsFake((_1, _2, cb) => {
				cb(new Error());
			});

			const err = await eventuallyRejects(serveMiddleware(request, response));
			assert.strictEqual(err.statusCode, HttpStatus.NotFound);
			assert.strictEqual(mockfs.access.callCount, 3);
		});

		it('throws Forbidden status when path is above base path', async () => {
			const serveMiddleware = serveFactory({});
			const request = {
				url: 'http://example.org/../../'
			} as IncomingMessage;
			const response = {} as ServerResponse;

			mockfs.access.callsFake((_1, _2, cb) => {
				cb();
			});

			const err = await eventuallyRejects(serveMiddleware(request, response));
			assert.strictEqual(err.statusCode, HttpStatus.Forbidden);
			assert.strictEqual(mockfs.access.callCount, 1);
		});

		it('returns a directory listing', async () => {
			const serveMiddleware = serveFactory({});
			const request = {
				url: 'http://example.org/'
			} as IncomingMessage;
			const response = {} as ServerResponse;
			const expected = {};

			setupDirectoryMocks(expected);

			const result: any = await serveMiddleware(request, response);
			assert.strictEqual(mockfs.readdir.callCount, 1);
			assert.strictEqual(result.files, expected);
		});

		it('returns a file', async () => {
			const serveMiddleware = serveFactory({});
			const request = {
				url: 'http://example.org/file.txt'
			} as IncomingMessage;
			const response = mockResponse();

			mockfs.access.onFirstCall().callsFake((_1, _2, cb) => {
				cb();
			});
			mockfs.stat.callsFake((_1, cb) => {
				cb(null, {
					isDirectory: sinon.mock().returns(false)
				});
			});

			const result: any = await serveMiddleware(request, response as any);
			assert.strictEqual(mockSend.callCount, 1);
			assert.strictEqual(response.end.callCount, 1);
			assert.isUndefined(result);
		});

		describe('trailingSlash', () => {
			it('forwards when a directory url is missing a trailing slash', async () => {
				const serveMiddleware = serveFactory({
					trailingSlash: true
				});
				const request = {
					url: 'http://example.org'
				} as IncomingMessage;
				const response = mockResponse(sinon);
				const expected = {};

				setupDirectoryMocks(expected);

				const result: any = await serveMiddleware(request, response as any);
				assert.isUndefined(result);
				assertHeader(response, HttpStatus.MovedPermanently, {
					Location: 'http://example.org/'
				});
			});
		});

		describe('extensions', () => {
			it('uses extensions to find a matching file', async () => {
				const serveMiddleware = serveFactory({});
				const request = {
					url: 'http://example.org/main'
				} as IncomingMessage;
				const response = mockResponse();

				mockfs.access.onFirstCall().callsFake((_1, _2, cb) => {
					cb(new Error());
				});
				mockfs.access.onSecondCall().callsFake((_1, _2, cb) => {
					cb(new Error());
				});
				mockfs.access.onThirdCall().callsFake((_1, _2, cb) => {
					cb();
				});
				mockfs.stat.callsFake((_1, cb) => {
					cb(null, {
						isDirectory: sinon.mock().returns(false)
					});
				});

				const result: any = await serveMiddleware(request, response as any);
				assertSendTarget('main.js');
				assert.strictEqual(response.end.callCount, 1);
				assert.isUndefined(result);
			});
		});

		describe('searchDefaults', () => {
			it('returns index.html when searchDefaults are used', async () => {
				const serveMiddleware = serveFactory({});
				const request = {
					url: 'http://example.org/'
				} as IncomingMessage;
				const response = mockResponse();

				setupDirectoryMocks();
				mockfs.access.onSecondCall().callsFake((_1, _2, cb) => {
					cb();
				});
				mockfs.stat.onSecondCall().callsFake((_1, cb) => {
					cb(null, {
						isFile: sinon.mock().returns(true)
					});
				});

				const result: any = await serveMiddleware(request, response as any);
				assertSendTarget('index.html');
				assert.isUndefined(result);
			});
		});
	});
});
