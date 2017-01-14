import WebServer from '../_dist/src/WebServer';
import ServeFile from '../_dist/src/middleware/ServeFile';
import ServeDirectory from '../_dist/src/middleware/ServeDirectory';
import MiddlewareProxy from '../_dist/src/middleware/Proxy';
import { filter } from '../_dist/src/handlers/filter';
import route from '../_dist/src/handlers/route';
import { ServerResponse, IncomingMessage } from 'http';
import { relativeUrl } from '../src/handlers/transform';

const server = new WebServer();
const notFoundHandler = function (request: IncomingMessage, response: ServerResponse) {
	console.log(`Not Found! ${ request.url }`);
	response.statusCode = 404;
	response.end();
	return Promise.resolve('skip');
};

server.app.middleware
	.add(filter(notFoundHandler, '/favicon.ico'))
	.add(
		route('/dist', [
			new ServeFile('./_dist'),
			new ServeDirectory('./_dist'),
			notFoundHandler
		]).transform(relativeUrl('/dist')).end())
	.add(new MiddlewareProxy('https://devpaul.com'));
server.start();
console.log(`started server on ${ server.config.port }`);
