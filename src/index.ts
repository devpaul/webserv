import Group from './handlers/Group';
import Functional from './handlers/Functional';
import ServeFile from './middleware/ServeFile';
import ServeDirectory from './middleware/ServeDirectory';
import Proxy from './middleware/Proxy';
import * as filter from './handlers/util/filter';

export { default as WebServer } from './WebServer';
export { default as WebApplication } from './WebApplication';

export const handlers = {
	Group,
	Functional,
	util: {
		filter
	}
};

export const middleware = {
	Proxy,
	ServeDirectory,
	ServeFile
};
