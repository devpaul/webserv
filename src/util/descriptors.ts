export function isPropertyDescriptor(descriptor: any): descriptor is PropertyDescriptor {
	return isDataDescriptor(descriptor) || isAccessorDescriptor(descriptor);
}

export function isDataDescriptor(descriptor: any): boolean {
	return descriptor && descriptor.value;
}

export function isAccessorDescriptor(descriptor: any): boolean {
	return isGetPropertyDescriptor(descriptor) || isSetPropertyDescriptor(descriptor);
}

export function isGetPropertyDescriptor(descriptor: any): boolean {
	return descriptor && descriptor.get && typeof descriptor.get === 'function';
}

export function isSetPropertyDescriptor(descriptor: any): boolean {
	return descriptor && descriptor.set && typeof descriptor.set === 'function';
}
