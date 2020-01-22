import { resolve, relative as relativePath } from 'path';
import { describe } from 'intern/lib/interfaces/bdd';

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
 * @param path the __filename from the module
 * @param cb a callback for the describe method
 */
export function describeSuite(path: string, cb: () => void) {
	describe(trimSpec(relative(path)), cb);
}
