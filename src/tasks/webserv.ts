import createServer, { Config } from '../commands/createServer';
import IMultiTask = grunt.task.IMultiTask;
import { log } from '../log';
import { inspect } from 'util';

/**
 * A Grunt MultiTask that will start a server
 *
 * Configuration is passed directly from grunt to create a webserv
 */
export = function (grunt: IGrunt) {
	grunt.registerMultiTask('webserv', function (this: IMultiTask<Config>) {
		const done = this.async();
		createServer(this.data)
			.then((server) => {
				server.on('stopped', done);
				log.debug(`Grunt configuration: ${ inspect(this.data, { depth: 3 }) }`);
				server.start().then(function (state) {
					log.info(`Server started on port ${ server.port }`);
				}, done);
			}, done);
	});
};
