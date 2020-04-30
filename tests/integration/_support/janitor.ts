/// <reference types="intern" />
import { after, afterEach } from 'intern/lib/interfaces/tdd';
import { ServerControls } from 'src/core/servers/startServer';

export interface Handle {
	destroy(): Promise<void> | void;
}

export function createJanitor(cleans: 'after' | 'afterEach' = 'after') {
	const handles: Handle[] = [];

	if (cleans === 'afterEach') {
		afterEach(() => clean());
	} else {
		after(() => clean());
	}

	async function clean() {
		for (const handle of handles) {
			await handle.destroy();
		}
	}

	return {
		track(...items: Handle[]) {
			handles.push(...items);
		},
		clean
	};
}

export function wrapServers(controls: ServerControls): Handle {
	return {
		destroy() {
			return controls.stop();
		}
	};
}
