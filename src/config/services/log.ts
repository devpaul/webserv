import { setLogLevel } from '../../core/log';
import { response } from '../../core/middleware/response';
import { body } from '../../core/processors/before/body.processor';
import { logRequest } from '../../core/processors/log.processor';
import { SimpleServiceLoader } from '../loader';

export interface LogConfig {
	level?: string;
	respondOk?: boolean;
}

export const bootLogService: SimpleServiceLoader<LogConfig> = (config) => {
	const { level, respondOk } = config;

	level && setLogLevel(level);
	return {
		global: {
			before: [body({}), logRequest({ logBody: true })]
		},
		route: respondOk
			? {
					middleware: response({ statusCode: 200 })
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  }
			: undefined
	};
};
