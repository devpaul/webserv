require('ts-node').register({
	'extends': './tsconfig.json',
	'compilerOptions': {
		module: 'commonjs',
		target: 'es6'
	}
});

module.exports = require('./support/grunt');
