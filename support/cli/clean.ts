/*
 * Clean the build
 */

import { distDirectory } from '../common';
const shell = require('shelljs');

const commands = {
	dist() {
		shell.rm('-rf', distDirectory);
	},

	'default': 'dist'
};

export default commands;
