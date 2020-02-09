import { start } from '..';

start({
	services: [
		{
			name: 'log',
			level: 'info'
		},
		{
			name: 'chat'
		}
	]
});
