import createServer, { ServerType } from './commands/createServer';

/**
 * Basic CLI support used to start a server that serves files and a directory index of the current directory
 */
export default async function () {
	const server = await createServer({
		type: ServerType.HTTP,
		directory: process.cwd()
	});
	server.start();
	console.log(`started server on ${ server.port }`);
}
