/// <reference types="intern" />
import { after, beforeEach } from 'intern/lib/interfaces/tdd';
import { setLogLevel } from '../../../src/core/log';

export function testLogLevel(level: string) {
	beforeEach(async () => {
		setLogLevel(level);
	});

	after(() => {
		setLogLevel('warn');
	});
}
