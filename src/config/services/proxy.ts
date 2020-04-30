import { proxyService, ProxyServiceProperties } from '../../core/services/proxy.service';
import { SimpleServiceLoader } from '../loader';

export interface ProxyConfig extends ProxyServiceProperties {}

export const bootProxyService: SimpleServiceLoader<ProxyConfig> = (config) => {
	const { target, changeOrigin = true, followRedirects = false, ws = true } = config;
	return proxyService({
		target,
		changeOrigin,
		followRedirects,
		ws,
		...config
	});
};
