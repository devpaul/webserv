export const proxyPort = 9000;

export const proxyUrl = 'http://localhost:9000';

export const maxConcurrency = 1;

export const loaderOptions = {
	packages: [
		{ name: 'src', location: './_dist/src' },
		{ name: 'tests', location: './_dist/tests' }
	],
	map: {
		'tests': {
			// map the absolute module `src` so that it uses
			// the srcLoader to get a relative commonjs library
			'src': 'tests/srcLoader!../src',
			// ensure the `dojo` being used in the tests is the
			// same `dojo` being used by the commonjs library
			// with the exception of `dojo/node`
			'dojo': 'intern/dojo/node!dojo',
			'intern/dojo/node': 'intern/browser_modules/dojo/node',

			'fs': 'intern/dojo/node!fs',
			'path': 'intern/dojo/node!path',
			'util': 'intern/dojo/node!util',
			'url': 'intern/dojo/node!url',
			'https': 'intern/dojo/node!https',
			'shelljs': 'intern/dojo/node!shelljs',
			'mockery': 'intern/dojo/node!mockery'
		},
		'tests/srcLoader': {
			'src': 'src'
		}
	}
};

export const loaders = {
	'host-browser': 'node_modules/dojo-loader/loader.js',
	'host-node': 'dojo-loader'
};

export const reporters = [ 'Console' ];

export const suites = [
	'tests/unit/all'
];

export const functionalSuites: string[] = [];
export const excludeInstrumentation = /^(?:_dist\/tests|node_modules)\//;
