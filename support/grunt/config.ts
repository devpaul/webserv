export const targetDirectory = '_dist';

export const srcDirectory = '<%= targetDirectory %>/src';

export const testsDirectory = '<%= targetDirectory %>/tests';

export const clean = {
	build: ['<%= targetDirectory %>']
};

export const copy = {
	packageFiles: {
		expand: true,
		src: [ 'package.json', 'README.md', 'LICENSE' ],
		dest: '<%= srcDirectory %>'
	}
};

export const shell = {
	'build-src': {
		command: './node_modules/.bin/tsc',
			options: {
			execOptions: {
				cwd: process.cwd()
			}
		}
	},

	'build-tests': {
		command: './node_modules/.bin/tsc -p tsconfig.tests.json',
		options: {
			execOptions: {
				cwd: process.cwd()
			}
		}
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
