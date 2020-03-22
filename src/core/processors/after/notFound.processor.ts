import { HttpError, HttpStatus } from '../../../core/HttpError';
import { Process } from '../../../core/interface';

/**
 * After Process throws when a response hasn't been provided
 */
export const notFound: Process = (_request, response) => {
	if (!response.finished) {
		throw new HttpError(HttpStatus.NotFound);
	}
};
