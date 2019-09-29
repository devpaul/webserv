export interface ContentHandler<T> {
	type: string;
	subtype: string;
	handler: T;
}

interface Accepts {
	type: string;
	subtype: string;
	quality: number;
}

function getAccepts(accepts: string): Accepts[] {
	return accepts.split(',').map((_) => {
		const [accept, quality = 1] = _.split(';q=');
		const [type, subtype] = accept.split('/');
		return {
			type,
			subtype,
			quality: typeof quality === 'number' ? quality : parseInt(quality, 10)
		};
	});
}

export function contentNegotiator<T>(
	handlers: ContentHandler<T>[],
	defaultHandler?: T
): (accept: string) => T | undefined {
	return (accepts: string = '*/*') => {
		const list = getAccepts(accepts);

		let found: { handler?: T; quality: number } = { handler: defaultHandler, quality: 0 };
		for (let { type, subtype, quality } of list) {
			for (let meta of handlers) {
				if (
					(type === '*' || (type === meta.type && (subtype === '*' || subtype === meta.subtype))) &&
					quality > found.quality
				) {
					found = { handler: meta.handler, quality };
				}
				if (found.quality === 1) {
					break;
				}
			}
		}

		return found.handler;
	};
}
