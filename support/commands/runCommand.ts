import { rootDirectory } from '../common';
const shell = require('shelljs');

export interface Handler {
	(args?: any[]): Promise<void> | void;
}

export type HandlerMap = { [ key: string ]: Handler | string };

export default function run(command: string, directive: string = 'default', args: string[] = []): Promise<void> {
	return new Promise<void>(function (resolve, reject) {
		try {
			const commands: HandlerMap = require(`../cli/${ command }`).default;
			const method = getMethod(commands, directive);

			console.log(`Running ${ command }`);

			if (method) {
				shell.cd(rootDirectory);
				resolve(method(args));
			}
			else {
				listCommands(commands);
				reject(new Error('command not found'));
			}
		}
		catch (e) {
			console.error(`Command "${ command }" failed.`);
			process.exitCode = 1;
			reject(e);
		}
	});
}

export function runCommand(commandStr: string): Promise<void> {
	const [command, ... args] = commandStr.split(' ');
	const directive = (args[0] || '')[0] === '-' ? 'default' : args.shift();
	return run(command, directive, args);
}

export async function runCommands(... commands: string[]) {
	for (let i = 0; i < commands.length; i++) {
		await runCommand(commands[i]);
	}
}

function listCommands(handlers: HandlerMap): void {
	const commands = [];
	for (let name in handlers) {
		commands.push(`"${ name }"`);
	}
	commands.sort();
	console.log(`Hi. Commands are: ${ commands.join(', ') }`);
}

function getMethod(handlers: HandlerMap, directive: string): Handler {
	const method = handlers[directive || 'default'];

	if (typeof method === 'string' && method in handlers) {
		return getMethod(handlers, method);
	}
	else if (typeof method === 'function') {
		return method;
	}
}
