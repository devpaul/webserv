import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

const { assert } = intern.getPlugin('chai');

export function mockResponse(box: Pick<SinonSandbox, 'mock'> = sinon) {
	return {
		writeHead: box.mock().returnsThis(),
		end: box.mock()
	};
}

export function assertHeader(response: ReturnType<typeof mockResponse>, statusCode: number, header?: object) {
	assert.deepEqual(response.writeHead.lastCall.args, [ statusCode, header]);
	assert.isTrue(response.end.calledOnce);
}

export function assertMessage(response: ReturnType<typeof mockResponse>, message: string) {
	assert.deepEqual(response.end.lastCall.args, [ message ]);
	assert.isTrue(response.end.calledOnce);
}
