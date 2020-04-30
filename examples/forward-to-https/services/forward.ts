import { ServiceLoader } from '../../../src/config/loader';
import { Service } from '../../../src/core/app';
import { forwarder } from '../../../src/core/middleware/forwarder';

export interface Config {
	location: string;
}

/**
 * Forward http users to https
 */
const forward: ServiceLoader<Config> = ({ location }) => {
	const service: Service = {
		route: {
			middleware: forwarder({
				location
			})
		}
	};
	return service;
};

export default forward;
