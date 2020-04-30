/// <reference types="intern" />
import Ajv from 'ajv';
import { relative } from 'path';
import { inspect } from 'util';
import { examples, projectRoot, servers } from './_support/config';

const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');

describe('schema validations', () => {
	const ajv = new Ajv();
	const validate = ajv.compile(require(projectRoot('webserv.schema.json')));
	const configs = [
		servers('webserv-file-server.json'),
		examples('/crud/', 'webserv.json'),
		examples('/file-host/', 'webserv.json'),
		examples('/forward-to-https/', 'webserv.json'),
		examples('/hello-world/', 'webserv.json'),
		examples('/proxy/', 'webserv.json')
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
