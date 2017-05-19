import WebServer from './WebServer';
import ServeFile from './middleware/ServeFile';
import ServeDirectory from './middleware/ServeDirectory';

/**
 * Basic CLI support used to start a server that serves files and a directory index of the current directory
 */
export default function () {
	const server = new WebServer();
	server.app.middleware
		.add(new ServeFile())
		.add(new ServeDirectory());
	server.start();
	console.log(`started server on ${ server.config.port }`);
}
