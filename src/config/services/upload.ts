import { App } from '../../core/app';
import { pathGuard } from '../../core/guards/path';
import { route } from '../../core/routes/route';
import { uploadRoute, UploadRouteProperties } from '../../core/routes/upload.route';

export interface UploadConfig extends UploadRouteProperties {
	route: string;
}

export function bootUploadService(app: App, config: UploadConfig) {
	const { route: match } = config;
	app.routes.push(
		route({
			guards: [pathGuard({ match })],
			middleware: [uploadRoute(config)]
		})
	);
}
