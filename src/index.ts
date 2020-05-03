import start from './config';
import { getServiceInjector } from './config/factories/loader';

export { ServiceFactory, ServiceFactoryResult } from './config/interfaces';
export { Service } from './core/app';
export * from './core/interface';
export { start };
export const register = getServiceInjector;
