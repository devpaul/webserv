import { runCommands } from '../commands/runCommand';

/*
 * Build for Continuous Integration
 */

const commands = {
	'default'() {
		return runCommands(
			'build',
			'test'
		);
	}
};

export default commands;
