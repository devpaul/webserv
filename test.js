http = require('http');
path = require('path');
webserv = require('./');

dir = './_dist/tests/integration';
d = path.resolve(path.join(dir, 'assets'));
console.log(d);
webserv.create({
	debugLevel: 'debug',
	middleware: [
		new webserv.middleware.ServeFile(d)
	],
	start: true
}).then((server) => {
	console.log('requesting...');
	request = http.request('http://localhost:8888', (response) => {
		console.log(`STATUS: ${response.statusCode}`);
		console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
		server.stop();
	});
	request.end();
});
