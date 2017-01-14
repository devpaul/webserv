import Group from './handlers/Group';
import Functional from './handlers/Functional';
import ServeFile from './middleware/ServeFile';
import ServeDirectory from './middleware/ServeDirectory';
import Proxy from './middleware/Proxy';
import * as filter from './handlers/filter';
import * as route from './handlers/route';
import * as transform from './handlers/transform';

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
	Proxy,
	ServeDirectory,
	ServeFile
};
