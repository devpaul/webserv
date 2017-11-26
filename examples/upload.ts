import { noCache } from '../src/middleware/SetHeaders';
import createServer, { ServerType } from '../src/commands/createServer';
import Branch, { methodResolver } from '../src/handlers/Branch';
import SaveFiles from '../src/middleware/SaveFiles';
import UploadPage from '../src/pages/UploadPage';
import NotFound from '../src/middleware/NotFound';
import route from '../src/handlers/route';
import incomingFiles from '../src/transforms/incomingFiles';
import { join } from 'path';

// Create a http server at http://localhost:8888
createServer({
	type: ServerType.HTTP,
	middleware: [
		noCache(),
		new Branch({
			map: {
				GET: new UploadPage(),
				POST: route().transform(incomingFiles).wrap(new SaveFiles({
					directory: join(__dirname, '_uploads'),
					createUploadDirectory: true
				}))
			},
			resolver: methodResolver
		}),
		new NotFound()
	],
	start: true
}).then((server) => {
	console.log(`started server on ${ server.port }`);
});
