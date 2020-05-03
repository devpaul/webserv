import { join, resolve } from 'path';
import { log } from '../../../core/log';
import { fileService, FileServiceProperties } from '../../../core/services/file.service';
import { ServiceFactory } from '../../interfaces';
import { $Env, Environment } from '../../utils/environment';

export interface FileConfig extends Omit<FileServiceProperties, 'basePath' | 'path'> {
	basePath?: string;
	routes: { [key: string]: string };
	[$Env]: Environment;
}

export const fileServiceFactory: ServiceFactory<FileConfig> = (config) => {
	const configPath = config[$Env].configPath;
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
