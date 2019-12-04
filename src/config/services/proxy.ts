import { App } from '../../core/app';
import { ProxyProperties, proxyRoute } from '../../core/routes/proxy.route';
import { route } from '../../core/routes/route';

export interface ProxyConfig extends ProxyProperties {}

export function bootProxyService(app: App, config: ProxyConfig) {
	const { target, changeOrigin = true, followRedirects = false, ws = true } = config;
	const { middleware, upgrader } = proxyRoute({
		target,
		changeOrigin,
		followRedirects,
		ws
	});
	app.routes.push(
		route({
			middleware
		})
	);
	app.upgrader = upgrader;
}
