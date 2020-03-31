import { ServiceLoader } from '../../../../../src/config/loader';
import { jsonTransform } from '../../../../../src/core/transforms/json.transform';

export interface HelloConfig {
	who?: string;
}

const loader: ServiceLoader<HelloConfig> = ({ who = 'world' }) => {
	return {
		route: {
			middleware() {
				return {
					hello: who
				};
			},
			transforms: [jsonTransform]
		}
	};
};

export default loader;
