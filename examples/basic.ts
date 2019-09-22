import { noCache } from '../src/core/middleware/SetHeaders';
import createServer from '../src/configuration/createServer';
import LogRequest from '../src/core/middleware/LogRequest';
import { ServerType } from 'src/core/interface';

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
