import { join, resolve } from 'path';
import { fileService, FileServiceProperties } from '../../core/services/file.service';
import { App } from '../../core/app';
import { log } from '../../core/log';

export interface FileConfig extends Omit<FileServiceProperties, 'basePath' | 'path'> {
	basePath?: string;
	paths: { [key: string]: string };
}

export function bootFileService(app: App, config: FileConfig, configPath: string) {
	const { paths = {}, basePath, ...extraConfig } = config;
	const absolutePath = basePath ? resolve(configPath, basePath) : resolve(configPath);

	for (let [key, path] of Object.entries(paths)) {
		const mappingBasePath = join(absolutePath, path);
		log.debug(`Serving mapping ${key} to ${mappingBasePath}`);

		app.addService(
			fileService({
				...extraConfig,
				path: key,
				basePath: mappingBasePath
			})
		);
	}
}
