/// <reference types="intern" />

import { methodGuard, method } from "./method";
import { IncomingMessage } from "http";

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('core/guards/method', () => {
	describe('methodGuard', () => {
		describe('method matches', () => {
			it('returns true', () => {
				const guard = methodGuard({ method: 'get' });
				const result = guard({ method: 'get' } as IncomingMessage);
				assert.isTrue(result);
			});

			it('returns true when cases differ', () => {
				const guard = methodGuard({ method: 'get' });
				const result = guard({ method: 'GET' } as IncomingMessage);
				assert.isTrue(result);
			});
		})

		describe('method does not match', () => {
			it('returns false', () => {
				const guard = methodGuard({ method: 'get' });
				const result = guard({ method: 'POST' } as IncomingMessage);
				assert.isFalse(result);
			});
		});
	});

	describe('routeGuard', () => {
		for (let [ methodName, factory ] of Object.entries(method)) {
			const testUrl = 'https://example.org/test';
			const failUrl = 'https://example.org/fail';

			describe(`${ methodName }`, () => {
				describe('with path', () => {
					const guard = factory('/test');

					it('returns true when method and path match', () => {
						const result = guard({ method: methodName, url: testUrl } as IncomingMessage);
						assert.isTrue(result);
					});

					it('returns false when method does not match', () => {
						const result = guard({ method: 'No Match', url: testUrl } as IncomingMessage);
						assert.isFalse(result);
					});

					it('returns false when path does not match', () => {
						const result = guard({ method: methodName, url: failUrl } as IncomingMessage);
						assert.isFalse(result);
					})
				});

				describe('without path', () => {
					const guard = factory();

					it('returns true when method matches', () => {
						const result = guard({ method: methodName, url: failUrl } as IncomingMessage);
						assert.isTrue(result);
					});

					it('returns false when method does not match', () => {
						const result = guard({ method: 'No Match', url: testUrl } as IncomingMessage);
						assert.isFalse(result);
					});
				})
			});
		}
	})
});
