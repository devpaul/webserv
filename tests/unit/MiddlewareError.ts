import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import MiddlewareError from 'src/MiddlewareError';

registerSuite({
	construction: {
		'default'() {
			const error = new MiddlewareError('error');
			assert.equal(error.message, 'error');
			assert.equal(error.statusCode, 500);
		},

		'with status code'() {
			const error = new MiddlewareError('error', 410);
			assert.equal(error.message, 'error');
			assert.equal(error.statusCode, 410);
		}
	}
});
