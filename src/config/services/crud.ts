import { crudService, CrudServiceProperties } from '../../core/services/crud.service';

import { App } from '../../core/app';

export interface CrudConfig extends CrudServiceProperties {
	path: string;
}

export function bootCrudService(app: App, config: CrudConfig) {
	app.addService(crudService(config));
}
