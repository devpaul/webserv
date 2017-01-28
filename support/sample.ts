import WebServer from '../_dist/src/WebServer';
import ServeFile from '../_dist/src/middleware/ServeFile';
import ServeDirectory from '../_dist/src/middleware/ServeDirectory';
import MiddlewareProxy from '../_dist/src/middleware/Proxy';
import { proxy as filter } from '../_dist/src/handlers/filter';
import route from '../_dist/src/handlers/route';
import { relativeUrl } from '../src/handlers/transform';
import NotFound from '../src/middleware/NotFound';
import LogRequest from '../src/middleware/LogRequest';
import Forwarder from '../src/middleware/Forwarder';
import { noCache } from '../src/middleware/SetHeaders';

const server = new WebServer();
const notFound = new NotFound();

server.app.middleware.add([
	new LogRequest(),
	filter(notFound, '/favicon.ico'),
	route('/forward').wrap(new Forwarder('/dist')),
	route('/dist').transform(relativeUrl('/dist')).wrap([
		noCache(),
		new ServeFile('./_dist'),
		new ServeDirectory('./_dist'),
		notFound
	]),
	new MiddlewareProxy('https://devpaul.com')
]);
server.start();
console.log(`started server on ${ server.config.port }`);
