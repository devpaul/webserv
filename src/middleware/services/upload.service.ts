import { join } from 'path';
import { Service } from '../../core/app';
import { RouteProperties, Transform } from '../../core/interface';
import { method } from '../guards/method';
import { pathGuard } from '../guards/path';
import { saveFiles, SaveFilesProperties } from '../middleware/saveFiles';
import { serve } from '../middleware/serve';
import { serveFile } from '../middleware/serveFile';
import { fileProcessor } from '../processors/before/file.processor';
import { directoryTransform } from '../transforms/directory.transform';
import { htmlTemplate } from '../util/htmlTemplate';

export interface UploadServiceProperties extends SaveFilesProperties, RouteProperties {}

export function uploadService(props: UploadServiceProperties): Service {
	const { route = '*', directory } = props;

	return {
		route: {
			guards: [pathGuard({ match: route })],
			middleware: [
				{
					before: [fileProcessor],
					guards: [method.post()],
					middleware: saveFiles(props),
					transforms: [fileUploadTransform]
				},
				{
					guards: [method.get('list')],
					middleware: serve({ basePath: directory }),
					transforms: [directoryTransform]
				},
				{
					guards: [method.get()],
					middleware: serveFile({ path: join(__dirname, 'upload', 'upload.html') })
				}
			]
		}
	};
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
		const successful = result.files.map((file) => `<li>${file}</li>`);
		const failed = result.failed.map((file) => `<li>${file}</li>`);
		const body = `
		<div>
			<h1>Successfully Uploaded</h1>
			<ul>${successful}</ul>
		</div>
		${
			failed.length
				? `
			<div>
				<h1>Failed</h1>
				<ul>${failed}</ul>
			</div>
			`
				: ''
		}`;
		const html = htmlTemplate('Upload Complete', body);
		response.write(html);
		response.end();
	}
};
