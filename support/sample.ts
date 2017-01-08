import WebServer from '../_dist/src/WebServer';
import ServeFile from '../_dist/src/middleware/ServeFile';
import ServeDirectory from '../_dist/src/middleware/ServeDirectory';
import Proxy from '../_dist/src/middleware/Proxy';
import Group from '../_dist/src/handlers/Group';
import WebApplication from '../_dist/src/WebApplication';
import { filter } from '../_dist/src/handlers/filter';
import { ServerResponse } from 'http';
import { IncomingMessage } from 'http';

const server = new WebServer();
const group: Group = <Group> (<WebApplication> server.app).middleware;
group.add(filter(function (_request: IncomingMessage, response: ServerResponse) {
	console.log('Ugh. favicon!');
	response.statusCode = 404;
	response.end();
	return Promise.resolve('skip');
}, '/favicon.ico'));
group.add(new ServeFile('./_dist'));
group.add(new ServeDirectory('./_dist'));
group.add(new Proxy('https://devpaul.com'));
server.start();
console.log(`started server on ${ server.config.port }`);
