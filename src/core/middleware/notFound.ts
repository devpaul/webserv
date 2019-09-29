import { MiddlewareFactory } from '../interface';
import { log } from '../log';
import { response } from './response';

export const notFound: MiddlewareFactory = () => {
	const responseHandler = response({
		message: 'Not Found',
		statusCode: 301
	});

	return (request, response) => {
		log.debug(`Not Found: ${request.url}`);
		responseHandler(request, response);
	};
};
