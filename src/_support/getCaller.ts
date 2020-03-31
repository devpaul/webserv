import callsite from 'callsite';

export function getCaller(depth: number = 2) {
	const stack = callsite();
	let skip = stack[0].getFileName();

	for (let i = 0; i < stack.length; i++) {
		const current = stack[i].getFileName();
		if (depth > 1) {
			if (skip !== current) {
				skip = current;
				depth--;
			}
		} else if (skip !== current) {
			return current;
		}
	}
}
