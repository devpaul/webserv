import { describe } from 'intern/lib/interfaces/bdd';
import { relative as relativePath, resolve } from 'path';
import { getCaller } from './getCaller';

const SPEC_TEST_EXT_LEN = '.spec.ts'.length;

function relative(path: string) {
	const base = resolve(__dirname, '..');
	return relativePath(base, path);
}

function trimSpec(path: string) {
	if (path.indexOf('.spec') === path.length - SPEC_TEST_EXT_LEN) {
		return path.slice(0, path.indexOf('.spec')) + path.slice(-3);
	}
	return path;
}

/**
 * Automatically generates the module under test's filename
 *
 * @param cb a callback for the describe method
 */
export function describeSuite(cb: () => void) {
	const moduleName = trimSpec(relative(getCaller()));
	describe(moduleName, cb);
}
