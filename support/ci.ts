#!/usr/bin/env node

import { join } from 'path';
import exec from './commands/exec';

/*
 * Build for Continuous Integration
 */

exec(`ts-node ${ join(__dirname, 'build.ts') }`)
	.then(function () {
		return exec(`ts-node ${ join(__dirname, 'test.ts') }`)
	});
