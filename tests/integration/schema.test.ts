/// <reference types="intern" />
import Ajv from 'ajv';
import { join, relative } from 'path';
import { inspect } from 'util';
import { examples } from './_support/config';

const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('schema validations', () => {
	const ajv = new Ajv();
	const validate = ajv.compile(require('../../webserv.schema.json'));
	const configs = [
		'./_assets/webserv_config1.json',
		'./_assets/webserv_multiple_services.json',
		join(examples, '/crud/', 'webserv.json'),
		join(examples, '/file-host/', 'webserv.json'),
		join(examples, '/hello-world/', 'webserv.json')
	];

	for (let config of configs) {
		it(`validate ${relative(__dirname, config)}`, async () => {
			const valid = await validate(require(config));
			if (!valid) {
				assert.fail(inspect(validate.errors));
			}
		});
	}
});
