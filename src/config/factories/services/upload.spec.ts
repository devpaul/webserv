/// <reference types="intern" />

import { Service } from '../../../core/app';
import { describeSuite } from '../../../_support/describeSuite';
import { $Env, Environment } from '../../utils/environment';
import { uploadServiceFactory } from './upload';

const { assert } = intern.getPlugin('chai');
const { it } = intern.getPlugin('interface.bdd');

const env: Environment = {
	configPath: '.'
};

describeSuite(() => {
	it('Adds an upload route', async () => {
		const config = {
			route: '*',
			directory: '.',
			[$Env]: env
		};
		const service = (await uploadServiceFactory(config)) as Service;
		assert.isDefined(service.route);
	});
});
