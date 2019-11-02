import { Transform } from '../interface';
import { getParams } from '../util/request';
import { parse } from 'url';
import { join } from 'path';
import { htmlTemplate } from '../util/htmlTemplate';
import slash from 'slash';

export interface Directory {
	directory: string;
	files: string[];
}

function isDirectoryResult(result: any): result is Directory {
	return result && typeof result === 'object' && result.directory && result.files;
}

export const directoryTransform: Transform = (result, request, response) => {
	if (!isDirectoryResult(result)) {
		return;
	}

	const { originalUrl, url } = getParams(request, 'originalUrl', 'url');
	const baseUrl = parse(originalUrl || url.pathname).pathname;

	const fileLinks = result.files
		.map((file) => {
			const relative = slash(file);
			const url = slash(join(baseUrl, file));
			return `<a href="${url}">${relative}</a>`;
		})
		.join('<br>');
	response.write(htmlTemplate('Directory listing', fileLinks));
	response.end();
};
