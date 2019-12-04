import { App } from '../../core/app';
import { setLogLevel } from '../../core/log';
import { body } from '../../core/processors/body.processor';
import { logRequest } from '../../core/processors/log.processor';
import { route } from '../../core/routes/route';
import { response } from '../../core/middleware/response';

export interface LogConfig {
	level?: string;
	respondOk?: boolean;
}

export function bootLogService(app: App, config: LogConfig) {
	const { level, respondOk } = config;

	level && setLogLevel(level);
	app.before.push(body({}), logRequest({ logBody: true }));
	respondOk && app.routes.push(route({ middleware: response({ statusCode: 200 }) }));
}
