import sinonGlobal, { SinonSandbox } from 'sinon';

const { assert } = intern.getPlugin('chai');

export function mockResponse(box: Pick<SinonSandbox, 'mock'> = sinonGlobal) {
	return {
		setHeader: box.mock(),
		writeHead: box.mock().returnsThis(),
		write: box.mock().returnsThis(),
		end: box.mock()
	};
}

export function assertHeader(response: ReturnType<typeof mockResponse>, statusCode: number, header?: object) {
	assert.deepEqual(response.writeHead.lastCall.args, [statusCode, header]);
	assert.isTrue(response.end.calledOnce);
}

export function assertMessage(response: ReturnType<typeof mockResponse>, message: string) {
	assert.deepEqual(response.end.lastCall.args, [message]);
	assert.isTrue(response.end.calledOnce);
}
