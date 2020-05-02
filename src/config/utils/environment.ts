import { v4 } from 'uuid';
import { Environment } from '../interfaces';

export function isEnvironment(value: any): value is Environment {
	return (
		typeof value === 'object' &&
		typeof value.configPath === 'string' &&
		(!value.properties || typeof value.properties === 'object')
	);
}

export const $Env = Symbol('Environment ' + v4());
