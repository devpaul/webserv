import { ProcessFactory } from "../interface";
import { header } from "./header.processor";

export interface CorsProperties {
	origin?: string;
}

export const cors: ProcessFactory<CorsProperties> = ({ origin = '*' }) => {
	return header({
		'Access-Control-Allow-Origin': origin
	});
}
