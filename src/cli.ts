import WebServer from './WebServer';
import ServeFile from './middleware/ServeFile';
import ServeDirectory from './middleware/ServeDirectory';

const server = new WebServer();
server.app.middleware
	.add(new ServeFile())
	.add(new ServeDirectory());
server.start();
console.log(`started server on ${ server.config.port }`);
