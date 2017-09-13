import { assert } from 'chai';
import registerSuite from 'intern/lib/interfaces/object';
import * as webserv from 'src/tasks/webserv';
import { SinonStub, spy, stub } from 'sinon';

let taskMock: any;
let grunt: IGrunt;

registerSuite('src/tasks/webserv', {
	beforeEach() {
		grunt = <any> {
			event: {
				emit: stub()
			},
			fail: {
				warn: stub()
			},
			log: {
				write: stub()
			},
			registerMultiTask: stub(),
			registerTask: stub()
		};
		taskMock = {
			data: { },
			done: spy(function () {
				return stub();
			})
		};
		webserv.call(taskMock, grunt);
	},

	tests: {
		construction: {
			'default'() {
				assert.isTrue((<SinonStub> grunt.registerMultiTask).calledOnce);
				assert.isTrue((<SinonStub> grunt.registerTask).calledOnce);
				assert.strictEqual((<SinonStub> grunt.registerMultiTask).firstCall.args[0], 'webserv');
				assert.strictEqual((<SinonStub> grunt.registerTask).firstCall.args[0], 'stopServers');
			}
		}
	}
});
