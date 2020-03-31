import * as mockery from 'mockery';
import { createSandbox, SinonSandbox } from 'sinon';

const { before, after, afterEach } = intern.getPlugin('interface.bdd');

export function startMocking(mocks: { [key: string]: any }, allowable: string[] = []) {
	mockery.enable({
		useCleanCache: true,
		warnOnUnregistered: false
	});

	for (let [name, mock] of Object.entries(mocks)) {
		mockery.registerMock(name, mock);
	}
	mockery.registerAllowables(allowable);

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

export function setupMocks(mocks: { [key: string]: any }, allowable: string[] = []) {
	before(() => {
		startMocking(mocks, allowable);
	});

	after(() => {
		stopMocking();
	});
}
