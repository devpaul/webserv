import { ServiceFactory } from 'src/config/interfaces';
import { proxyService, ProxyServiceProperties } from '../../../middleware/services/proxy.service';

export interface ProxyConfig extends ProxyServiceProperties {}

export const proxyServiceFactory: ServiceFactory<ProxyConfig> = (config) => {
	const { target, changeOrigin = true, followRedirects = false, ws = true } = config;
	return proxyService({
		target,
		changeOrigin,
		followRedirects,
		ws,
		...config
	});
};
