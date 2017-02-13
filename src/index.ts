import Group from './handlers/Group';
import Functional from './handlers/Functional';
import ServeFile from './middleware/ServeFile';
import ServeDirectory from './middleware/ServeDirectory';
import WebProxy from './middleware/WebProxy';
import * as filter from './handlers/filter';
import * as route from './handlers/route';
import * as transform from './handlers/transform';
import * as proxies from './util/proxies';

export { default as WebServer } from './WebServer';
export { default as WebApplication } from './WebApplication';

export const handlers = {
	Group,
	Functional,
	filter,
	route,
	transform
};

export const middleware = {
	WebProxy,
	ServeDirectory,
	ServeFile
};

export const util = {
	proxies
};
