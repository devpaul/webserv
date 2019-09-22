import { Config } from "./createServer";

// TODO implement a file loader
export function loadConfiguration(path?: string, server?: string): Config {
	console.error('configurations are not yet supported');
	process.exitCode = 1;
	process.exit();
	throw new Error('');
}
