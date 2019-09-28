import { Transform } from "../interface";

export const jsonTransform: Transform = (result, _request, response) => {
	if (!response.statusCode) {
		response.statusCode = 200;
	}
	response.setHeader('content-type', 'application/json');

	response.end(result && JSON.stringify(result));
}
