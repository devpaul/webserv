import { createProxy, CreateProxyOptions } from '../util/createProxy';
import { proxy as proxyMiddleware } from '../middleware/proxy';
import { proxyUpgrade } from '../upgrades/proxy.upgrade';
import { Service } from '../app';

export interface ProxyServiceProperties extends CreateProxyOptions {
	baseDir?: string;
}

export function proxyService(props: ProxyServiceProperties): Service {
	const baseUrl = props.baseDir || '/';
	const proxy = createProxy(props);

	return {
		route: {
			middleware: proxyMiddleware({ baseUrl, proxy })
		},
		upgrade: {
			upgrade: proxyUpgrade({ baseUrl, proxy })
		}
	};
}
