import start from './config';
import { createInjector } from './config/injector';
import * as guards from './middleware/guards';
import * as handlers from './middleware/handlers';
import * as processor from './middleware/processors';
import * as services from './middleware/services';
import * as transforms from './middleware/transforms';
import * as upgrades from './middleware/upgrades';
import * as util from './middleware/util';

export { ServiceFactory, ServiceFactoryResult } from './config/interfaces';
export { Service } from './core/app';
export * from './core/interface';
export { start, guards, handlers, processor, services, transforms, upgrades, util };

export type MiddlewareType = 'service' | 'guard' | 'process' | 'transform' | 'handler' | 'upgrade';
export const register = (type: MiddlewareType) => createInjector(type);
export default start;
