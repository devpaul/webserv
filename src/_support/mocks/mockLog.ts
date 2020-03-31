import sinonGlobal from 'sinon';

export function mockLog(sandbox = sinonGlobal) {
	return {
		error: sandbox.stub(),
		warn: sandbox.stub(),
		help: sandbox.stub(),
		data: sandbox.stub(),
		info: sandbox.stub(),
		debug: sandbox.stub(),
		prompt: sandbox.stub(),
		verbose: sandbox.stub(),
		input: sandbox.stub(),
		silly: sandbox.stub(),

		emerg: sandbox.stub(),
		alert: sandbox.stub(),
		crit: sandbox.stub(),
		warning: sandbox.stub(),
		notice: sandbox.stub()
	};
}
