import * as path from 'path';

export const targetDirectory = '_dist';

export const srcDirectory = '<%= targetDirectory %>/src';

export const testsDirectory = '<%= targetDirectory %>/tests';

export const examplesDirectory = '<%= targetDirectory %>/examples';

export const binDirectory = path.resolve('node_modules/.bin');

export const clean = {
	build: ['<%= targetDirectory %>'],
	js: [ 'src/**/*.js' ]
};

export const copy = {
	packageFiles: {
		expand: true,
		src: [ 'package.json', 'README.md', 'LICENSE' ],
		dest: '<%= srcDirectory %>'
	},

	testAssets: {
		expand: true,
		cwd: 'tests',
		src: [ '**/*', '!**/*.ts' ],
		dest: '<%= testsDirectory %>'
	}
};

export const intern = {
	unit: {
		options: {
			runType: 'client',
			config: '<%= testsDirectory %>/intern',
			reporters: [
				'Console', 'LcovHtml'
			]
		}
	}
};

export const shell = {
	'build-src': {
		command: '<%= binDirectory %>/tsc',
			options: {
			execOptions: {
				cwd: process.cwd()
			}
		}
	},

	'build-tests': {
		command: '<%= binDirectory %>/tsc',
		options: {
			execOptions: {
				cwd: 'tests'
			}
		}
	},

	'build-examples': {
		command: '<%= binDirectory %>/tsc',
		options: {
			execOptions: {
				cwd: 'examples'
			}
		}
	}
};

export const tslint = {
	options: {
		configuration: 'tslint.json'
	},
	src: 'src/**/*.ts',
	support: 'support/**/*.ts',
	tests: 'tests/**/*.ts'
};

export const webserv = {
	server: {
		port: '8889',
			directory: '.',
			middleware() {
			return [
				function (req: any) {
					console.log(`REQUEST ${ req.url }`);
				}
			];
		}
	}
};
