import { ServiceFactory } from 'src/config/interfaces';
import { response } from '../../../middleware/middleware/response';
import { body } from '../../../middleware/processors/before/body.processor';
import { logRequest } from '../../../middleware/processors/log.processor';

export interface LogConfig {
	respondOk?: boolean;
}

export const logServiceFactory: ServiceFactory<LogConfig> = (config) => {
	const { respondOk } = config;

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
