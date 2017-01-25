export = function (grunt: IGrunt) {
	grunt.loadTasks('./_dist/src/tasks');
	grunt.initConfig({
		webserv: {
			server: {
				port: '8889',
				directory: '.',
				middleware: [
					function (req) {
						console.log(`REQUEST ${ req.url }`);
					}
				]
			}
		}
	});
}
