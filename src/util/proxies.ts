import {
	isGetPropertyDescriptor, isDataDescriptor, isSetPropertyDescriptor,
	isPropertyDescriptor
} from './descriptors';

/**
 * Proxies an object so it overrides values
 *
 * @param target the target of the Proxy
 * @param values a map of values to return
 * @return a Proxied object where values in the values object are returned instead of an object's own values
 */
export function overrideWrapper(target: Object, values: { [ key: string ]: any } = {}) {
	return new Proxy(target, {
		get(target: any, property: PropertyKey): any {
			if (property in values) {
				return values[property];
			}

			return target[property];
		},

		set(target: any, property: PropertyKey, value: any): boolean {
			if (property in values) {
				values[property] = value;
			}
			else {
				target[property] = value;
			}

			return true;
		}
	});
}

/**
 * Proxies an object so property descriptors can be overridden.
 *
 * This is useful for when complex functionality needs to be replaced in an object. For simple value replacement
 * overrideWrapper should be used instead.
 *
 * @param target the proxy target
 * @param descriptors a map of descriptors
 * @return a Proxied object where descriptors are overridden by the property descriptor map
 */
export function descriptorWrapper<T extends object = object>(target: T, descriptors: PropertyDescriptorMap = {}): T {
	return new Proxy<T>(target, {
		get(target: any, property: PropertyKey): any {
			if (isGetPropertyDescriptor(descriptors[property])) {
				return descriptors[property].get();
			}
			else if (isDataDescriptor(descriptors[property])) {
				return descriptors[property].value;
			}

			return target[property];
		},

		getOwnPropertyDescriptor(target: any, property: PropertyKey): PropertyDescriptor {
			if (isPropertyDescriptor(descriptors[property])) {
				return descriptors[property];
			}

			return Object.getOwnPropertyDescriptor(target, property);
		},

		set(target: any, property: PropertyKey, value: any): boolean {
			if (isSetPropertyDescriptor(descriptors[property])) {
				descriptors[property].set(value);
			}
			else if (isDataDescriptor(descriptors[property])) {
				descriptors[property].value = value;
			}
			else {
				target[property] = value;
			}
			return true;
		}
	});
}
