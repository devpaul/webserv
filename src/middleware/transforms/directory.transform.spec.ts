/// <reference types="intern" />

import { IncomingMessage } from 'http';
import { URL } from 'url';
import { mockResponse } from '../../_support/mocks/mockResponse';
import { Directory, directoryTransform } from './directory.transform';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('core/transforms/directory.transform.spec', () => {
	const result: Directory = {
		directory: '/',
		files: ['1.txt', '2.txt']
	};

	function assertResponse(
		response: any,
		expected: string = '\n\t\t<html>\n\t\t<head>\n\t\t\t<title>Directory listing</title>\n\t\t</head>\n\t\t<body>\n\t\t\t<a href="/test/1.txt">1.txt</a><br><a href="/test/2.txt">2.txt</a>\n\t\t</form>\n\t\t</body>\n\t\t</html>\n\t\t'
	) {
		assert.strictEqual(response.end.callCount, 1);
		assert.strictEqual(response.write.callCount, 1);
		assert.strictEqual(response.write.lastCall.args[0], expected);
	}

	describe('directory transform', () => {
		it('returns if no directory result', () => {
			const result = {};
			const request = {} as IncomingMessage;
			const response = mockResponse();

			directoryTransform(result, request, response as any);
			assert.strictEqual(response.end.callCount, 0);
			assert.strictEqual(response.write.callCount, 0);
		});

		it('writes a directory listing', () => {
			const request = {
				url: new URL('http://example.org/test')
			};
			const response = mockResponse();

			directoryTransform(result, request as any, response as any);
			assertResponse(response);
		});

		it('writes a directory listing using the original url', () => {
			const request = {
				url: new URL('http://example.org/'),
				originalUrl: 'http://example.org/test'
			};
			const response = mockResponse();

			directoryTransform(result, request as any, response as any);
			assertResponse(response);
		});
	});
});
