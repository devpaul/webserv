import { json, OptionsJson } from 'body-parser';
import { ProcessFactory } from '../../../core/interface';

export const body: ProcessFactory<OptionsJson> = (options) => {
	const bodyParser = json(options);
	return (request, response) => {
		return new Promise((resolve, reject) => {
			bodyParser(request, response, (err) => {
				err ? reject(err) : resolve();
			});
		});
	};
};
