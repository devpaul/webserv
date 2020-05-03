import { HandlerFactory } from '../../core/interface';
import { log } from '../../core/log';
import { response } from './response';

export interface ForwarderProperties {
	location: string;
}

export const forwarder: HandlerFactory<ForwarderProperties> = ({ location }) => {
	const responseHandler = response({
		header: { Location: location },
		statusCode: 301
	});

	return (request, response) => {
		log.debug(`Forwarding ${request.url} to ${location}`);
		responseHandler(request, response);
	};
};
