import { Service } from '../../core/app';
import { RouteProperties } from '../../core/interface';
import { method } from '../guards/method';
import { serve, ServeProperties } from '../middleware/serve';
import { noCache } from '../processors/cache.processor';
import { directoryTransform } from '../transforms/directory.transform';
import { jsonTransform } from '../transforms/json.transform';

export interface FileServiceProperties extends ServeProperties, RouteProperties {}

export function fileService(props: FileServiceProperties): Service {
	const { route = '*' } = props;

	return {
		route: {
			before: [noCache],
			guards: [method.get(route)],
			middleware: serve(props),
			transforms: [directoryTransform, jsonTransform]
		}
	};
}
