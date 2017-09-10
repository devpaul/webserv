import registerSuite from 'intern/lib/interfaces/object';
import { assert } from 'chai';
import { SinonStub, stub } from 'sinon';
import { cleanupMockModules, loadMockModule } from '../_support/mocks';

let command: Function;
let createCertificate: SinonStub;

registerSuite('src/commands/buildCert', {
	async before() {
		createCertificate = stub();
		command = await loadMockModule<Function>('../../../src/commands/buildCert', {
			'pem': {
				createCertificate
			}
		});
		console.log(command);
	},

	beforeEach() {
		createCertificate.reset();
	},

	after() {
		cleanupMockModules();
	},

	tests: {
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
	}
});
