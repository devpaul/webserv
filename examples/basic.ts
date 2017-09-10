import { noCache } from '../src/middleware/SetHeaders';
import createServer, { ServerType } from '../src/commands/createServer';
import LogRequest from '../src/middleware/LogRequest';

// Create a http server at http://localhost:8888
createServer({
	type: ServerType.HTTP,
	directory: './_dist',
	middleware: [
		noCache()
	],
	start: true
}).then((server) => {
	console.log(`started server on ${ server.port }`);
});

// create a https server at https://localhost:9999
createServer({
	type: ServerType.HTTPS,
	directory: './_dist',
	middleware: [
		new LogRequest(),
		noCache()
	],
	port: 9999,
	start: true
}).then((server) => {
	console.log(`started server on ${ server.port }`);
});
