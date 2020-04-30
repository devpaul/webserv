import { dirname } from 'path';
import { inspect } from 'util';
import { log, setLogLevel } from '../core/log';
import { ServerControls } from '../core/servers/startServer';
import { Environment, isEnvironment } from './loader';
import { checkRegisterTs } from './utils/addons';
import { Config, loadConfig } from './utils/config';
import { loadExternals } from './utils/externals';
import { bootServer } from './utils/server';

/**
 * Starts a server from a config.
 *
 * Lifecycle for start:
 *
 * 1. load the configuration
 * 2. set the log level
 * 3. load externals
 * 4. boot services
 * 5. start the server
 *
 * @param config a Config or a path that can be used to load a config
 * @param app an App to manage the server
 */
export default async function start(config: Config | string, envConfig: Partial<Environment> = {}) {
	if (typeof config === 'string') {
		const configMeta = await loadConfig(config);
		if (!envConfig.configPath) {
			envConfig.configPath = dirname(configMeta.configPath);
		}
		config = configMeta.config;
	}
	if (config.logLevel) {
		setLogLevel(config.logLevel);
	}

	log.debug('Using config', inspect(config, { depth: 5 }));

	const env = isEnvironment(envConfig)
		? envConfig
		: {
				configPath: process.cwd(),
				...envConfig
		  };
	checkRegisterTs(config.tsConfig);
	loadExternals(config.externals, env);
	const servers: ServerControls[] = [];
	for (let server of config.servers) {
		const controls = await bootServer(server, env);
		servers.push(controls);
	}
	return servers;
}
