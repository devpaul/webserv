import { App } from '../src/core/app';
import { method } from '../src/core/guards/method';
import { pathGuard } from '../src/core/guards/path';
import { textTransform } from '../src/core/transforms/text.transform';
import { getParams } from '../src/core/util/request';

const app = new App();
app.addService({
	global: {
		transforms: [textTransform]
	},
	services: [
		{
			guards: [pathGuard({ match: '/hello/*' })],
			middleware: [
				{
					guards: [method.get('world')],
					middleware: () => 'Hello, world!'
				},
				{
					guards: [method.get('person')],
					middleware: () => 'Hello, person!'
				},
				{
					guards: [method.get('webserv')],
					middleware: () => 'Hello, webserv!'
				},
				{
					guards: [method.get(':thing')],
					middleware: (request) => {
						const { params } = getParams(request, 'params');
						return `Hello, ${params.thing}`;
					}
				}
			]
		},
		{
			guards: [method.get()],
			middleware: () => 'use /hello/{world, person, webserv}'
		}
	]
});
app.start('http', { port: 8888 });
