import { v4 } from 'uuid';

export interface Environment {
	configPath: string;
}

export const $Env = Symbol('Environment ' + v4());

export function isEnvironment(value: any): value is Environment {
	return (
		typeof value === 'object' &&
		typeof value.configPath === 'string' &&
		(!value.properties || typeof value.properties === 'object')
	);
}

export function createEnvironment(): Environment {
	return {
		configPath: process.cwd()
	};
}
