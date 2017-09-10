import { IncomingMessage, request as httpRequest, RequestOptions } from 'http';

export default function fetch(config: RequestOptions): Promise<IncomingMessage> {
	return new Promise((resolve, reject) => {
		const request = httpRequest(config, (response) => {
			if (response.statusCode >= 200 && response.statusCode < 300) {
				resolve(response);
			}
			reject(new Error(`status code ${ response.statusCode }`));
		});

		request.on('error', reject);
		request.end();
	});
}
