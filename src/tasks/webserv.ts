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
		const server = createServer(this.data);
		log.debug(`Grunt configuration: ${ inspect(this.data, { depth: 3 }) }`);
		server.start().then(function (state) {
			log.info(`Server started on port ${ server.port }`);
			state.closed.then(done);
		}, done);
	});
};
