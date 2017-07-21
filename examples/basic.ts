import WebServer from '../src/WebServer';
import ServeFile from '../src/middleware/ServeFile';
import ServeDirectory from '../src/middleware/ServeDirectory';
import route from '../src/handlers/route';
import { noCache } from '../src/middleware/SetHeaders';

const server = new WebServer();

server.app.middleware.add([
	route('/*').wrap([
		noCache(),
		new ServeFile('./_dist'),
		new ServeDirectory('./_dist')
	])
]);

server.start()
	.then(function () {
		console.log(`started server on ${ server.config.port }`);
	});
