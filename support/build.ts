#!/usr/bin/env node

import { rootDirectory } from './common';
import exec from './commands/exec';
import runCommand from './commands/runCommand';
const shell = require('shelljs');

/*
 * Builds the documentation, tutorial, and blog site into static templates
 */
const handlers = {
	all() {
		return handlers.src()
			.then(function () {
				return handlers.tests();
			});
	},

	src() {
		console.log('building src');
		shell.cd(rootDirectory);

		return exec('tsc');
	},

	tests() {
		console.log('building tests');
		shell.cd(rootDirectory);
		return exec(`tsc -p tsconfig.tests.json`);
	},

	'default': 'all'
};

runCommand(handlers);
