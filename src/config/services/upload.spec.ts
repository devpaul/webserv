/// <reference types="intern" />

import { Service } from 'src/core/app';
import { Environment } from '../loader';
import { bootUploadService } from './upload';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

const env: Environment = {
	configPath: '.',
	properties: {}
};

describe('config/services/upload', () => {
	describe('bootUploadService', () => {
		it('Adds an upload route', async () => {
			const config = {
				route: '*',
				directory: '.'
			};
			const service = (await bootUploadService(config, env)) as Service;
			assert.isDefined(service.route);
		});
	});
});
