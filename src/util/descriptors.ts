/**
 * @return if the passed value is a property descriptor
 */
export function isPropertyDescriptor(descriptor: any): descriptor is PropertyDescriptor {
	return isDataDescriptor(descriptor) || isAccessorDescriptor(descriptor);
}

/**
 * @return if the passed value is a property descriptor that returns a value
 */
export function isDataDescriptor(descriptor: any): boolean {
	return Boolean(descriptor && descriptor.hasOwnProperty('value'));
}

/**
 * @return if the passed value is a property descriptor that has a getter and a setter
 */
export function isAccessorDescriptor(descriptor: any): boolean {
	return isGetPropertyDescriptor(descriptor) || isSetPropertyDescriptor(descriptor);
}

/**
 * @return if the passed value is a property descriptor with a getter
 */
export function isGetPropertyDescriptor(descriptor: any): boolean {
	return Boolean(descriptor && descriptor.get && typeof descriptor.get === 'function');
}

/**
 * @return if the passed value is a property descriptor with a setter
 */
export function isSetPropertyDescriptor(descriptor: any): boolean {
	return Boolean(descriptor && descriptor.set && typeof descriptor.set === 'function');
}
