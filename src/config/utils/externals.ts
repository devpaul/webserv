import { join, resolve } from 'path';
import { getServiceInjector } from '../factories/loader';
import { Environment, ServiceFactory } from '../interfaces';

export interface ExternalConfig {
	path: string;
}

export type ExternalMap = { [name: string]: ExternalConfig };

function isServiceFactory(value: any): value is ServiceFactory<any> {
	return value && typeof value === 'function';
}

export function loadExternals(externals: ExternalMap = {}, env: Environment) {
	for (let [name, config] of Object.entries(externals)) {
		const path = resolve(join(env.configPath, config.path));
		const loader = require(path);
		const injector = getServiceInjector();
		if (typeof loader === 'object') {
			if (isServiceFactory(loader.default)) {
				injector.register(name, loader.default);
			} else if (isServiceFactory(loader)) {
				injector.register(name, loader);
			} else if (isServiceFactory(loader.loader)) {
				injector.register(name, loader.loader);
			} else {
				throw new Error(`"${path}" is not a service loader`);
			}
		} else {
			throw new Error(`"${path}" is not a service loader`);
		}
	}
}
