import Group from './handlers/Group';
import Route from './handlers/Route';
import Functional from './handlers/Functional';
import * as route from './handlers/Route';
import ServeFile from './middleware/ServeFile';
import ServeDirectory from './middleware/ServeDirectory';
import Proxy from './middleware/Proxy';

export { default as WebServer } from './WebServer';
export { default as WebApplication } from './WebApplication';

export const handlers = {
	Group,
	Functional,
	Route,
	route
};

export const middleware = {
	Proxy,
	ServeDirectory,
	ServeFile
};
