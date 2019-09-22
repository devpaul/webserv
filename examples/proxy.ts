import createServer from '../src/configuration/createServer';
import WebProxy from '../src/core/middleware/WebProxy';
import { setLogLevel } from '../src/core/log';

setLogLevel('debug');

const wsProxy = new WebProxy('http://echo.websocket.org', {
	changeOrigin: true,
	ws: true
});

// Create a http server at http://localhost:8888
createServer({
	middleware: [
		wsProxy
	],
	port: 7777,
	start: true,
	upgrade: wsProxy
}).then((server) => {
	console.log('To use this example go to https://websocket.org/echo.html and');
	console.log('connect to ws://localhost:7777');
	console.log(`started server on ${ server.port }`);
});
