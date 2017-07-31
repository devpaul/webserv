import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { SinonStub, stub } from 'sinon';
import { cleanupMockModules, loadMockModule } from '../_support/mocks';

let command: Function;
let createCertificate: SinonStub;

registerSuite({
	name: 'src/commands/buildCert',

	async setup() {
		createCertificate = stub();
		command = await loadMockModule<Function>('src/commands/buildCert', {
			'pem': {
				createCertificate
			}
		});
		console.log(command);
	},

	beforeEach() {
		createCertificate.reset();
	},

	teardown() {
		cleanupMockModules();
	},

	async 'creates a certificate'() {
		const expected = { certificate: Symbol(), clientKey: Symbol() };
		const promise = command();
		const callback: any = createCertificate.lastCall.args[1];
		callback(null, expected);

		assert.strictEqual(await promise, expected);
	},

	async 'handles error'() {
		const expected = new Error();
		const promise = command().then(assert.fail, (e: any) => e);
		const callback: any = createCertificate.lastCall.args[1];
		callback(expected, Symbol());

		assert.strictEqual(await promise, expected);
	}
});
