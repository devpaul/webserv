import exec from '../commands/exec';
import { rootDirectory, distDirectory } from '../common';
import { join as pathJoin } from 'path';
import { writeFile } from 'fs';

/*
 * Builds the documentation, tutorial, and blog site into static templates
 */
const commands = {
	all() {
		return commands.src()
			.then(function () {
				return commands.tests();
			});
	},

	src() {
		console.log('building src');
		return exec('tsc')
			.then(function () {
				return commands['package.json']();
			});
	},

	'package.json'() {
		const dest = pathJoin(distDirectory, 'src', 'package.json');
		const pkg = require(pathJoin(rootDirectory, 'package.json'));
		pkg.main = 'index';

		return new Promise(function (resolve, reject) {
			writeFile(dest, JSON.stringify(pkg), function (err: Error) {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			})
		});
	},

	tests() {
		console.log('building tests');
		return exec(`tsc -p tsconfig.tests.json`);
	},

	'default': 'all'
};

export default commands;
