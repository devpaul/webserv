import { join, resolve } from 'path';
import { log } from '../../core/log';
import { fileService, FileServiceProperties } from '../../core/services/file.service';
import { ServiceLoader } from '../loader';

export interface FileConfig extends Omit<FileServiceProperties, 'basePath' | 'path'> {
	basePath?: string;
	routes: { [key: string]: string };
}

export const bootFileService: ServiceLoader<FileConfig> = (config, { configPath }) => {
	const { routes = {}, basePath, ...extraConfig } = config;
	const absolutePath = basePath ? resolve(configPath, basePath) : resolve(configPath);
	return Object.entries(routes).map(([key, path]) => {
		const mappingBasePath = join(absolutePath, path);
		log.debug(`Serving mapping ${key} to ${mappingBasePath}`);
		return fileService({
			...extraConfig,
			route: key,
			basePath: mappingBasePath
		});
	});
};
