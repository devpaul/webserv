import { Transform } from '../interface';

export const textTransform: Transform = async (result, request, response) => {
	if (!response.statusCode) {
		response.statusCode = 200;
	}
	response.setHeader('content-type', 'text/html');

	response.end(result && typeof result === 'string' ? result : JSON.stringify(result));
}
