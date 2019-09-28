import { IncomingMessage } from 'http';
import { Guard, GuardFactory } from '../interface';

export interface SomeProperties {
	guards: Guard[];
}

export const some: GuardFactory<SomeProperties> = ({ guards }) => {
	return (request: IncomingMessage) => {
		for (const guard of guards) {
			if (guard(request)) {
				return true;
			}
		}
		return false;
	}
}

export const every: GuardFactory<SomeProperties> = ({ guards }) => {
	return (request: IncomingMessage) => {
		for (const guard of guards) {
			if (!guard(request)) {
				return false;
			}
		}
		return true;
	}
}
