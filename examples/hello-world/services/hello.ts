import { ServiceLoader } from '../../../src/config/loader';
import { Service } from '../../../src/core/app';
import { method } from '../../../src/core/guards/method';
import { pathGuard } from '../../../src/core/guards/path';
import { textTransform } from '../../../src/core/transforms/text.transform';
import { getParams } from '../../../src/core/util/request';

export interface Config {
	route?: string;
}

/**
 * This is my custom hello-world service
 *
 * APIs:
 *
 * GET /hello/world - returns a hello world message
 * GET /hello/person - returns a hello person message
 * GET /hello/webserv - returns a hello webserv message
 * GET /hello/:thing - returns a hello to the passed thing
 * GET * - returns usage instructions
 */
const hello: ServiceLoader<Config> = ({ route = '/*' }) => {
	const service: Service = {
		route: {
			guards: [pathGuard({ match: route })],
			transforms: [textTransform],
			middleware: [
				{
					guards: [pathGuard({ match: '/hello/*' })],
					middleware: [
						{
							guards: [method.get('/world')],
							middleware: () => ['Hello, world!']
						},
						{
							guards: [method.get('/person')],
							middleware: () => ['Hello, person!']
						},
						{
							guards: [method.get('/webserv')],
							middleware: () => ['Hello, webserv!']
						},
						{
							guards: [method.get('/:thing')],
							middleware: (request) => {
								const { params } = getParams(request, 'params');
								return [`Hello, ${params.thing}`];
							}
						}
					]
				},
				{
					guards: [method.get()],
					middleware: () => [`use ${route}hello/{world, person, webserv}`]
				}
			]
		}
	};
	return service;
};

export default hello;
