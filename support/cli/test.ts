/*
 * Run tests against the site
 */

import { binDirectory } from '../common';
import exec from '../commands/exec';
import { join } from 'path';

/*
 * Builds the documentation, tutorial, and blog site into static templates
 */
const commands = {
	unit() {
		const internClient = join(binDirectory, 'intern-client');
		const configLocation = join('_dist', 'tests', 'intern');

		return exec(`node ${ process.env.NODE_DEBUG_OPTION || '' } ${ internClient } --config=${ configLocation }`, false);
	},

	'default': 'unit'
};

export default commands;
