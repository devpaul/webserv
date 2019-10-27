/// <reference types="intern" />

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('core/middleware/serve', () => {
	describe('serve middleware', () => {
		it('throws NotFound status when file not found', () => {});

		it('throws Forbidden status when path is above base path', () => {});

		it('returns a directory listing', () => {});

		it('returns a file', () => {});

		describe('trailingSlash', () => {
			it('forwards when a directory url is missing a trailing slash', () => {});
		});

		describe('extensions', () => {
			it('uses extensions to find a matching file', () => {});
		});

		describe('searchDefaults', () => {
			it('returns index.html when searchDefaults are used', () => {});
		});
	});
});
