import { createProxy, CreateProxyOptions } from '../util/createProxy';
import { proxy as proxyMiddleware } from '../middleware/proxy';
import { proxyUpgrade } from '../upgrades/proxy.upgrade';

export interface ProxyProperties extends CreateProxyOptions {
	baseDir?: string;
}

export function proxyRoute(props: ProxyProperties) {
	const baseUrl = props.baseDir || '/';
	const proxy = createProxy(props);

	return {
		middleware: proxyMiddleware({ baseUrl, proxy }),
		upgrader: proxyUpgrade({ baseUrl, proxy })
	};
}
