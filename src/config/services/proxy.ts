import { proxyService, ProxyServiceProperties } from '../../core/services/proxy.service';

import { App } from '../../core/app';

export interface ProxyConfig extends ProxyServiceProperties {}

export function bootProxyService(app: App, config: ProxyConfig) {
	const { target, changeOrigin = true, followRedirects = false, ws = true } = config;
	const service = proxyService({
		target,
		changeOrigin,
		followRedirects,
		ws
	});
	app.addService(service);
}
