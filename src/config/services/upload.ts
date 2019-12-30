import { uploadService, UploadServiceProperties } from '../../core/services/upload.service';

import { App } from '../../core/app';

export interface UploadConfig extends UploadServiceProperties {
	path: string;
}

export function bootUploadService(app: App, config: UploadConfig) {
	app.addService(uploadService(config));
}
