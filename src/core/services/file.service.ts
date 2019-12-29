import { Service } from '../app';
import { method } from '../guards/method';
import { serve, ServeProperties } from '../middleware/serve';
import { noCache } from '../processors/cache.processor';
import { directoryTransform } from '../transforms/directory.transform';
import { jsonTransform } from '../transforms/json.transform';

export interface FileServiceProperties extends ServeProperties {
	path?: string;
}

export function fileService(props: FileServiceProperties): Service {
	const { path = '*' } = props;

	return {
		route: {
			before: [noCache],
			guards: [method.get(path)],
			middleware: serve(props),
			transforms: [directoryTransform, jsonTransform]
		}
	};
}
