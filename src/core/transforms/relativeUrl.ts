import { Transform } from '../handlers/transform';
import { IncomingMessage } from 'http';
import { descriptorWrapper } from '../util/proxies';
import { parse as parseUrl, format as formatUrl } from 'url';

/**
 * A helper transform used to change the pathname of the url
 *
 * @param match text to match
 * @param replace text to replace
 * @return a function that transforms an IncomingMessage
 */
export default function relativeUrl(match: string, replace: string = ''): Transform {
	return function(request: IncomingMessage) {
		return descriptorWrapper(request, {
			originalUrl: {
				get() {
					return request.url;
				}
			},
			url: {
				get() {
					const requestUrl = parseUrl(request.url);
					if (requestUrl.path.indexOf(match) === 0) {
						requestUrl.pathname = replace + requestUrl.pathname.substring(match.length) || '/';
						requestUrl.path = requestUrl.pathname + requestUrl.search;
					}
					return formatUrl(requestUrl);
				}
			}
		});
	};
}
