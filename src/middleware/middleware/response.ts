import { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'http';
import { MiddlewareFactory } from '../../core/interface';

export interface ResponseProperties {
	header?: OutgoingHttpHeaders;
	statusCode: number;
	message?: string | Buffer;
}

export const response: MiddlewareFactory<ResponseProperties> = ({ header, statusCode, message }) => {
	return async (_request: IncomingMessage, response: ServerResponse) => {
		response.writeHead(statusCode, header);
		response.end(message);
	};
};
