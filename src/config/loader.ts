import { Service } from 'src/core/app';
import { bootChatService } from './services/chat';
import { bootCrudService } from './services/crud';
import { bootFileService } from './services/file';
import { bootLogService } from './services/log';
import { bootProxyService } from './services/proxy';
import { bootUploadService } from './services/upload';

export interface Environment {
	configPath: string;
	properties: { [key: string]: any };
}

export type ServiceLoaderResult = Promise<Service | Service[]> | Service | Service[];

export type SimpleServiceLoader<C = any> = (config: C) => ServiceLoaderResult;

export type ServiceLoader<C = any> = (config: C, env: Environment) => ServiceLoaderResult;

const serviceMap: { [key: string]: ServiceLoader } = {
	chat: bootChatService,
	crud: bootCrudService,
	file: bootFileService,
	log: bootLogService,
	proxy: bootProxyService,
	upload: bootUploadService
};

function isServiceLoader(value: any): value is ServiceLoader {
	return value && typeof value === 'function';
}

export function setLoader(name: string, handler: ServiceLoader | string) {
	if (typeof handler === 'string') {
		const loader = require(handler);
		if (typeof loader === 'object') {
			if (isServiceLoader(loader.default)) {
				serviceMap[name] = loader.default;
			} else if (isServiceLoader(loader)) {
				serviceMap[name] = loader;
			} else if (isServiceLoader(loader.loader)) {
				serviceMap[name] = loader.loader;
			} else {
				throw new Error(`"${handler}" is not a service loader`);
			}
		} else {
			throw new Error(`"${handler}" is not a service loader`);
		}
	} else {
		serviceMap[name] = handler;
	}
}

export function getLoader(name: string): ServiceLoader {
	const handler = serviceMap[name];
	if (!handler) {
		throw new Error(`unknown service ${name}`);
	}
	return handler;
}
