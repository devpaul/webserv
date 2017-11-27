import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import { stub } from 'sinon';
import { overrideWrapper, descriptorWrapper } from 'src/util/proxies';

registerSuite('src/util/proxies', {
	overridewrapper: {
		'default property'() {
			const proxy = overrideWrapper({ property: 1 });
			assert.strictEqual(proxy.property, 1);
		},

		'overrides getter'() {
			const original = {
				property: 1
			};
			const proxy = overrideWrapper(original, {
				property: 10
			});

			assert.strictEqual(proxy.property, 10);
			assert.strictEqual(original.property, 1);
		},

		'overrides setter'() {
			const original = {
				property: 1
			};
			const proxy = overrideWrapper(original, {
				property: 10
			});
			proxy.property = 0;

			assert.strictEqual(proxy.property, 0);
			assert.strictEqual(original.property, 1);
		},

		'returns original when no override'() {
			const original = {
				property: 1
			};
			const proxy = overrideWrapper(original, {
				nomatch: 10
			});
			proxy.property = 0;

			assert.strictEqual(proxy.property, 0);
			assert.strictEqual(original.property, 0);
		}
	},

	descriptorWrapper: {
		'default construction'() {
			const proxy = descriptorWrapper({ property: 1 });
			assert.strictEqual(proxy.property, 1);
		},

		get: {
			'descriptor override result'() {
				const target = { property: 1 };
				const proxy = descriptorWrapper(target, {
					property: {
						get() {
							return 2;
						}
					}
				});
				assert.strictEqual(proxy.property, 2);
			},

			'data descriptor override value'() {
				const target = { property: 1 };
				const proxy = descriptorWrapper(target, {
					property: {
						value: 2
					}
				});
				assert.strictEqual(proxy.property, 2);
			},

			'underlying target value'() {
				const target = { property: 1 };
				const proxy = descriptorWrapper(target, {
					'not a match': {
						value: 2
					}
				});
				assert.strictEqual(proxy.property, 1);
			}
		},

		getOwnPropertyDescriptor: {
			'override descriptor'() {
				const target = { property: 1 };
				const proxy = descriptorWrapper(target, {
					property: {
						value: 2
					}
				});
				const descriptor = Object.getOwnPropertyDescriptor(proxy, 'property');
				assert.deepEqual(descriptor, {
					configurable: true,
					enumerable: true,
					value: 2,
					writable: true
				});
			},

			'override missing target property'() {
				const target = { };
				const proxy = descriptorWrapper(target, {
					property: {
						value: 2
					}
				});
				const descriptor = Object.getOwnPropertyDescriptor(proxy, 'property');
				assert.deepEqual(descriptor, {
					configurable: true,
					enumerable: true,
					value: 2,
					writable: true
				});
			},

			'target descriptor'() {
				const target = { property: 1 };
				const proxy = descriptorWrapper(target, {
					'not a match': {
						value: 2
					}
				});
				const descriptor = Object.getOwnPropertyDescriptor(proxy, 'property');
				assert.deepEqual(descriptor, {
					configurable: true,
					enumerable: true,
					value: 1,
					writable: true
				});
			}
		},

		set: {
			'property descriptor override'() {
				const mockSet = stub();
				const target = { property: 1 };
				const proxy = descriptorWrapper(target, {
					property: {
						get() {
							return 2;
						},
						set: mockSet
					}
				});
				proxy.property = 10;

				assert.strictEqual(target.property, 1);
				assert.strictEqual(proxy.property, 2);
				assert.isTrue(mockSet.calledOnce);
			},

			'data descriptor override'() {
				const target = { property: 1 };
				const proxy = descriptorWrapper(target, {
					property: {
						value: 2
					}
				});
				proxy.property = 10;

				assert.strictEqual(target.property, 1);
				assert.strictEqual(proxy.property, 10);
			},

			'underlying target value'() {
				const target = { property: 1 };
				const proxy = descriptorWrapper(target, {
					'not a match': {
						value: 2
					}
				});
				proxy.property = 10;

				assert.strictEqual(target.property, 10);
				assert.strictEqual(proxy.property, 10);
			}
		}
	}
});
