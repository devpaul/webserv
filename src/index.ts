import Group from './handlers/Group';
import Route from './handlers/Route';
import Functional from './handlers/Functional';
import * as route from './handlers/Route';
import ServeFile from './middleware/ServeFile';
import ServeDirectory from './middleware/ServeDirectory';

export { default as WebServer } from './WebServer';
export { default as WebApplication } from './WebApplication';

export const handlers = {
	Group,
	Functional,
	Route,
	route
};

export const middleware = {
	ServeDirectory,
	ServeFile
};
