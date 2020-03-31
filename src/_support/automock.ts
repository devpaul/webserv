import { dirname, join, resolve } from 'path';
import sinonGlobal, { SinonSandbox } from 'sinon';
import { getCaller } from './getCaller';

function loadModule(path: string) {
	if (path.charAt(0) === '.') {
		const callerPath = getCaller();
		const callerDir = dirname(callerPath);
		return require(resolve(join(callerDir, path)));
	}
	return require(path);
}

function getNonEnumerable(source: any) {
	const keys = Object.getOwnPropertyNames(source);

	let obj: any = {};
	for (let key of keys) {
		obj[key] = source[key];
	}
	return obj;
}

export interface AutoMockOptions {
	maxDepth?: number;
	mockNonEnumerable?: boolean;
}

function automock(
	source: string | object,
	sinon: SinonSandbox = sinonGlobal,
	{ maxDepth = 2, mockNonEnumerable = false }: AutoMockOptions = {}
) {
	const mod: object = typeof source === 'string' ? loadModule(source) : source;

	if (maxDepth <= 0) {
		return mod;
	}

	const obj: any = { original: {} };
	const toMock = mockNonEnumerable ? { ...mod, ...getNonEnumerable(mod) } : mod;
	for (let [key, value] of Object.entries(toMock)) {
		if (typeof value === 'function') {
			obj[key] = sinon.stub();
			obj.original[key] = value;
		} else if (typeof value === 'object' && value) {
			obj[key] = automock(value, sinon, { maxDepth: maxDepth - 1 });
			obj.original[key] = value;
		} else {
			obj[key] = value;
		}
	}

	return obj;
}

export function automockInstance(instance: object, sinon: SinonSandbox = sinonGlobal, options?: AutoMockOptions) {
	return {
		...automock(instance, sinon, options),
		...automock(Object.getPrototypeOf(instance), sinon, { ...options, mockNonEnumerable: true })
	};
}

export default automock;
