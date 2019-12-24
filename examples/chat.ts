import start from '../src/config';

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
