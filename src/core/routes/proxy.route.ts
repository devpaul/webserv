import { createProxy } from "../util/createProxy"
import { proxy as proxyMiddleware } from '../middleware/proxy';
import { proxyUpgrade } from "../upgrades/proxy.upgrade";

export interface ProxyProperties {
	target: string;
}

export function proxyRoute({ target }: ProxyProperties) {
	const baseUrl = '/';
	const proxy = createProxy({ target });

	return {
		middleware: proxyMiddleware({ baseUrl, proxy }),
		upgrader: proxyUpgrade({ baseUrl, proxy })
	};
}
