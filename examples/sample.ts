import HttpServer from '../src/core/servers/HttpServer';
import route, { IncomingRoute } from '../src/core/handlers/route';
import NotFound from '../src/core/middleware/NotFound';
import LogRequest from '../src/core/middleware/LogRequest';
import Forwarder from '../src/core/middleware/Forwarder';
import { noCache } from '../src/core/middleware/SetHeaders';
import { setLogLevel } from '../src/core/log';
import { IncomingMessage, ServerResponse } from 'http';
import WebApplication from '../src/core/middleware/WebApplication';
import ServePath from '../src/core/middleware/ServePath';

const server = new HttpServer({
	port: 7777
}, new WebApplication());

const notFound = new NotFound();

// Set logging to debug for more verbose output
setLogLevel('debug');

function echoRoute(request: IncomingRoute, response: ServerResponse) {
	response.write(`You said ${ request.params.words }`);
	response.end();
}

function landingPage(request: IncomingMessage, response: ServerResponse) {
	if (response.finished) {
		return;
	}

	response.end(`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Welcome</title>
</head>
<body>
<ul>
	<li><a href="/dist">Serve Path</a></li>
	<li><a href="/forward">Forwarding</a></li>
	<li><a href="/echo/hello_world">Echo parameters</a></li>
</ul>
</body>
</html>
`);
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
		// If a matching file exists in _dist; serve it or list directory contents
		new ServePath({ basePath: './_dist' }),
		// If none of the above handlers match; return a 404
		notFound
	]),
	route('/echo/:words').wrap(echoRoute),
	route('/').wrap(landingPage)
]);

server.start();
console.log(`started server on ${ server.port }`);
