import { ServiceLoader } from '..';
import { bootFileService } from './file';
import { bootProxyService } from './proxy';
import { bootCrudService } from './crud';
import { bootLogService } from './log';
import { bootUploadService } from './upload';
import { bootChatService } from './chat';

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
