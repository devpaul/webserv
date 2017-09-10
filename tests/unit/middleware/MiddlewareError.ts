import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import MiddlewareError from 'src/middleware/MiddlewareError';

registerSuite('src/middleware/MiddlewareError', {
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
