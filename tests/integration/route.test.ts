/// <reference types="intern" />
import { ServerControls } from '../../src/core/servers/startServer';

const { describe, it, beforeEach, afterEach } = intern.getPlugin('interface.bdd');

describe('route tests', () => {
	let controls: ServerControls | undefined;

	beforeEach(async () => {});

	afterEach(async () => {
		controls && (await controls.stop());
	});

	it('GET the root', async () => {
		// TODO implement test
	});

	it('GET a parameterized value above the root', async () => {
		// TODO implement test
	});

	it('ignores slash variations in child paths', () => {
		// TODO implement test
	});

	it('GET nested parameterized path', () => {
		// TODO implement test
	});
});
