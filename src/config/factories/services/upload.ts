import { resolve } from 'path';
import { RequireSome } from '../../../core/interface';
import { uploadService, UploadServiceProperties } from '../../../middleware/services/upload.service';
import { ServiceFactory } from '../../interfaces';
import { $Env, Environment } from '../../utils/environment';

export interface UploadConfig extends RequireSome<UploadServiceProperties, 'route'> {
	[$Env]: Environment;
}

export const uploadServiceFactory: ServiceFactory<UploadConfig> = ({ [$Env]: { configPath }, ...config }) => {
	const { directory } = config;
	const absolute = directory ? resolve(configPath, directory) : resolve(configPath);
	return uploadService({
		...config,
		directory: absolute
	});
};
