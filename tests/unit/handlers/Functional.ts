import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import Functional from 'src/handlers/Functional';

registerSuite({
	name: 'src/handlers/Functional',

	construction() {
		const handler = function () { return Promise.resolve(); };
		const middleware = new Functional(handler);

		assert.strictEqual(middleware.handle, handler);
	}
});
