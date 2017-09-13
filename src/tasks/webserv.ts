import createServer, { Config } from '../commands/createServer';
import IMultiTask = grunt.task.IMultiTask;
import { log } from '../log';
import { inspect } from 'util';
import { BasicServer, ServerState } from '../servers/BasicServer';

const servers: BasicServer[] = [];

/**
 * A Grunt MultiTask that will start a server
 *
 * Configuration is passed directly from grunt to create a webserv
 */
export = function (grunt: IGrunt) {
	grunt.registerMultiTask('webserv', function (this: IMultiTask<Config>) {
		function onFail(error: Error) {
			grunt.fail.warn(`Failed to start server ${ error.message }`);
		}

		const done = this.async();
		// If true then wait until the server stops to resolve the task; otherwise close the server on process exit
		const shouldWait = (<any> this.data).wait !== false;

		createServer(this.data)
			.then((server) => {
				log.debug(`Grunt configuration: ${ inspect(this.data, { depth: 3 }) }`);
				servers.push(server);

				if (shouldWait) {
					server.on('StateChange', (state: string) => {
						if (state === ServerState.STOPPED) {
							done();
						}
					});
				}

				if (server.state !== ServerState.LISTENING) {
					server.start().then(function () {
						log.info(`Server started on port ${ server.port }`);
						grunt.event.emit('startedServer', server);
						!shouldWait && done();
					}, onFail);
				}
				else {
					!shouldWait && done();
				}
			}, onFail);
	});

	grunt.registerTask('stopServers', function (this: IMultiTask<Config>) {
		const done = this.async();

		Promise.all(servers.map(server => {
			grunt.log.write(`Stopping server on port ${ server.port }`);
			return server.stop();
		})).then(done, done);
	});
};
