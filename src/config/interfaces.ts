import { Service } from '../core/app';
import { Factory } from './Injector';

export type Eventually<T> = Promise<T> | T;

export type ServiceFactory<CONFIG extends object> = Factory<ServiceFactoryResult, CONFIG>;

export type ServiceFactoryResult = Eventually<Service | Service[]>;
