http = require('http');
path = require('path');
webserv = require('./');

directory = path.resolve('./_dist/tests/integration/assets');
console.log(directory);
webserv.create({
	debugLevel: 'debug',
	directory,
	start: true
}).then((server) => {
	request = http.request('http://localhost:8888', (response) => {
		console.log(`STATUS: ${response.statusCode}`);
		console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
	});
	request.end();
});
