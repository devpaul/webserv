import { ProcessFactory } from "../interface";

export interface HeaderProperties {
	[ key: string ]: string;
}

export const header: ProcessFactory<HeaderProperties> = (headers) => {
	return (request, response) => {
		for (let [ header, value ] of Object.entries(headers)) {
			response.setHeader(header, value);
		}
	}
}
