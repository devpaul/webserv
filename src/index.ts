import Group from './handlers/Group';
import Functional from './handlers/Functional';
import ServeFile from './middleware/ServeFile';
import ServeDirectory from './middleware/ServeDirectory';
import WebProxy from './middleware/WebProxy';
import * as filter from './handlers/filter';
import * as route from './handlers/route';
import * as transform from './handlers/transform';
import * as proxies from './util/proxies';
import WebApplication from './middleware/WebApplication';
import HttpsServer from './servers/HttpsServer';
import HttpServer from './servers/HttpServer';
import incomingFiles from './transforms/incomingFiles';
import relativeUrl from './transforms/relativeUrl';

// This index is used to support a node.js require without worrying about `default` values

export { default as create } from './commands/createServer';
export { default as default } from './commands/createServer';

export const handlers = {
	Group,
	Functional,
	filter,
	route,
	transform
};

export const middleware = {
	ServeDirectory,
	ServeFile,
	WebApplication,
	WebProxy
};

export const servers = {
	HttpServer,
	HttpsServer
};

export const transforms = {
	incomingFiles,
	relativeUrl
};

export const util = {
	proxies
};
