import { App } from '../../core/app';
import { pathGuard } from '../../core/guards/path';
import { crudRoute, CrudProperties } from '../../core/routes/crud.route';
import { route } from '../../core/routes/route';

export interface CrudConfig extends CrudProperties {
	route: string;
}

export function bootCrudService(app: App, config: CrudConfig) {
	const { route: match, data } = config;
	app.routes.push(
		route({
			guards: [pathGuard({ match })],
			middleware: [crudRoute({ data })]
		})
	);
}
