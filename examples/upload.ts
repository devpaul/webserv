import { noCache } from '../src/core/middleware/SetHeaders';
import createServer from '../src/configuration/createServer';
import Branch, { methodResolver } from '../src/core/handlers/Branch';
import SaveFiles from '../src/core/middleware/SaveFiles';
import UploadPage from '../src/core/pages/UploadPage';
import NotFound from '../src/core/middleware/NotFound';
import route from '../src/core/handlers/route';
import incomingFiles from '../src/core/transforms/incomingFiles';
import { join } from 'path';
import { ServerType } from 'src/core/interface';

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
