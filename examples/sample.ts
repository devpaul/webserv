import WebServer from '../src/WebServer';
import ServeFile from '../src/middleware/ServeFile';
import ServeDirectory from '../src/middleware/ServeDirectory';
import route, { IncomingRoute } from '../src/handlers/route';
import NotFound from '../src/middleware/NotFound';
import LogRequest from '../src/middleware/LogRequest';
import Forwarder from '../src/middleware/Forwarder';
import { noCache } from '../src/middleware/SetHeaders';
import { setLogLevel } from '../src/log';
import { ServerResponse } from 'http';

const server = new WebServer();
const notFound = new NotFound();

// Set logging to debug for more verbose output
setLogLevel('debug');

function echoRoute(request: IncomingRoute, response: ServerResponse) {
	response.write(`You said ${ request.params.words }`);
	response.end();
}

server.app.middleware.add([
	// Log requests to the console
	new LogRequest(),
	// no favicon.ico
	route('/favicon.ico').wrap(notFound),
	// forward requests to /forward to /dist
	route('/forward').wrap(new Forwarder('/dist')),
	// string-based routes automatically update url relative to the matched route
	route('/dist(.*)').wrap([
		// ensure the content isn't cached
		noCache(),
		// If a matching file exists in _dist; serve it
		new ServeFile('./_dist'),
		// Otherwise if the request is a directory; list the contents
		new ServeDirectory('./_dist'),
		// If none of the above handlers match; return a 404
		notFound
	]),
	route('/echo/:words').wrap(echoRoute)
]);

server.start();
console.log(`started server on ${ server.config.port }`);
