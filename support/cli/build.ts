import exec from '../commands/exec';

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
		return exec('tsc');
	},

	tests() {
		console.log('building tests');
		return exec(`tsc -p tsconfig.tests.json`);
	},

	'default': 'all'
};

export default commands;
