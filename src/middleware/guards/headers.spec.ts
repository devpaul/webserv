/// <reference types="intern" />
import { headerGuard } from './headers';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('core/guards/headers', () => {
	const headers = {
		'Authorization': 'secret phrase'
	};

	describe('all headers match', () => {
		it('returns true', () => {
			const request: any = {
				headers
			}
			const guard = headerGuard(headers)
			const result = guard(request);

			assert.isTrue(result);
		})
	});

	describe('some headers match', () => {
		it('returns true', () => {
			const request: any = {
				headers: {
					'AnotherHeader': 'does not matter',
					... headers
				}
			}
			const guard = headerGuard(headers)
			const result = guard(request);

			assert.isTrue(result);
		});
	});

	describe('one header does not match', () => {
		it('returns false', () => {
			const request: any = {
				headers
			}
			const guard = headerGuard({
				'AnotherHeader': 'does not match',
				... headers
			})
			const result = guard(request);

			assert.isFalse(result);
		})
	})
});
