import registerSuite from 'intern/lib/interfaces/object';
import { assert } from 'chai';
import Functional from 'src/handlers/Functional';

registerSuite('src/handlers/Functional', {
	tests: {
		construction() {
			const handler = function () { return Promise.resolve(); };
			const middleware = new Functional(handler);

			assert.strictEqual(middleware.handle, handler);
		}
	}
});
