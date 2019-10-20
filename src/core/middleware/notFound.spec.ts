/// <reference types="intern" />

import { IncomingMessage } from "http";
import { mockResponse, assertHeader, assertMessage } from "../../_support/mocks/mockResponse";
import { notFound } from "./notFound";

const { describe, it } = intern.getPlugin('interface.bdd');

describe('/core/middleware/notFound', () => {
	describe('notFound', () => {
		it('responds not found', () => {
			const location = 'https://example.org';
			const request = { url: 'http://example.org' } as IncomingMessage;
			const response = mockResponse();
			const middleware = notFound({ location });
			middleware(request, response as any);

			assertHeader(response, 404);
			assertMessage(response, 'Not Found');
		});
	});
});
