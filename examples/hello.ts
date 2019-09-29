import { App } from '../src/core/app';
import { route } from '../src/core/routes/route';
import { method } from '../src/core/guards/method';
import { pathGuard } from '../src/core/guards/path';
import { getParams } from '../src/core/util/request';
import { textTransform } from '../src/core/transforms/text.transform';

const app = new App();
app.routes.push(route({
	guards: [ pathGuard({ match: '/hello/*' }) ],
	middleware: [
		route({
			guards: [ method.get('world') ],
			middleware: () => {
				return 'Hello, world!'
			}
		}),
		route({
			guards: [ method.get('person') ],
			middleware: () => {
				return 'Hello, person!'
			}
		}),
		route({
			guards: [ method.get('webserv') ],
			middleware: () => {
				return 'Hello, webserv!'
			}
		}),
		route({
			guards: [ method.get(':thing') ],
			middleware: (request) => {
				const { params } = getParams(request, 'params');
				return `Hello, ${ params.thing }`;
			}
		})
	],
}))
app.routes.push(route({
	guards: [ method.get() ],
	middleware: () => {
		return 'use /hello/{world, person, webserv}'
	}
}));
app.transforms.push(textTransform);
app.start('http', { port: 8888 });
