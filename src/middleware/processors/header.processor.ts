import { ProcessFactory } from '../../core/interface';

export interface HeaderProperties {
	[key: string]: string;
}

export const header: ProcessFactory<HeaderProperties> = (headers) => {
	return (_request, response) => {
		for (let [header, value] of Object.entries(headers)) {
			response.setHeader(header, value);
		}
	};
};
