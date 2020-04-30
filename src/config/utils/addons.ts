import { register, RegisterOptions } from 'ts-node';

export type TypeScriptConfig = boolean | RegisterOptions;

/**
 * Loads ts-node when requested by the configuration
 */
export function checkRegisterTs(config: TypeScriptConfig) {
	if (config) {
		if (typeof config === 'boolean') {
			register();
		} else {
			register(config);
		}
	}
}
