import createServer from '../src/commands/createServer';
import WebProxy from '../src/middleware/WebProxy';
import { setLogLevel } from '../src/log';
import { BasicServer } from '../src/servers/BasicServer';

setLogLevel('debug');

const wsProxy = new WebProxy('http://echo.websocket.org', {
	changeOrigin: true,
	ws: true
});

function startServer(server: BasicServer) {
	server.start()
		.then(() => {
			console.log('To use this example go to https://websocket.org/echo.html and');
			console.log('connect to ws://localhost:7777');
			console.log(`started server on ${ server.port }`);
		});
}

// Create a http server at http://localhost:8888
createServer({
	middleware: [
		wsProxy
	],
	port: 7777,
	upgrade: wsProxy
}).then((server) => {
	startServer(server);
});
