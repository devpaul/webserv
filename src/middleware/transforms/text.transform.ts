import { Transform } from '../../core/interface';

export const textTransform: Transform = async (result, _request, response) => {
	if (!response.statusCode) {
		response.statusCode = 200;
	}
	response.setHeader('content-type', 'text/html');

	const eol = '\n';
	const output = Array.isArray(result)
		? result.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(eol)
		: JSON.stringify(result);

	response.end(output);
};
