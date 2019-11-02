import * as mockery from 'mockery';
import { createSandbox, SinonSandbox } from 'sinon';

const { before, after, afterEach } = intern.getPlugin('interface.bdd');

export function startMocking(mocks: { [key: string]: any }) {
	mockery.enable({
		useCleanCache: true,
		warnOnUnregistered: false
	});

	for (let [name, mock] of Object.entries(mocks)) {
		mockery.registerMock(name, mock);
	}

	return mocks;
}

export function stopMocking() {
	mockery.deregisterAll();
	mockery.disable();
}

export function setupSinon(sinon: SinonSandbox = createSandbox()) {
	afterEach(() => {
		sinon.resetHistory();
	});

	after(() => {
		sinon.restore();
	});

	return sinon;
}

export function setupMocks(mocks: { [key: string]: any }) {
	before(() => {
		startMocking(mocks);
	});

	after(() => {
		stopMocking();
	});
}
