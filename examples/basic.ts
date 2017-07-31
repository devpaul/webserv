import { noCache } from '../src/middleware/SetHeaders';
import createServer, { ServerType } from '../src/commands/createServer';
import LogRequest from '../src/middleware/LogRequest';

// Create a http server at http://localhost:8888
createServer({
	type: ServerType.HTTP,
	middleware: [
		noCache()
	],
	directory: './_dist'
}).then((server) => {
	server.start()
		.then(() => {
			console.log(`started server on ${ server.port }`);
		});
});

// create a https server at https://localhost:9999
createServer({
	type: ServerType.HTTPS,
	middleware: [
		new LogRequest(),
		noCache()
	],
	port: 9999,
	directory: './_dist'
}).then((server) => {
	server.start()
		.then(() => {
			console.log(`started server on ${ server.port }`);
		});
});
