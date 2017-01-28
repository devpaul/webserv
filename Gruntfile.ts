require('ts-node/register');
const webservTask = require('./src/tasks/webserv');

export = function (grunt: IGrunt) {
	webservTask(grunt);
	grunt.initConfig({
		webserv: {
			server: {
				port: '8889',
				directory: '.',
				middleware() {
					return [
						function (req) {
							console.log(`REQUEST ${ req.url }`);
						}
					];
				}
			}
		}
	});
};
