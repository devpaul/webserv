import { join } from 'path';

import { method } from '../guards/method';
import { Transform } from '../interface';
import { saveFiles, SaveFilesProperties } from '../middleware/saveFiles';
import { serve } from '../middleware/serve';
import { fileProcessor } from '../processors/file.processor';
import { directoryTransform } from '../transforms/directory.transform';
import { htmlTemplate } from '../util/htmlTemplate';
import { route } from './route';

export interface UploadRouteProperties {
	allowOverwrite?: boolean;
	createUploadDirectory?: boolean;
	directory: string;
}

interface FileUploadResult {
	files: string[];
	failed: string[];
}

function isFileUploadResult(value: any): value is FileUploadResult {
	return value && typeof value === 'object' && value.files && value.failed;
}

export const fileUploadTransform: Transform = (result, _request, response) => {
	if (isFileUploadResult(result)) {
		const successful = result.files.map(file => `<li>${file}</li>`);
		const failed = result.failed.map(file => `<li>${file}</li>`);
		const body = `
		<div>
			<h1>Successfully Uploaded</h1>
			<ul>${successful}</ul>
		</div>
		${ (failed.length) ? `
			<div>
				<h1>Failed</h1>
				<ul>${failed}</ul>
			</div>
			` : ''
		}`;
		const html = htmlTemplate('Upload Complete', body);
		response.write(html);
		response.end();
	}
};

export const uploadRoute = (options: SaveFilesProperties) => {
	return route({
		middleware: [
			route({
				before: [ fileProcessor ],
				guards: [ method.post() ],
				middleware: saveFiles(options),
				transforms: [ fileUploadTransform ]
			}),
			route({
				guards: [ method.get('/list') ],
				middleware: serve({ basePath: options.directory }),
				transforms: [ directoryTransform ]
			}),
			route({
				guards: [ method.get() ],
				middleware: serve({ basePath: join(__dirname, 'pages', 'upload.html') })
			})
		]
	});
}
