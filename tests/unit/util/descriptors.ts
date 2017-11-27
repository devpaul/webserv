import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import { isPropertyDescriptor, isDataDescriptor, isAccessorDescriptor, isGetPropertyDescriptor, isSetPropertyDescriptor } from 'src/util/descriptors';

const dataDescriptor = {
	value: 1
};
const getDescriptor = {
	get() { }
};
const setDescriptor = {
	set() { }
};
const notADescriptor = {};

registerSuite('src/util/descriptors', {
	isPropertyDescriptor() {
		assert.isTrue(isPropertyDescriptor(dataDescriptor));
		assert.isTrue(isPropertyDescriptor(getDescriptor));
		assert.isTrue(isPropertyDescriptor(setDescriptor));
		assert.isFalse(isPropertyDescriptor(notADescriptor));
	},

	isDataDescriptor() {
		assert.isTrue(isDataDescriptor(dataDescriptor));
		assert.isFalse(isDataDescriptor(getDescriptor));
		assert.isFalse(isDataDescriptor(setDescriptor));
		assert.isFalse(isDataDescriptor(notADescriptor));
	},

	isAccessorDescriptor() {
		assert.isFalse(isAccessorDescriptor(dataDescriptor));
		assert.isTrue(isAccessorDescriptor(getDescriptor));
		assert.isTrue(isAccessorDescriptor(setDescriptor));
		assert.isFalse(isAccessorDescriptor(notADescriptor));
	},

	isGetPropertyDescriptor() {
		assert.isFalse(isGetPropertyDescriptor(dataDescriptor));
		assert.isTrue(isGetPropertyDescriptor(getDescriptor));
		assert.isFalse(isGetPropertyDescriptor(setDescriptor));
		assert.isFalse(isGetPropertyDescriptor(notADescriptor));
	},

	isSetPropertyDescriptor() {
		assert.isFalse(isSetPropertyDescriptor(dataDescriptor));
		assert.isFalse(isSetPropertyDescriptor(getDescriptor));
		assert.isTrue(isSetPropertyDescriptor(setDescriptor));
		assert.isFalse(isSetPropertyDescriptor(notADescriptor));
	}
});
