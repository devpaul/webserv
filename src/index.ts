import Group from './handlers/Group';
import Route from './handlers/Route';
import * as route from './handlers/Route';

export { default as WebServer } from './WebServer';
export { default as WebApplication } from './WebApplication';

export const handlers = {
	Group,
	Route,
	route
};
