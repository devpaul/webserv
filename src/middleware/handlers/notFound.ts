import { HandlerFactory } from '../../core/interface';
import { log } from '../../core/log';
import { response } from './response';

export const notFound: HandlerFactory = () => {
	const responseHandler = response({
		message: 'Not Found',
		statusCode: 404
	});

	return (request, response) => {
		log.debug(`Not Found: ${request.url}`);
		responseHandler(request, response);
	};
};
