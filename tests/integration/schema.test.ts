/// <reference types="intern" />
import Ajv from 'ajv';
import { inspect } from 'util';

const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('schema validations', () => {
	const ajv = new Ajv();
	const validate = ajv.compile(require('../../webserv.schema.json'));
	const configs = [
		'./_assets/webserv_config1.json',
		'./_assets/webserv_crud.json',
		'./_assets/webserv_multiple_services.json',
		'./_servers/external/webserv.json'
	];

	for (let config of configs) {
		it(`validate ${config}`, async () => {
			const valid = await validate(require(config));
			if (!valid) {
				assert.fail(inspect(validate.errors));
			}
		});
	}
});
