import { createInjector } from '../injector';
import { ServiceFactoryResult } from '../interfaces';
import { chatServiceFactory } from './services/chat';
import { crudServiceFactory } from './services/crud';
import { fileServiceFactory } from './services/file';
import { logServiceFactory } from './services/log';
import { proxyServiceFactory } from './services/proxy';
import { uploadServiceFactory } from './services/upload';

export function getServiceInjector() {
	return createInjector<ServiceFactoryResult>('service', [
		['chat', chatServiceFactory],
		['crud', crudServiceFactory],
		['file', fileServiceFactory],
		['log', logServiceFactory],
		['proxy', proxyServiceFactory],
		['upload', uploadServiceFactory]
	]);
}
