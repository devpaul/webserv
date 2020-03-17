import { join, resolve } from 'path';
import { log } from '../../core/log';
import { fileService, FileServiceProperties } from '../../core/services/file.service';
import { ServiceLoader } from '../loader';

export interface FileConfig extends Omit<FileServiceProperties, 'basePath' | 'path'> {
	basePath?: string;
	paths: { [key: string]: string };
}

export const bootFileService: ServiceLoader<FileConfig> = (config, { configPath }) => {
	const { paths = {}, basePath, ...extraConfig } = config;
	const absolutePath = basePath ? resolve(configPath, basePath) : resolve(configPath);
	return Object.entries(paths).map(([key, path]) => {
		const mappingBasePath = join(absolutePath, path);
		log.debug(`Serving mapping ${key} to ${mappingBasePath}`);
		return fileService({
			...extraConfig,
			path: key,
			basePath: mappingBasePath
		});
	});
};
