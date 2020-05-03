/// <reference types="intern" />

import { IncomingMessage } from "http";
import { mockResponse, assertHeader, assertMessage } from "../../_support/mocks/mockResponse";
import { response as responseMiddleware } from './response';

const { describe, it } = intern.getPlugin('interface.bdd');

describe('/core/middleware/response', () => {
	describe('response', () => {
		it('sends a response', () => {
			const request = { url: 'http://example.org' } as IncomingMessage;
			const response = mockResponse();
			const middleware = responseMiddleware({ statusCode: 100, header: { header: 'Header' }, message: 'message' });
			middleware(request, response as any);

			assertHeader(response, 100, { header: 'Header' });
			assertMessage(response, 'message');
		});
	});
});
