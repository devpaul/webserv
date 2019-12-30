import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../../../core/log';
import send from 'send';

export function sendFile(request: IncomingMessage, response: ServerResponse, target: string) {
	return new Promise<void>((resolve, reject) => {
		log.debug(`ServePath: serving file "${target}"`);
		send(request, target, {
			dotfiles: 'deny',
			index: false
		})
			.on('end', function() {
				response.end();
				resolve();
			})
			.on('error', reject)
			.pipe(response);
	});
}
