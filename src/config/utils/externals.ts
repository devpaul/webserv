import { join, resolve } from 'path';
import { Environment, setLoader } from '../loader';

export interface ExternalConfig {
	path: string;
}

export type ExternalMap = { [name: string]: ExternalConfig };

export function loadExternals(externals: ExternalMap = {}, env: Environment) {
	for (let [name, config] of Object.entries(externals)) {
		const path = resolve(join(env.configPath, config.path));
		setLoader(name, path);
	}
}
