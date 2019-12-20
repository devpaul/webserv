import { log } from '../core/log';
import npm from 'npm';
import { join } from 'path';

async function loadDependencies() {
	try {
		return require('ngrok');
	} catch (e) {}

	log.info('Install dependencies for ngrok...');
	try {
		await new Promise((resolve, reject) => {
			npm.load(
				{
					'bin-links': false,
					prefix: join(__dirname, '..', '..', '..')
				},
				(err) => {
					err ? reject(err) : resolve();
				}
			);
		});
		await new Promise((resolve, reject) => {
			npm.commands.install(['ngrok'], (err) => {
				err ? reject(err) : resolve();
			});
		});
	} catch (err) {
		log.error(err.message);
	}

	console.log('\n\nsuccessfully installed ngrok');
	return require('ngrok');
}

export async function startNgrok(port: number) {
	const ngrok = await loadDependencies();

	const url = await ngrok.connect({
		addr: port
	});
	log.info(`Connected to ${url}`);
}
