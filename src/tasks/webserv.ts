import createServer, { Config } from '../commands/createServer';
import IMultiTask = grunt.task.IMultiTask;

export = function (grunt: IGrunt) {
	grunt.registerMultiTask('webserv', function (this: IMultiTask<Config>) {
		const done = this.async();
		const server = createServer(this.data);
		console.log(this.data);
		server.start().then(function (state) {
			console.log(`Server started on port ${ server.port }`);
			state.closed.then(done);
		}, done);
	});
};
