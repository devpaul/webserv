import { join, resolve } from 'path';

import { App } from '../../core/app';
import { method } from '../../core/guards/method';
import { log } from '../../core/log';
import { serve } from '../../core/middleware/serve';
import { noCache } from '../../core/processors/cache.processor';
import { route } from '../../core/routes/route';
import { jsonTransform } from '../../core/transforms/json.transform';
import { directoryTransform } from '../../core/transforms/directory.transform';

export interface FileConfig {
	basePath?: string;
	paths: { [key: string]: string };
}

export function bootFileService(app: App, config: FileConfig, configPath: string) {
	const { paths = {}, basePath } = config;
	const absolutePath = basePath ? resolve(configPath, basePath) : resolve(configPath);

	for (let [key, path] of Object.entries(paths)) {
		const mappingBasePath = join(absolutePath, path);
		log.debug(`Serving mapping ${key} to ${mappingBasePath}`);

		app.routes.push(
			route({
				before: [noCache],
				guards: [method.get(key)],
				middleware: serve({ basePath: mappingBasePath }),
				transforms: [directoryTransform, jsonTransform]
			})
		);
	}
}
