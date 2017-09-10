import registerSuite from 'intern/lib/interfaces/object';
import * as webserv from 'src/tasks/webserv';
import * as sinon from 'sinon';

let taskMock: any;

registerSuite('src/tasks/webserv', {
	beforeEach() {
		taskMock = {
			data: { },
			done: sinon.spy(function () {
				return sinon.stub();
			})
		};
	},

	tests: {
		construction: {
			'default'() {
				const grunt = {
					registerMultiTask: sinon.stub()
				};
				webserv.call(taskMock, grunt);
			}
		}
	}
});
