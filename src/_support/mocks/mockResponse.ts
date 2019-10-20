import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';

export function mockResponse(box: Pick<SinonSandbox, 'mock'> = sinon) {
	return {
		writeHead: box.mock().returnsThis(),
		end: box.mock()
	};
}
