import { Service } from '../../core/app';
import { RouteProperties } from '../../core/interface';
import { proxy as proxyMiddleware } from '../middleware/proxy';
import { proxyUpgrade } from '../upgrades/proxy.upgrade';
import { createProxy, CreateProxyOptions } from '../util/createProxy';

export interface ProxyServiceProperties extends CreateProxyOptions, RouteProperties {}

export function proxyService(props: ProxyServiceProperties): Service {
	const route = props.route || '/';
	const proxy = createProxy(props);

	return {
		route: {
			middleware: proxyMiddleware({ baseUrl: route, proxy })
		},
		upgrade: {
			upgrade: proxyUpgrade({ baseUrl: route, proxy })
		}
	};
}
