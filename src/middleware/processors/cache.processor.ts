import { ProcessFactory } from '../../core/interface';
import { header } from './header.processor';

export type CacheMethods =
	| 'must-revalidate'
	| 'no-cache'
	| 'no-store'
	| 'no-transform'
	| 'public'
	| 'private'
	| 'proxy-revalidate'
	| string;

export interface CacheProperties {
	cacheMethod: CacheMethods;
}

export const cache: ProcessFactory<CacheProperties> = ({ cacheMethod }) => {
	return header({ 'Cache-Control': cacheMethod });
};

export const noCache = cache({ cacheMethod: 'no-cache' });
