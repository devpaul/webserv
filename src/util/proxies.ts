import {
	isGetPropertyDescriptor, isDataDescriptor, isSetPropertyDescriptor,
	isPropertyDescriptor
} from './descriptors';

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

export function descriptorWrapper(target: Object, descriptors: PropertyDescriptorMap = {}) {
	return new Proxy(target, {
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

			return target.getOwnPropertyDescriptor(property);
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
