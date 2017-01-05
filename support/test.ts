#!/usr/bin/env node

/*
 * Run tests against the site
 */

import { rootDirectory, binDirectory } from './common';
import runCommand from './commands/runCommand';
import exec from './commands/exec';
import { join } from 'path';
const shell = require('shelljs');

/*
 * Builds the documentation, tutorial, and blog site into static templates
 */
const handlers = {
	unit() {
		const internClient = join(binDirectory, 'intern-client');
		const configLocation = join('_dist', 'tests', 'intern');

		shell.cd(rootDirectory);

		return exec(`node ${ process.env.NODE_DEBUG_OPTION || '' } ${ internClient } --config=${ configLocation }`, false);
	},

	'default': 'unit'
};

runCommand(handlers);
