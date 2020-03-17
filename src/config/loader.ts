import { Service } from 'src/core/app';
import { bootFileService } from './services/file';
import { bootProxyService } from './services/proxy';
import { bootCrudService } from './services/crud';
import { bootLogService } from './services/log';
import { bootUploadService } from './services/upload';
import { bootChatService } from './services/chat';

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

export function setLoader(name: string, handler: ServiceLoader) {
	serviceMap[name] = handler;
}

export function getLoader(name: string): ServiceLoader {
	const handler = serviceMap[name];
	if (!handler) {
		throw new Error(`unknown service ${name}`);
	}
	return handler;
}
