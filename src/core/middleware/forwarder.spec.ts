/// <reference types="intern" />

import { forwarder } from "./forwarder";
import { mockResponse, assertHeader } from "../../_support/mocks/mockResponse";
import { IncomingMessage } from "http";

const { describe, it } = intern.getPlugin('interface.bdd');

describe('/core/middleware/forwarder', () => {
	describe('forwarder', () => {
		it('forwards', () => {
			const location = 'https://example.org';
			const request = { url: 'http://example.org' } as IncomingMessage;
			const response = mockResponse();
			const middleware = forwarder({ location });
			middleware(request, response as any);

			assertHeader(response, 301, { Location: location });
		});
	});
});
