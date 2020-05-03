/// <reference types="intern" />

import { pathGuard } from "./path";
import { IncomingMessage } from "http";

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('/core/guards/path', () => {
	describe('pathGuard', () => {
		describe('string path', () => {
			it('returns false when the path does not match', () => {
				const guard = pathGuard({ match: '/match' });
				const result = guard({ url: 'https://example.org/nomatch'} as IncomingMessage);
				assert.isFalse(result);
			});

			it('returns true when the path matches', () => {
				const guard = pathGuard({ match: '/match' });
				const result = guard({ url: 'https://example.org/match'} as IncomingMessage);
				assert.isTrue(result);
			});

			it('appends parameters to the request', () => {
				const request = { url: 'https://example.org/match/13' } as any;
				const guard = pathGuard({ match: '/match/:id' });
				const result = guard(request);
				assert.isTrue(result);
				assert.isDefined(request.params);
				assert.strictEqual(request.params.id, '13');
			});

			describe('relative urls', () => {
				it('updates the request url with a relative url when using wildcard matching', () => {
					const request = { url: 'https://example.org/api/match/13' } as any;
					const guard = pathGuard({ match: '/api*' });
					const result = guard(request);
					assert.isTrue(result);
					assert.strictEqual(request.originalUrl, 'https://example.org/api/match/13');
					assert.strictEqual(request.url, '/match/13');
				});

				it('updates the request url with root when not using wildcard matching', () => {
					const request = { url: 'https://example.org/match/13' } as any;
					const guard = pathGuard({ match: '/match/13' });
					const result = guard(request);
					assert.isTrue(result);
					assert.strictEqual(request.url, '/');
				});

				it('supports chaining path guards', () => {
					const request = { url: 'https://example.org/api/match/13' } as any;
					const apiGuard = pathGuard({ match: '/api*' });
					const guard = pathGuard({ match: '/match/13' });
					assert.isTrue(apiGuard(request));
					assert.isTrue(guard(request));
				});
			});
		});

		describe('regex path', () => {
			it('returns false when the path does not match', () => {
				const request = { url: 'https://example.org/api/match/13' } as any;
				const guard = pathGuard({ match: /^match$/i });
				const result = guard(request);
				assert.isFalse(result);
			});

			it('returns true when the path matches', () => {
				const request = { url: 'https://example.org/api/match/13' } as any;
				const guard = pathGuard({ match: /match/i });
				const result = guard(request);
				assert.isTrue(result);
			});
		});
	});
});
