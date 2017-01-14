import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { isHandler, isHandlerFunction } from 'src/handlers/Handler';

registerSuite({
	name: 'src/Handler',

	isHandler: {
		'is null; returns false'() {
			const value: any = null;
			assert.isFalse(isHandler(value));
		},

		'is not an object; returns false'() {
			const value = function () { };
			assert.isFalse(isHandler(value));
		},

		'does not have a handle method; returns false'() {
			const value = { };
			assert.isFalse(isHandler(value));
		},

		'Handler; returns true'() {
			const value = { handle() { } };
			assert.isTrue(isHandler(value));
		}
	},

	isHandlerFunction: {
		'is a function; returns true'() {
			const value = function () { };
			assert.isTrue(isHandlerFunction(value));
		},

		'is not a function; returns false'() {
			const value = { };
			assert.isFalse(isHandlerFunction(value));
		}
	}
});
