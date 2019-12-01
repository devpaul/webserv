import { exists } from 'fs';
import { dirname, join, resolve } from 'path';
import { App } from '../core/app';
import { noCache } from '../core/processors/cache.processor';
import { method } from '../core/guards/method';
import { serve } from '../core/middleware/serve';
import { jsonTransform } from '../core/transforms/json.transform';
import { route } from '../core/routes/route';
import { log } from '../core/log';

interface FileServiceConfig {
	type: 'file';
	basePath: string;
	paths: {
		[key: string]: string;
	};
}

export async function configExists(path: string) {
	return new Promise((done) => {
		exists(path, done);
	});
}

export function loadConfig(app: App, path: string) {
	const config = require(path);
	const configDirectory = dirname(path);

	for (let service of config.services || []) {
		switch (service.type) {
			case 'file':
				const basePath = service.basePath ? resolve(configDirectory, service.basePath) : configDirectory;
				addFileService(app, basePath, service.paths);
				break;
			default:
				throw new Error(`Unknown service ${service.type} in ${path}`);
		}
	}
}

function addFileService(app: App, basePath: string, paths: FileServiceConfig['paths']) {
	basePath = resolve(basePath);
	for (let [key, path] of Object.entries(paths)) {
		const mappingBasePath = join(basePath, path);
		log.debug(`Serving mapping ${key} to ${mappingBasePath}`);

		app.routes.push(
			route({
				before: [noCache],
				guards: [method.get(key)],
				middleware: serve({ basePath: mappingBasePath }),
				transforms: [jsonTransform]
			})
		);
	}
}
