import { runCommands } from '../commands/runCommand';

/*
 * Build for Continuous Integration
 */

const commands = {
	'default'() {
		return runCommands(
			'clean',
			'build',
			'test',
			'package'
		);
	}
};

export default commands;
