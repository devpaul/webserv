import { crudService, CrudServiceProperties } from '../../core/services/crud.service';
import { SimpleServiceLoader } from '../loader';

export interface CrudConfig extends CrudServiceProperties {
	path: string;
}

export const bootCrudService: SimpleServiceLoader<CrudConfig> = (config) => crudService(config);
