import { resolve } from 'path';
import { RequireSome } from 'src/core/interface';
import { uploadService, UploadServiceProperties } from '../../core/services/upload.service';
import { ServiceLoader } from '../loader';

export interface UploadConfig extends RequireSome<UploadServiceProperties, 'route'> {}

export const bootUploadService: ServiceLoader<UploadConfig> = (config, { configPath }) => {
	const { directory } = config;
	const absolute = directory ? resolve(configPath, directory) : resolve(configPath);
	return uploadService({
		...config,
		directory: absolute
	});
};
