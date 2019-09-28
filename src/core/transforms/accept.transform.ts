import { Transform } from "../interface";
import { jsonTransform } from "./json.transform";

export interface AcceptProperties {
	[ match: string ]: Transform;
}

export const acceptTransform: Transform = (result, request, response) => {
	if (request.headers['accept']) {
		// TODO support accept headers
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept
	}
	jsonTransform(result, request, response);
}
