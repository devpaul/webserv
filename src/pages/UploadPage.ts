import Response from 'src/middleware/Response';
import { htmlTemplate } from '../util/templates';

function form() {
	return htmlTemplate(`
<form method="post" enctype="multipart/form-data">
<p>
	<input type="file" name="uploadedFiles" multiple>
</p>
<p>
	<input type="submit" value="Upload file">
</p>
	`, 'Upload File');
}

export default class UploadPage extends Response {
	constructor() {
		super({
			message: form()
		});
	}
}
