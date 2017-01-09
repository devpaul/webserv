import { rootDirectory, distDirectory } from '../common';
import { join as pathJoin } from 'path';
const shell = require('shelljs');

const commands = {
	'package'() {
		shell.cp(pathJoin(rootDirectory, 'LICENSE'), pathJoin(distDirectory, 'src', 'LICENSE'));
		shell.cp(pathJoin(rootDirectory, 'README.md'), pathJoin(distDirectory, 'src', 'README.md'));
	},

	'default': 'package'
};

export default commands;
