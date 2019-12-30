/// <reference types="intern" />

import { App } from '../../core/app';
import { bootUploadService } from './upload';

const { assert } = intern.getPlugin('chai');
const { describe, it } = intern.getPlugin('interface.bdd');

describe('config/services/upload', () => {
	describe('bootUploadService', () => {
		it('Adds an upload route', () => {
			const app = new App();
			const config = {
				path: '*',
				directory: '.'
			};
			bootUploadService(app, config);
			assert.lengthOf(app.routes, 1);
		});
	});
});
