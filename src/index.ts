import start from './config';
import { setLoader } from './config/loader';

export { ServiceLoader } from './config/loader';
export { Service } from './core/app';
export * from './core/interface';
export { start };
export const register = setLoader;
