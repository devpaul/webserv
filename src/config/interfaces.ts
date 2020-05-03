import { Service } from '../core/app';
import { Eventually } from '../core/interface';
import { Factory } from './injector';

export type ServiceFactory<CONFIG extends object> = Factory<ServiceFactoryResult, CONFIG>;

export type ServiceFactoryResult = Eventually<Service | Service[]>;
