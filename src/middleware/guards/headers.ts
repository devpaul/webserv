import { IncomingHttpHeaders } from 'http';
import { GuardFactory } from '../../core/interface';

type HeaderGuardProperties<K extends IncomingHttpHeaders = IncomingHttpHeaders> = {
	[P in keyof K]: string;
};

export const headerGuard: GuardFactory<HeaderGuardProperties> = (headers) => {
	const list = Object.entries(headers);

	return (request) => {
		for (let [name, value] of list) {
			if (request.headers[name] !== value) {
				return false;
			}
		}

		return true;
	};
};
