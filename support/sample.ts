import WebServer from '../_dist/src/WebServer';
import ServeFile from '../_dist/src/middleware/ServeFile';
import ServeDirectory from '../_dist/src/middleware/ServeDirectory';
import { proxy as filter } from '../_dist/src/handlers/filter';
import route from '../_dist/src/handlers/route';
import NotFound from '../src/middleware/NotFound';
import LogRequest from '../src/middleware/LogRequest';
import Forwarder from '../src/middleware/Forwarder';
import { noCache } from '../src/middleware/SetHeaders';
import { setLogLevel } from '../src/log';

const server = new WebServer();
const notFound = new NotFound();

setLogLevel('debug');

server.app.middleware.add([
	new LogRequest(),
	filter(notFound, '/favicon.ico'),
	route('/forward').wrap(new Forwarder('/dist')),
	// string-based routes automatically update url relative to the matched route
	route('/dist(.*)').wrap([
		noCache(),
		new ServeFile('./_dist'),
		new ServeDirectory('./_dist'),
		notFound
	])
]);
server.start();
console.log(`started server on ${ server.config.port }`);
