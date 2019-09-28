import { join } from 'path';

import { method } from '../guards/method';
import { Transform } from '../interface';
import { saveFiles, SaveFilesProperties } from '../middleware/saveFiles';
import { serve } from '../middleware/serve';
import { fileProcessor } from '../processors/file.processor';
import { route } from './route';
import { directoryTransform } from '../transforms/directory.transform';

export interface UploadRouteProperties {
	allowOverwrite?: boolean;
	createUploadDirectory?: boolean;
	directory: string;
}

export const fileUploadTransform: Transform = (result, request, response) => {
	const html = htmlTemplate('Upload Complete', JSON.stringify(result));
	response.write(html);
	response.end();
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
				guards: [ method.get('list') ],
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
