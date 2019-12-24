/// <reference types="intern" />

import { setLoader, getLoader } from '.';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('config/services/index', () => {
	it('registers a set of default loaders', () => {
		const defaultLoaders = ['chat', 'crud', 'file', 'log', 'proxy', 'upload'];
		for (let loader of defaultLoaders) {
			assert.doesNotThrow(() => {
				getLoader(loader);
			});
		}
	});

	it('can add and retrieve additional loaders', () => {
		const loaderName = 'testloader';
		const loader = () => {};
		assert.throws(() => {
			getLoader(loaderName);
		});
		setLoader(loaderName, loader);
		assert.strictEqual(getLoader(loaderName), loader);
	});

	it('throws when getLoader tries to get a missing handler', () => {
		assert.throws(() => {
			getLoader('doesNotExist');
		});
	});
});
