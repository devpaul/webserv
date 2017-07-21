import * as config from './config';

const webservTask = require('../../src/tasks/webserv');

export = function (grunt: IGrunt) {
	require('load-grunt-tasks')(grunt);
	grunt.loadNpmTasks('intern');
	webservTask(grunt);

	grunt.initConfig(config);

	grunt.registerTask('build', [ 'shell:build-src', 'copy:packageFiles' ]);
	grunt.registerTask('ci', [ 'dev' ]);
	grunt.registerTask('dev', [ 'clean', 'tslint', 'build', 'test' ]);
	grunt.registerTask('test', [ 'shell:build-tests', 'intern' ]);
};
