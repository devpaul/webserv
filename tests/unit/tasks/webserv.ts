import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as webserv from 'src/tasks/webserv';
import * as sinon from 'sinon';

let taskMock: any;

registerSuite({
	beforeEach() {
		taskMock = {
			data: { },
			done: sinon.spy(function () {
				return sinon.stub();
			})
		};
	},

	construction: {
		'default'() {
			webserv.call(taskMock);
			assert.isTrue(true); // TODO
		}
	}
});
