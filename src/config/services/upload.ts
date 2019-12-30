import { uploadService, UploadServiceProperties } from '../../core/services/upload.service';

import { App } from '../../core/app';
import { resolve } from 'path';

export interface UploadConfig extends UploadServiceProperties {
	path: string;
}

export function bootUploadService(app: App, config: UploadConfig, configPath: string) {
	const { directory } = config;
	const absolute = directory ? resolve(configPath, directory) : resolve(configPath);
	app.addService(
		uploadService({
			...config,
			directory: absolute
		})
	);
}
