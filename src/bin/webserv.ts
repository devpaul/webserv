#!/usr/bin/env node

const cli = require('../cli').default;

cli().catch((err: Error) => {
	console.error('failed to start webserv');
	console.error(`reason: ${ err.message }`);
	console.error(err.stack);
	process.exitCode = 1;
	process.exit();
});
